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

export function StatsGrid({ stats }: { stats?: any }) {
  const iconMap: Record<string, any> = {
    "today payment": Zap,
    pending: Clock,
    "in process": Cpu,
    approved: CheckCircle,
    projected: TrendingUp,
    resubmit: RefreshCw,
    rejected: XCircle,
  };

  const descMap: Record<string, string> = {
    "today payment": "Daily collection",
    pending: "Awaiting Verification",
    "in process": "Currently Processing",
    approved: "Completed Requests",
    projected: "Estimated Margin",
    resubmit: "Needs Correction",
    rejected: "Declined Requests",
  };

  // Unique gradient per card label
  const cardBg: Record<string, string> = {
    mint: "bg-gradient-to-br from-emerald-500 to-green-400",
    amber: "bg-gradient-to-br from-amber-500 to-yellow-400",
    sky: "bg-gradient-to-br from-sky-500 to-blue-400",
    green: "bg-gradient-to-br from-green-500 to-teal-400",
    rose: "bg-gradient-to-br from-rose-500 to-pink-400",
    violet: "bg-gradient-to-br from-violet-500 to-purple-400",
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
          labelLower.includes("payment") || labelLower.includes("collection");

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

        return (
          <article
            className={`flex items-center justify-between ${bgStyle} rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            key={stat.label}
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
