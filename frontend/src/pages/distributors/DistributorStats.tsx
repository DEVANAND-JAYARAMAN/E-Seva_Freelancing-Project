import { Users, UserCheck, UserX, Wallet } from "lucide-react";
import type { Distributor } from "./types";

type DistributorStatsProps = {
  distributors: Distributor[];
};

export function DistributorStats({ distributors }: DistributorStatsProps) {
  const totalDistributors = distributors.length;
  const activeDistributors = distributors.filter(
    (d) => d.status === "Active",
  ).length;
  const suspendedDistributors = totalDistributors - activeDistributors;
  const totalBalance = distributors.reduce((acc, d) => acc + d.balance, 0);

  const stats = [
    {
      label: "Total Distributors",
      value: totalDistributors,
      icon: Users,
      colorClass:
        "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400",
      indicator: "Onboarded Partners",
      indicatorColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Distributors",
      value: activeDistributors,
      icon: UserCheck,
      colorClass:
        "bg-[#e8f5e9] dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      indicator: `${totalDistributors > 0 ? Math.round((activeDistributors / totalDistributors) * 100) : 0}% active rate`,
      indicatorColor: "text-[#005c3a] dark:text-emerald-400",
    },
    {
      label: "Suspended",
      value: suspendedDistributors,
      icon: UserX,
      colorClass:
        "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
      indicator: "Requires review",
      indicatorColor: "text-rose-500",
    },
    {
      label: "Total Wallet Float",
      value: `₹${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      colorClass: "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400",
      indicator: "Total reserves",
      indicatorColor: "text-sky-500",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest ${stat.indicatorColor}`}
              >
                {stat.indicator}
              </span>
            </div>

            <div
              className={`p-4 rounded-2xl ${stat.colorClass} group-hover:scale-105 transition-transform duration-300`}
            >
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
