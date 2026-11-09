import { readFile } from "node:fs/promises";
import { JWT } from "google-auth-library";

// Источник базы знаний в Google Drive. Доступ через сервисный аккаунт: папка расшаривается на его e-mail с правом «Читатель».
export type DriveFile = { id: string; signature: string; download: () => Promise<Buffer> };

const API = "https://www.googleapis.com/drive/v3/files";
const FOLDER = "application/vnd.google-apps.folder";
const LIST_TTL_MS = 30_000;

export const driveConfigured = () =>
  Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID && (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_FILE));

type Credentials = { client_email: string; private_key: string };

async function credentials(): Promise<Credentials> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? (await readFile(process.env.GOOGLE_SERVICE_ACCOUNT_FILE!, "utf-8"));
  const parsed = JSON.parse(raw) as Partial<Credentials>;
  if (!parsed.client_email || !parsed.private_key) throw new Error("В ключе сервисного аккаунта нет client_email или private_key");
  return { client_email: parsed.client_email, private_key: parsed.private_key };
}

const store = globalThis as typeof globalThis & { __driveClient?: JWT; __driveList?: { at: number; files: Promise<DriveFile[]> } };

async function client(): Promise<JWT> {
  if (!store.__driveClient) {
    const { client_email, private_key } = await credentials();
    store.__driveClient = new JWT({ email: client_email, key: private_key, scopes: ["https://www.googleapis.com/auth/drive.readonly"] });
  }
  return store.__driveClient;
}

type ApiFile = { id: string; name: string; mimeType: string; modifiedTime: string; md5Checksum?: string };

async function listFolder(jwt: JWT, folderId: string, prefix: string): Promise<DriveFile[]> {
  const items: ApiFile[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(API);
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("fields", "nextPageToken, files(id, name, mimeType, modifiedTime, md5Checksum)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const { data } = await jwt.request<{ files: ApiFile[]; nextPageToken?: string }>({ url: url.toString() });
    items.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  const nested = await Promise.all(
    items.map(async (item): Promise<DriveFile[]> => {
      const id = prefix + item.name;
      if (item.mimeType === FOLDER) return listFolder(jwt, item.id, `${id}/`);
      return [
        {
          id,
          signature: item.md5Checksum ?? item.modifiedTime,
          download: async () => {
            const { data } = await jwt.request<ArrayBuffer>({
              url: `${API}/${item.id}?alt=media&supportsAllDrives=true`,
              responseType: "arraybuffer",
            });
            return Buffer.from(data);
          },
        },
      ];
    }),
  );
  return nested.flat();
}

// Список кэшируется на 30 секунд, чтобы каждый просмотр страницы не ходил в Google
export async function listDriveFiles(): Promise<DriveFile[]> {
  const cached = store.__driveList;
  if (cached && Date.now() - cached.at < LIST_TTL_MS) return cached.files;

  const files = client().then((jwt) => listFolder(jwt, process.env.GOOGLE_DRIVE_FOLDER_ID!, ""));
  store.__driveList = { at: Date.now(), files };
  files.catch(() => {
    if (store.__driveList?.files === files) store.__driveList = undefined;
  });
  return files;
}
