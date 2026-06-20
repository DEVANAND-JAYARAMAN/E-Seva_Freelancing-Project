import { walletCards } from "../../config/data";

export function WalletSummary() {
  const descMap: Record<string, string> = {
    "main wallet": "Available balance",
    "wallet request": "Pending approvals",
    customers: "Subscribed Clients",
    retailers: "Registered Agents",
    distributors: "Connected networks",
  };

  const toneClasses: Record<string, string> = {
    "main wallet":
      "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400",
    "wallet request":
      "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
    customers:
      "bg-blue-50 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400",
    retailers:
      "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    distributors:
      "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  };

  return (
    <>
      {walletCards.map((card) => {
        const Icon = card.icon;
        const labelLower = card.label.toLowerCase();
        const isMoney = labelLower.includes("wallet");
        const description = descMap[labelLower] || "Stat overview";
        const toneStyle =
          toneClasses[labelLower] ||
          "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350";

        return (
          <article
            className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            key={card.label}
          >
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {card.label}
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isMoney && (
                  <span className="text-sm font-semibold text-slate-450 mr-0.5">
                    ₹
                  </span>
                )}
                {card.value}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block truncate">
                {description}
              </span>
            </div>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneStyle}`}
            >
              <Icon size={18} />
            </span>
          </article>
        );
      })}
    </>
  );
}
