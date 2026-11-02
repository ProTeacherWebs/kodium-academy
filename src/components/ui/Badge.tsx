type Props = { tone?: "gold" | "neutral"; children: React.ReactNode };

export function Badge({ tone = "neutral", children }: Props) {
  const tones = {
    gold: "border-gold/40 bg-gold/10 text-gold",
    neutral: "border-line bg-slate text-mist",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
