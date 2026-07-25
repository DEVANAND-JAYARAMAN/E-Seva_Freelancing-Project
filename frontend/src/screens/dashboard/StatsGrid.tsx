import { stats as statsData } from "../../config/data";
import {
  Clock,
  Zap,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Cpu,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function StatsGrid({ stats }: { stats?: any }) {
  const router = useRouter();

  const iconMap: Record<string, any> = {
    "today payment": Zap,
    "total profit": TrendingUp,
    pending: Clock,
    "in process": Cpu,
    approved: CheckCircle,
    projected: TrendingUp,
    resubmit: RefreshCw,
    rejected: XCircle,
  };

  const descMap: Record<string, string> = {
    "today payment": "Partner recharges today",
    "total profit": "Overall Earnings",
    pending: "Awaiting Verification",
    "in process": "Currently Processing",
    approved: "Completed Requests",
    projected: "Estimated Margin",
    resubmit: "Needs Correction",
    rejected: "Declined Requests",
  };

  // Brand-aligned tones — Today Payment = blue (not green like Main Wallet)
  const cardBg: Record<string, string> = {
    mint: "bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] dark:from-[#1e3a8a] dark:to-[#172554]",
    amber:
      "bg-gradient-to-br from-[#d97706] to-[#b45309] dark:from-[#92400e] dark:to-[#78350f]",
    sky: "bg-gradient-to-br from-[#0284c7] to-[#0369a1] dark:from-[#075985] dark:to-[#0c4a6e]",
    green:
      "bg-gradient-to-br from-[#10b981] to-[#059669] dark:from-[#047857] dark:to-[#065f46]",
    rose: "bg-gradient-to-br from-[#e11d48] to-[#be123c] dark:from-[#9f1239] dark:to-[#881337]",
    violet:
      "bg-gradient-to-br from-[#ea580c] to-[#c2410c] dark:from-[#9a3412] dark:to-[#7c2d12]",
  };

  return (
    <>
      {statsData.map((stat) => {
        const labelLower = stat.label.toLowerCase();
        const Icon = iconMap[labelLower] || Zap;
        const description = descMap[labelLower] || "Stat overview";
        const bgStyle =
          cardBg[stat.tone] || "bg-gradient-to-br from-slate-500 to-slate-400";
        const isMoney =
          labelLower.includes("payment") ||
          labelLower.includes("collection") ||
          labelLower.includes("profit");

        let dynamicValue = stat.value;
        if (stats) {
          if (labelLower === "today payment")
            dynamicValue = stats.todayPayment?.toFixed(2) || "0.00";
          if (labelLower === "pending")
            dynamicValue = String(stats.pending || 0);
          if (labelLower === "approved")
            dynamicValue = String(stats.approved || 0);
          if (labelLower === "resubmit")
            dynamicValue = String(stats.resubmit || 0);
          if (labelLower === "in process")
            dynamicValue = String(stats.inProcess || 0);
          if (labelLower === "rejected")
            dynamicValue = String(stats.rejected || 0);
        }

        if (labelLower === "projected") {
          return null;
        }

        // Redirect paths mapping
        let targetPath = "";
        if (labelLower === "today payment") {
          targetPath = "/wallets";
        } else if (
          [
            "pending",
            "in process",
            "approved",
            "resubmit",
            "rejected",
          ].includes(labelLower)
        ) {
          targetPath = "/status";
        }

        return (
          <article
            className={`flex items-center justify-between ${bgStyle} rounded-2xl px-4 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer min-h-[5.5rem] ${
              labelLower === "today payment"
                ? "ring-2 ring-[#93c5fd]/50 ring-offset-2 ring-offset-[#e4f1ee] dark:ring-offset-[#070b13]"
                : ""
            }`}
            key={stat.label}
            onClick={() => targetPath && router.push(targetPath)}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                  {stat.label}
                </p>
                {labelLower === "today payment" && (
                  <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Today
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
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <Icon size={20} />
            </span>
          </article>
        );
      })}
    </>
  );
}
