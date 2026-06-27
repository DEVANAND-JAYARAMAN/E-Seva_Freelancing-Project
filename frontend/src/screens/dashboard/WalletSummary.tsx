import { walletCards } from "../../config/data";

import { useAuth } from "../../store/context/AuthContext";

export function WalletSummary({ stats }: { stats?: any }) {
  const { user } = useAuth();

  const descMap: Record<string, string> = {
    "main wallet": "Available balance",
    "wallet request": "Pending approvals",
    customers: "Subscribed Clients",
    retailers: "Registered Agents",
    distributors: "Connected networks",
  };

  // Icon badge tone per card
  const iconTone: Record<string, string> = {
    "main wallet": "bg-emerald-100 text-emerald-700",
    "wallet request": "bg-sky-100 text-sky-700",
    customers: "bg-indigo-100 text-indigo-700",
    retailers: "bg-orange-100 text-orange-700",
    distributors: "bg-teal-100 text-teal-700",
  };

  // Unique card gradient backgrounds
  const cardBg: Record<string, string> = {
    "main wallet": "bg-gradient-to-br from-emerald-500 to-green-400",
    "wallet request": "bg-gradient-to-br from-sky-500 to-cyan-400",
    customers: "bg-gradient-to-br from-indigo-500 to-blue-400",
    retailers: "bg-gradient-to-br from-orange-500 to-amber-400",
    distributors: "bg-gradient-to-br from-teal-500 to-emerald-400",
  };

  return (
    <>
      {walletCards.map((card) => {
        const Icon = card.icon;
        const labelLower = card.label.toLowerCase();
        const isMoney = labelLower.includes("wallet");
        const description = descMap[labelLower] || "Stat overview";
        const bgStyle =
          cardBg[labelLower] || "bg-gradient-to-br from-slate-500 to-slate-400";
        const iconStyle = iconTone[labelLower] || "bg-white/20 text-white";

        let dynamicValue = card.value;
        if (stats) {
          if (labelLower === "main wallet")
            dynamicValue = stats.mainWallet?.toFixed(2) ?? card.value;
          if (labelLower === "wallet request")
            dynamicValue = String(stats.walletRequest ?? card.value);
          if (labelLower === "customers")
            dynamicValue = String(stats.customers ?? card.value);
          if (labelLower === "retailers")
            dynamicValue = String(stats.retailers ?? card.value);
          if (labelLower === "distributors")
            dynamicValue = String(stats.distributors ?? card.value);
        }

        return (
          <article
            className={`flex items-center justify-between ${bgStyle} rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            key={card.label}
          >
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 truncate">
                {card.label}
              </p>
              <strong className="block text-2xl font-black text-white tracking-tight">
                {isMoney && (
                  <span className="text-sm font-semibold text-white/80 mr-0.5">
                    ₹
                  </span>
                )}
                {dynamicValue}
              </strong>
              <span className="text-[10px] text-white/70 font-semibold block truncate">
                {description}
              </span>
            </div>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white`}
            >
              <Icon size={18} />
            </span>
          </article>
        );
      })}
    </>
  );
}
