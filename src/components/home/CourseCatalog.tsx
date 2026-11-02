"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { formatPrice, type Course } from "@/lib/course-format";

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [active, setActive] = useState<string>("all");
  const directions = Array.from(new Set(courses.map((c) => c.direction)));
  const visible = active === "all" ? courses : courses.filter((c) => c.direction === active);

  const chip = (selected: boolean) =>
    `rounded-control border px-4 py-2 text-sm transition-colors cursor-pointer ${
      selected ? "border-gold bg-gold text-obsidian" : "border-line text-mist hover:border-gold hover:text-gold"
    }`;

  return (
    <Section id="courses" title="Курсы" lead="Выберите курс и запишитесь на бесплатное пробное занятие">
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Фильтр по направлению">
        <button type="button" className={chip(active === "all")} aria-pressed={active === "all"} onClick={() => setActive("all")}>
          Все
        </button>
        {directions.map((d) => (
          <button key={d} type="button" className={chip(active === d)} aria-pressed={active === d} onClick={() => setActive(d)}>
            {d}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-mist">{courses.length === 0 ? "Список курсов скоро появится. Задайте вопрос ассистенту или оставьте заявку" : "В этом направлении пока нет курсов"}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c, i) => {
            const featured = active === "all" && i === 0;
            return (
              <li key={c.slug} className={featured ? "md:col-span-2" : undefined}>
                <Link href={`/courses/${c.slug}`} className="block h-full">
                  <Card interactive className="flex h-full flex-col">
                    <Badge tone="gold">{c.direction}</Badge>
                    <h3 className={`mt-5 font-display leading-snug ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>{c.title}</h3>
                    <p className="mt-3 text-sm text-mist">{c.description}</p>
                    {featured && (
                      <ul className="mt-6 grid flex-1 gap-2 text-sm sm:grid-cols-2">
                        {c.program.slice(0, 4).map((item) => (
                          <li key={item} className="border-t border-line pt-2 text-ivory">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!featured && <div className="flex-1" />}
                    <div className="mt-6 flex items-end justify-between border-t border-line pt-4 text-sm">
                      <span className="text-mist">{c.duration}</span>
                      <span className="font-medium tabular-nums text-ivory">{formatPrice(c.price)}</span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
