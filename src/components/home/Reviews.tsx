import { Section } from "@/components/ui/Section";
import { reviews } from "@/data/site";

export function Reviews() {
  return (
    <Section title="Отзывы выпускников" className="bg-graphite/50">
      <ul className="grid gap-4 md:grid-cols-2">
        {reviews.map((r, i) => (
          <li key={r.name} className={i === 0 ? "md:col-span-2" : undefined}>
            <figure className="flex h-full flex-col justify-between rounded-card border border-line bg-obsidian p-6 sm:p-8">
              <blockquote className={i === 0 ? "font-display text-xl leading-snug sm:text-2xl" : "leading-relaxed"}>{r.text}</blockquote>
              <figcaption className="mt-6 text-sm text-mist">{r.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
