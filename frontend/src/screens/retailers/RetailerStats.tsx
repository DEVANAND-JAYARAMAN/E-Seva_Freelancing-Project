import { Users, UserCheck, UserX, Wallet } from "lucide-react";
import type { Retailer } from "./types";

type RetailerStatsProps = {
  retailers: Retailer[];
};

export function RetailerStats({ retailers }: RetailerStatsProps) {
  const totalRetailers = retailers.length;
  const activeRetailers = retailers.filter((r) => r.status === "Active").length;
  const suspendedRetailers = totalRetailers - activeRetailers;
  const totalBalance = retailers.reduce((acc, r) => acc + r.balance, 0);

  const stats = [
    {
      label: "Total Retailers",
      value: totalRetailers,
      icon: Users,
      gradient:
        "bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e]",
      indicator: "Onboarded",
    },
    {
      label: "Active Retailers",
      value: activeRetailers,
      icon: UserCheck,
      gradient:
        "bg-gradient-to-br from-[#005274] to-[#003850] dark:from-[#002e42] dark:to-[#001c29]",
      indicator: `${totalRetailers > 0 ? Math.round((activeRetailers / totalRetailers) * 100) : 0}% active rate`,
    },
    {
      label: "Suspended",
      value: suspendedRetailers,
      icon: UserX,
      gradient:
        "bg-gradient-to-br from-[#881337] to-[#4c0519] dark:from-[#4c0519] dark:to-[#2c030e]",
      indicator: "Requires review",
    },
    {
      label: "Total Wallet Balance",
      value: `₹${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      gradient:
        "bg-gradient-to-br from-[#4c1d95] to-[#2e1065] dark:from-[#2e1065] dark:to-[#1e0b3e]",
      indicator: "INR float",
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
