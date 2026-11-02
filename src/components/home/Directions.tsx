import { Section } from "@/components/ui/Section";
import { directions } from "@/data/site";

export function Directions() {
  return (
    <Section id="directions" title="Выберите направление" lead="Пять направлений, в каждом есть курсы для новичков">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {directions.map((d, i) => (
          <li key={d.id} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
            <a
              href={`#courses`}
              className="group flex h-full flex-col justify-between rounded-card border border-line bg-graphite p-6 sm:p-8 transition-colors duration-300 hover:border-gold/60 hover:bg-slate"
            >
              <h3 className="font-display text-lg leading-snug">{d.title}</h3>
              <p className="mt-8 text-sm text-mist">{d.text}</p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
