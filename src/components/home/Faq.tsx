import { Section } from "@/components/ui/Section";
import { faq } from "@/data/site";

export function Faq() {
  return (
    <Section id="faq" title="Частые вопросы">
      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {faq.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="text-2xl text-gold transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-mist">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
