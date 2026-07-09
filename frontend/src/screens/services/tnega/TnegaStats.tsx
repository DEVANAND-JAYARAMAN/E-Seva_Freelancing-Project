import { Users, UserCheck, UserX } from "lucide-react";
import type { TnegaCustomer } from "./types";

type TnegaStatsProps = {
  customers: TnegaCustomer[];
};

export function TnegaStats({ customers }: TnegaStatsProps) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const suspendedCustomers = totalCustomers - activeCustomers;

  const stats = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      colorClass:
        "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400",
      indicator: "Registered",
      indicatorColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Customers",
      value: activeCustomers,
      icon: UserCheck,
      colorClass:
        "bg-[#e8f5e9] dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      indicator: `${totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% active rate`,
      indicatorColor: "text-[#005c3a] dark:text-emerald-400",
    },
    {
      label: "Suspended / Inactive",
      value: suspendedCustomers,
      icon: UserX,
      colorClass:
        "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
      indicator: "Requires review",
      indicatorColor: "text-rose-500",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group"
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
