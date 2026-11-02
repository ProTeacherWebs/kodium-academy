type Props = {
  id?: string;
  title?: string;
  lead?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ id, title, lead, children, className = "" }: Props) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {title && (
          <header className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              {title}
            </h2>
            {lead && <p className="mt-4 text-lg text-mist">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
