import { Section } from "@/components/ui/Section";
import { steps } from "@/data/site";

export function Process() {
  return (
    <Section title="Как проходит обучение" lead="От первого звонка до первой работы пять шагов">
      <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-obsidian p-6">
            <span className="font-display text-3xl text-gold">{i + 1}</span>
            <h3 className="mt-4 font-medium">{s.title}</h3>
            <p className="mt-2 text-sm text-mist">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
