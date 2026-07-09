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
    "today payment": "Daily collection",
    "total profit": "Overall Earnings",
    pending: "Awaiting Verification",
    "in process": "Currently Processing",
    approved: "Completed Requests",
    projected: "Estimated Margin",
    resubmit: "Needs Correction",
    rejected: "Declined Requests",
  };

  // Unique gradient per card label
  const cardBg: Record<string, string> = {
    mint: "bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e]",
    amber:
      "bg-gradient-to-br from-[#7c2d12] to-[#451a03] dark:from-[#431407] dark:to-[#270b04]",
    sky: "bg-gradient-to-br from-[#005274] to-[#003850] dark:from-[#002e42] dark:to-[#001c29]",
    green:
      "bg-gradient-to-br from-[#047857] to-[#064e3b] dark:from-[#064e3b] dark:to-[#022c22]",
    rose: "bg-gradient-to-br from-[#881337] to-[#4c0519] dark:from-[#4c0519] dark:to-[#2c030e]",
    violet:
      "bg-gradient-to-br from-[#4c1d95] to-[#2e1065] dark:from-[#2e1065] dark:to-[#1e0b3e]",
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
            className={`flex items-center justify-between ${bgStyle} rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            key={stat.label}
            onClick={() => targetPath && router.push(targetPath)}
          >
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 truncate">
                {stat.label}
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
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
              <Icon size={18} />
            </span>
          </article>
        );
      })}
    </>
  );
}
