import { Section } from "@/components/ui/Section";
import { teachers } from "@/data/site";

export function Teachers() {
  return (
    <Section id="teachers" title="Преподаватели" lead="Практики, которые работают в индустрии и делятся реальным опытом">
      <ul className="divide-y divide-line border-y border-line">
        {teachers.map((t) => (
          <li key={t.name} className="grid items-center gap-x-6 gap-y-1 py-5 sm:grid-cols-[3rem_1fr_auto]">
            <div
              aria-hidden
              className="hidden h-12 w-12 items-center justify-center rounded-full border border-line bg-graphite font-display text-sm text-mist sm:flex"
            >
              {t.name
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <h3 className="font-display text-lg leading-snug">{t.name}</h3>
              <p className="text-sm text-mist">{t.role}</p>
            </div>
            <p className="text-sm text-gold">{t.course}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
