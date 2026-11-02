import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { brand, nav } from "@/data/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-obsidian/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-medium tracking-tight">
          Kodium<span aria-hidden className="caret ml-1 inline-block h-[0.85em] w-[0.45em] translate-y-[0.08em] bg-gold" />
        </Link>
        <nav aria-label="Основное меню" className="hidden items-center gap-8 text-sm text-mist md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ivory">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hidden text-sm text-mist hover:text-ivory lg:block">
            {brand.phone}
          </a>
          <Button href="#apply" size="md">
            Записаться
          </Button>
        </div>
      </div>
      <nav aria-label="Мобильное меню" className="flex gap-4 overflow-x-auto border-t border-line/60 px-4 py-2 text-sm text-mist md:hidden">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="whitespace-nowrap py-1">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
