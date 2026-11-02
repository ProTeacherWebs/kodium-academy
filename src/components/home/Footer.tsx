import { brand } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg">
            Kodium<span aria-hidden className="caret ml-1 inline-block h-[0.85em] w-[0.45em] translate-y-[0.08em] bg-gold" />
          </p>
          <p className="mt-3 max-w-xs text-sm text-mist">Учебный центр программирования, дизайна и Data/AI в Ташкенте.</p>
        </div>
        <address className="text-sm not-italic text-mist">
          <p>{brand.address}</p>
          <p className="mt-2">{brand.hours}</p>
        </address>
        <p className="text-sm">
          <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="text-ivory hover:text-gold">
            {brand.phone}
          </a>
        </p>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-mist">© 2026 {brand.name}</p>
    </footer>
  );
}
