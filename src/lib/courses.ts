import { readFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { cache } from "react";
import { knowledgeDir } from "./knowledge/documents";
import { type Course } from "./course-format";
import { readWorkbook } from "./knowledge/xlsx";

// Заголовки столбцов в Excel (регистр не важен) → поля курса
const columns: Record<keyof Course, string[]> = {
  slug: ["slug", "адрес", "id"],
  title: ["название", "title", "курс"],
  direction: ["направление", "direction", "категория"],
  duration: ["длительность", "срок", "duration"],
  price: ["цена", "стоимость", "price"],
  format: ["формат", "format"],
  description: ["описание", "description"],
  program: ["программа", "program", "темы"],
};

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pick(row: Record<string, string>, field: keyof Course): string {
  const aliases = columns[field];
  for (const [header, value] of Object.entries(row)) {
    if (aliases.includes(header.trim().toLowerCase())) return value;
  }
  return "";
}

// Курсы берутся из knowledge/courses.xlsx при каждом запросе: добавили строку — курс появился, удалили — пропал.
export const getCourses = cache(async (): Promise<Course[]> => {
  await connection();

  let buffer: Buffer;
  try {
    buffer = await readFile(path.join(knowledgeDir(), "courses.xlsx"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("[courses] не удалось прочитать courses.xlsx:", error);
    return [];
  }

  try {
    const [sheet] = await readWorkbook(buffer);
    const seen = new Set<string>();
    const courses: Course[] = [];
    for (const row of sheet?.rows ?? []) {
      const title = pick(row, "title");
      const slug = slugify(pick(row, "slug") || title);
      if (!title || !slug || seen.has(slug)) continue;
      seen.add(slug);
      courses.push({
        slug,
        title,
        direction: pick(row, "direction") || "Другое",
        duration: pick(row, "duration"),
        price: pick(row, "price"),
        format: pick(row, "format"),
        description: pick(row, "description"),
        program: pick(row, "program")
          .split(/\n|;/)
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
    return courses;
  } catch (error) {
    console.error("[courses] courses.xlsx повреждён или имеет неверный формат:", error);
    return [];
  }
});

export async function getCourse(slug: string): Promise<Course | undefined> {
  return (await getCourses()).find((c) => c.slug === slug);
}

export { formatPrice, type Course } from "./course-format";
