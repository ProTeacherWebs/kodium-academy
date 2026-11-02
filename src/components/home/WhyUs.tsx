import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { advantages } from "@/data/site";

export function WhyUs() {
  const [lead, ...rest] = advantages;
  return (
    <Section title="Почему учиться у нас" className="bg-graphite/50">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col justify-end lg:row-span-3 lg:p-10">
          <h3 className="font-display text-2xl leading-snug sm:text-3xl">{lead.title}</h3>
          <p className="mt-4 max-w-md text-lg text-mist">{lead.text}</p>
        </Card>
        {rest.map((a) => (
          <Card key={a.title}>
            <h3 className="font-display text-lg">{a.title}</h3>
            <p className="mt-2 text-mist">{a.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
