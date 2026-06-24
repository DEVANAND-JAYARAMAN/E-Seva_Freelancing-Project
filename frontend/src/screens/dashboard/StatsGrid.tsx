import { stats as statsData } from "../../config/data";
import {
  Clock,
  Zap,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Cpu,
} from "lucide-react";

export function StatsGrid({ stats }: { stats?: any }) {
  const iconMap: Record<string, any> = {
    "today payment": Zap,
    pending: Clock,
    "in process": Cpu,
    approved: CheckCircle,
    projected: TrendingUp,
    resubmit: RefreshCw,
  };

  const descMap: Record<string, string> = {
    "today payment": "Daily collection",
    pending: "Awaiting Verification",
    "in process": "Currently Processing",
    approved: "Completed Requests",
    projected: "Estimated Margin",
    resubmit: "Needs Correction",
  };

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
      "bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400",
  };

  return (
    <>
      {statsData.map((stat) => {
        const labelLower = stat.label.toLowerCase();
        const Icon = iconMap[labelLower] || Zap;
        const description = descMap[labelLower] || "Stat overview";
        const toneStyle =
          toneClasses[stat.tone] ||
          "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300";
        const isMoney =
          labelLower.includes("payment") || labelLower.includes("collection");
          
        let dynamicValue = stat.value;
        if (stats) {
          if (labelLower === "today payment") dynamicValue = stats.todayPayment?.toFixed(2) || "0.00";
          if (labelLower === "pending") dynamicValue = String(stats.pending || 0);
          if (labelLower === "approved") dynamicValue = String(stats.approved || 0);
          if (labelLower === "projected") dynamicValue = stats.projected?.toFixed(2) || "0.00";
        }

        if (labelLower === "in process" || labelLower === "resubmit") {
          return null;
        }

        return (
          <article
            className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            key={stat.label}
          >
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                {stat.label}
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isMoney && (
                  <span className="text-sm font-semibold text-slate-450 mr-0.5">
                    ₹
                  </span>
                )}
                {dynamicValue}
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
