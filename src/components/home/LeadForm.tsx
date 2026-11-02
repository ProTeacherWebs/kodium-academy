"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import type { Course } from "@/lib/course-format";

const field =
  "h-12 w-full rounded-control border border-line bg-graphite px-4 text-ivory placeholder:text-mist/70 focus:border-gold focus:outline-none";

export function LeadForm({ courses, defaultCourse = "" }: { courses: Course[]; defaultCourse?: string }) {
  const [sent, setSent] = useState(false);

  // Отправка на сервер подключается позже: пока форма только подтверждает заявку на экране.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <Section id="apply" title="Запишитесь на пробное занятие" lead="Оставьте контакты, и менеджер свяжется с вами в течение рабочего дня">
      {sent ? (
        <div role="status" className="max-w-xl rounded-card border border-gold/40 bg-gold/10 p-8">
          <h3 className="font-display text-xl">Заявка принята</h3>
          <p className="mt-2 text-mist">Мы позвоним вам в рабочее время и подберём удобную группу.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
          <label className="grid gap-2 text-sm text-mist">
            Имя
            <input name="name" required autoComplete="name" placeholder="Как к вам обращаться" className={field} />
          </label>
          <label className="grid gap-2 text-sm text-mist">
            Телефон
            <input name="phone" type="tel" required autoComplete="tel" placeholder="+998 __ ___ __ __" className={field} />
          </label>
          <label className="grid gap-2 text-sm text-mist">
            Курс
            <select name="course" defaultValue={defaultCourse} className={field}>
              <option value="">Пока не выбрал</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="lg" className="mt-2 justify-self-start">
            Отправить заявку
          </Button>
        </form>
      )}
    </Section>
  );
}
