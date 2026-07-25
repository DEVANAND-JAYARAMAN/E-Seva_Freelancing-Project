import { walletCards } from "../../config/data";
import { useAuth } from "../../store/context/AuthContext";
import { useRouter } from "next/navigation";

export function WalletSummary({ stats }: { stats?: any }) {
  const { user } = useAuth();
  const router = useRouter();

  const descMap: Record<string, string> = {
    "main wallet": "Current wallet balance",
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

  // Soft brand-aligned solid tones (distinct, no purple cluster)
  const cardBg: Record<string, string> = {
    "main wallet":
      "bg-gradient-to-br from-[#0a7a4d] to-[#005c3a] dark:from-[#0a3d28] dark:to-[#052816]",
    "wallet request":
      "bg-gradient-to-br from-[#0e7490] to-[#155e75] dark:from-[#0c4a5c] dark:to-[#083344]",
    customers:
      "bg-gradient-to-br from-[#0f766e] to-[#115e59] dark:from-[#134e4a] dark:to-[#042f2e]",
    retailers:
      "bg-gradient-to-br from-[#c2410c] to-[#9a3412] dark:from-[#7c2d12] dark:to-[#431407]",
    distributors:
      "bg-gradient-to-br from-[#0d9488] to-[#0f766e] dark:from-[#115e59] dark:to-[#134e4a]",
  };

  return (
    <>
      {walletCards
        .filter(
          (card) =>
            !["wallet request", "customers"].includes(card.label.toLowerCase()),
        )
        .map((card) => {
          const Icon = card.icon;
          const labelLower = card.label.toLowerCase();
          const isMoney = labelLower.includes("wallet");
          const description = descMap[labelLower] || "Stat overview";
          const bgStyle =
            cardBg[labelLower] ||
            "bg-gradient-to-br from-slate-500 to-slate-400";
          const iconStyle = iconTone[labelLower] || "bg-white/20 text-white";

          let dynamicValue = card.value;
          if (labelLower === "main wallet") {
            dynamicValue =
              user?.walletBalance !== undefined
                ? user.walletBalance.toFixed(2)
                : "0.00";
          } else if (stats) {
            if (labelLower === "wallet request")
              dynamicValue = String(stats.walletRequest ?? "0");
            if (labelLower === "customers")
              dynamicValue = String(stats.customers ?? "0");
            if (labelLower === "retailers")
              dynamicValue = String(stats.retailers ?? "0");
            if (labelLower === "distributors")
              dynamicValue = String(stats.distributors ?? "0");
          }

          // Redirect paths mapping
          let targetPath = "";
          if (labelLower === "main wallet") {
            targetPath = "/wallets";
          } else if (labelLower === "retailers") {
            targetPath = "/retailers";
          } else if (labelLower === "distributors") {
            targetPath = "/distributors";
          }

          return (
            <article
              className={`flex items-center justify-between ${bgStyle} rounded-2xl px-4 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer min-h-[5.5rem] ${
                labelLower === "main wallet"
                  ? "ring-2 ring-[#86efac]/40 ring-offset-2 ring-offset-[#e4f1ee] dark:ring-offset-[#070b13]"
                  : ""
              }`}
              key={card.label}
              onClick={() => targetPath && router.push(targetPath)}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                    {card.label}
                  </p>
                  {labelLower === "main wallet" && (
                    <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                      Balance
                    </span>
                  )}
                </div>
                <strong className="block text-2xl font-black text-white tracking-tight leading-tight">
                  {isMoney && (
                    <span className="text-base font-black text-white mr-0.5">
                      ₹
                    </span>
                  )}
                  {dynamicValue}
                </strong>
                <span className="text-[11px] text-white font-bold block truncate">
                  {description}
                </span>
              </div>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white`}
              >
                <Icon size={20} />
              </span>
            </article>
          );
        })}
    </>
  );
}
