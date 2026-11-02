import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { readWorkbook } from "./xlsx";

// Файл базы знаний. `signature` меняется при изменении файла и нужна, чтобы не пересчитывать эмбеддинги зря.
// Источник (локальная папка, позже Google Drive) скрыт за listKnowledgeFiles(): остальной код его не знает.
export type KnowledgeFile = {
  id: string;
  signature: string;
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

async function parse(full: string): Promise<string> {
  const ext = path.extname(full).toLowerCase();
  const buffer = await readFile(full);

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

export async function listKnowledgeFiles(): Promise<KnowledgeFile[]> {
  const root = knowledgeDir();
  let paths: string[];
  try {
    paths = await walk(root);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    paths
      .filter((full) => {
        const name = path.basename(full);
        return SUPPORTED.has(path.extname(name).toLowerCase()) && !name.startsWith(".") && !name.startsWith("~$");
      })
      .map(async (full): Promise<KnowledgeFile> => {
        const info = await stat(full);
        return {
          id: path.relative(root, full).split(path.sep).join("/"),
          signature: `${info.size}:${info.mtimeMs}`,
          read: () => parse(full),
        };
      }),
  );
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
