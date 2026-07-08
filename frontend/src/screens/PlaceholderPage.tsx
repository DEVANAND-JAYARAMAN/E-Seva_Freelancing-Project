type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="bg-slate-50 dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-md transition-all duration-300 max-w-2xl">
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#005c3a] dark:text-emerald-400 block mb-2">
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
        {title}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </section>
  );
}
