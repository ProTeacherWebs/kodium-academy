import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { driveConfigured, listDriveFiles } from "./drive";
import { readWorkbook } from "./xlsx";

// Файл базы знаний. `signature` меняется при изменении файла и нужна, чтобы не пересчитывать эмбеддинги зря.
// Источник — Google Drive, если заданы GOOGLE_DRIVE_FOLDER_ID и ключ сервисного аккаунта, иначе локальная папка.
export type KnowledgeFile = {
  id: string;
  signature: string;
  buffer: () => Promise<Buffer>;
  read: () => Promise<string>;
};

export type KnowledgeDoc = { id: string; text: string };

const SUPPORTED = new Set([".md", ".txt", ".pdf", ".docx", ".xlsx"]);

export const knowledgeDir = () => path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.KNOWLEDGE_DIR ?? "knowledge");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return [full];
    }),
  );
  return nested.flat();
}

async function parse(name: string, buffer: Buffer): Promise<string> {
  const ext = path.extname(name).toLowerCase();

  if (ext === ".md" || ext === ".txt") return buffer.toString("utf-8");

  if (ext === ".pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }

  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ buffer })).value;
  }

  if (ext === ".xlsx") {
    const sheets = await readWorkbook(buffer);
    return sheets
      .map((sheet) => {
        const lines = sheet.rows.map((row) =>
          sheet.headers
            .filter((h) => row[h])
            .map((h) => `${h}: ${row[h].replace(/\s*\n\s*/g, "; ")}`)
            .join(". "),
        );
        return `Таблица «${sheet.name}»\n${lines.join("\n")}`;
      })
      .join("\n\n");
  }

  return "";
}

const supported = (name: string) => {
  const base = path.basename(name);
  return SUPPORTED.has(path.extname(base).toLowerCase()) && !base.startsWith(".") && !base.startsWith("~$");
};

function makeFile(id: string, signature: string, buffer: () => Promise<Buffer>): KnowledgeFile {
  return { id, signature, buffer, read: async () => parse(id, await buffer()) };
}

async function listLocalFiles(): Promise<KnowledgeFile[]> {
  const root = knowledgeDir();
  let paths: string[];
  try {
    paths = await walk(root);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return Promise.all(
    paths.filter(supported).map(async (full) => {
      const info = await stat(full);
      return makeFile(path.relative(root, full).split(path.sep).join("/"), `${info.size}:${info.mtimeMs}`, () => readFile(full));
    }),
  );
}

export async function listKnowledgeFiles(): Promise<KnowledgeFile[]> {
  const files = driveConfigured()
    ? (await listDriveFiles()).filter((f) => supported(f.id)).map((f) => makeFile(f.id, f.signature, f.download))
    : await listLocalFiles();
  return files.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadDocuments(): Promise<KnowledgeDoc[]> {
  const files = await listKnowledgeFiles();
  const docs = await Promise.all(
    files.map(async (file) => {
      try {
        return { id: file.id, text: (await file.read()).trim() };
      } catch (error) {
        console.warn(`[knowledge] не удалось прочитать ${file.id}:`, error);
        return null;
      }
    }),
  );
  return docs.filter((d): d is KnowledgeDoc => d !== null && d.text.length > 0);
}
