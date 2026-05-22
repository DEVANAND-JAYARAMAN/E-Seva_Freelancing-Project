import { stats } from "../../config/data";

export function StatsGrid() {
  // Map tone styles using proper Tailwind classes adapting beautifully to both modes
  const toneClasses: Record<string, string> = {
    mint: "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400",
    amber:
      "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    sky: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400",
    rose: "bg-red-50 dark:bg-rose-950/30 text-red-500 dark:text-red-400",
    violet:
      "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <section
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      aria-label="Dashboard metrics"
    >
      {stats.map((stat) => {
        const toneStyle =
          toneClasses[stat.tone] ||
          "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300";
        const isMoney =
          stat.label.toLowerCase().includes("payment") ||
          stat.label.toLowerCase().includes("collection");

        return (
          <article
            className="flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            key={stat.label}
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              {stat.label}
            </p>
            <div className="flex items-center justify-between gap-1.5 mt-3">
              <strong className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight shrink-0">
                {isMoney && (
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-600 mr-0.5">
                    ₹
                  </span>
                )}
                {stat.value}
              </strong>
              <span
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wide uppercase truncate shrink ${toneStyle}`}
              >
                {stat.change}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
