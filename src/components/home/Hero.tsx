import { Button } from "@/components/ui/Button";

type Token = [kind: string, text: string];

// Подсветка синтаксиса — единственное место на сайте с насыщенным цветом
const codeLines: { indent: number; tokens: Token[] }[] = [
  { indent: 0, tokens: [["kw", "const"], ["", " student = {"]] },
  { indent: 1, tokens: [["key", "goal"], ["", ": "], ["str", '"первая работа в IT"'], ["", ","]] },
  { indent: 1, tokens: [["key", "course"], ["", ": "], ["str", '"Frontend-разработчик"'], ["", ","]] },
  { indent: 1, tokens: [["key", "mentor"], ["", ": "], ["str", '"действующий разработчик"'], ["", ","]] },
  { indent: 0, tokens: [["", "};"]] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [["kw", "await"], ["", " student."], ["fn", "learn"], ["", "("], ["num", "8"], ["", ");"]] },
];

const stats = [
  ["5 000+", "выпускников"],
  ["12", "человек в группе"],
  ["87%", "находят работу"],
];

export function Hero() {
  return (
    <section className="flex lg:min-h-[calc(100dvh-4rem)] lg:items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <h1 className="font-display text-3xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Начните карьеру в IT с наставником, который в ней работает
          </h1>
          <p className="mt-6 max-w-xl text-lg text-mist">
            Курсы программирования, дизайна и Data/AI в Ташкенте. Практика на реальных задачах, малые группы и помощь с первой работой.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="#apply" size="lg">
              Записаться на пробное занятие
            </Button>
            <Button href="#courses" variant="ghost" size="lg">
              Выбрать курс
            </Button>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl tabular-nums text-ivory">{value}</dd>
                <p className="mt-1 text-sm text-dim">{label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div aria-hidden className="rounded-card border border-line bg-graphite">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="ml-3 text-xs text-dim">future.ts</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-mist sm:p-6 sm:text-[0.95rem]">
            {codeLines.map((line, i) => (
              <div key={i} className="code-line" style={{ "--i": i } as React.CSSProperties}>
                <span style={{ paddingLeft: `${line.indent * 1.5}rem` }}>
                  {line.tokens.length === 0
                    ? " "
                    : line.tokens.map(([kind, text], j) => (
                        <span key={j} className={kind ? `syn-${kind}` : undefined}>
                          {text}
                        </span>
                      ))}
                </span>
              </div>
            ))}
            <span className="caret inline-block h-5 w-2 translate-y-1 bg-gold" />
          </pre>
        </div>
      </div>
    </section>
  );
}
