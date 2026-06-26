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
      gradient: "bg-gradient-to-br from-emerald-500 to-green-400",
      indicator: "Onboarded Partners",
    },
    {
      label: "Active Distributors",
      value: activeDistributors,
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-sky-500 to-cyan-400",
      indicator: `${totalDistributors > 0 ? Math.round((activeDistributors / totalDistributors) * 100) : 0}% active rate`,
    },
    {
      label: "Suspended",
      value: suspendedDistributors,
      icon: UserX,
      gradient: "bg-gradient-to-br from-rose-500 to-pink-400",
      indicator: "Requires review",
    },
    {
      label: "Total Wallet Float",
      value: `₹${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-400",
      indicator: "Total reserves",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`${stat.gradient} rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-between group`}
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {stat.value}
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
                {stat.indicator}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/20 text-white group-hover:scale-105 transition-transform duration-300">
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
