import { GoogleGenAI } from "@google/genai";
import { listKnowledgeFiles } from "./documents";

export type Chunk = { source: string; text: string; vector: number[] };

const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL ?? "gemini-embedding-001";
const DIMENSIONS = 768;
const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;
const BATCH = 50;
export const TOP_K = 6;

type Index = {
  files: Map<string, { signature: string; chunks: Chunk[] }>;
  syncing: Promise<void> | null;
};

// Индекс живёт только в памяти сервера: ни БД, ни файлов-индексов. Хранится на globalThis, чтобы пережить hot reload.
const store = globalThis as typeof globalThis & { __ragIndex?: Index };
const index: Index = (store.__ragIndex ??= { files: new Map(), syncing: null });

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не задан");
  return new GoogleGenAI({ apiKey });
}

export function chunkText(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const parts: string[] = [];
      for (let i = 0; i < line.length; i += CHUNK_SIZE) parts.push(line.slice(i, i + CHUNK_SIZE));
      return parts;
    });

  const chunks: string[] = [];
  let current: string[] = [];
  let size = 0;
  for (const line of lines) {
    if (size + line.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.join("\n"));
      // небольшое перекрытие: последние строки уходят в начало следующего куска
      const tail: string[] = [];
      let tailSize = 0;
      for (let i = current.length - 1; i >= 0 && tailSize + current[i].length <= CHUNK_OVERLAP; i--) {
        tail.unshift(current[i]);
        tailSize += current[i].length;
      }
      current = tail;
      size = tailSize;
    }
    current.push(line);
    size += line.length;
  }
  if (current.length > 0) chunks.push(current.join("\n"));
  return chunks;
}

function normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

async function embed(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"): Promise<number[][]> {
  const ai = getClient();
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const response = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: texts.slice(i, i + BATCH),
      config: { taskType, outputDimensionality: DIMENSIONS },
    });
    for (const e of response.embeddings ?? []) vectors.push(normalize(e.values ?? []));
  }
  if (vectors.length !== texts.length) throw new Error("Gemini вернул неполный набор эмбеддингов");
  return vectors;
}

async function sync(): Promise<void> {
  const files = await listKnowledgeFiles();
  const present = new Set(files.map((f) => f.id));
  for (const id of index.files.keys()) if (!present.has(id)) index.files.delete(id);

  for (const file of files) {
    if (index.files.get(file.id)?.signature === file.signature) continue;
    let text: string;
    try {
      text = (await file.read()).trim();
    } catch (error) {
      console.warn(`[rag] не удалось прочитать ${file.id}:`, error);
      index.files.delete(file.id);
      continue;
    }
    const pieces = chunkText(text).map((piece) => `[${file.id}]\n${piece}`);
    const vectors = pieces.length > 0 ? await embed(pieces, "RETRIEVAL_DOCUMENT") : [];
    index.files.set(file.id, {
      signature: file.signature,
      chunks: pieces.map((piece, i) => ({ source: file.id, text: piece, vector: vectors[i] })),
    });
  }
}

// Один пересчёт за раз: параллельные запросы ждут один и тот же promise.
async function ensureIndex(): Promise<void> {
  index.syncing ??= sync().finally(() => {
    index.syncing = null;
  });
  await index.syncing;
}

export async function retrieve(question: string, topK = TOP_K): Promise<Chunk[]> {
  await ensureIndex();
  const all = [...index.files.values()].flatMap((f) => f.chunks);
  if (all.length === 0) return [];
  const [query] = await embed([question], "RETRIEVAL_QUERY");
  return all
    .map((chunk) => ({ chunk, score: chunk.vector.reduce((sum, v, i) => sum + v * query[i], 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.chunk);
}
