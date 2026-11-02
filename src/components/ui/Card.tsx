import type { ComponentProps } from "react";

type Props = ComponentProps<"div"> & { interactive?: boolean };

export function Card({ interactive = false, className = "", ...rest }: Props) {
  const hover = interactive
    ? "transition-colors duration-300 hover:border-gold/60 hover:bg-slate"
    : "";
  return (
    <div
      className={`rounded-card border border-line bg-graphite p-6 sm:p-8 ${hover} ${className}`}
      {...rest}
    />
  );
}
