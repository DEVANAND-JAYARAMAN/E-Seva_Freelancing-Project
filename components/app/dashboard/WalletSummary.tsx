import { walletCards } from "../data";

export function WalletSummary() {
  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Wallet summary"
    >
      {walletCards.map((card) => {
        const Icon = card.icon;
        const isMoney = card.label.toLowerCase().includes("wallet");

        return (
          <article
            className="flex items-center gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-[#090d16]/80"
            key={card.label}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400 shadow-inner">
              <Icon size={20} className="stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {card.label}
              </p>
              <strong className="block text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {isMoney && (
                  <span className="text-lg font-bold text-slate-400 dark:text-slate-600 mr-0.5">
                    ₹
                  </span>
                )}
                {card.value}
              </strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
