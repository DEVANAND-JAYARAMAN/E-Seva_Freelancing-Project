import {
  Clock,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import type { StatusTicket, TicketStatus } from "./types";

type StatusStatsProps = {
  tickets: StatusTicket[];
  activeFilter: TicketStatus | "All";
  onFilterChange: (filter: TicketStatus | "All") => void;
};

export function StatusStats({
  tickets,
  activeFilter,
  onFilterChange,
}: StatusStatsProps) {
  const getCount = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status).length;

  const stats = [
    {
      label: "Pending",
      value: getCount("Pending"),
      icon: Clock,
      status: "Pending" as TicketStatus,
      colorClass:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
      activeClass:
        "ring-2 ring-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10",
    },
    {
      label: "Rejected",
      value: getCount("Rejected"),
      icon: AlertTriangle,
      status: "Rejected" as TicketStatus,
      colorClass:
        "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
      activeClass: "ring-2 ring-rose-500/50 bg-rose-50/50 dark:bg-rose-950/10",
    },
    {
      label: "Approved",
      value: getCount("Approved"),
      icon: CheckCircle2,
      status: "Approved" as TicketStatus,
      colorClass:
        "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
      activeClass:
        "ring-2 ring-emerald-500/50 bg-[#e8f5e9]/40 dark:bg-emerald-950/10",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* "All" Filter Card */}
      <button
        type="button"
        onClick={() => onFilterChange("All")}
        className={`bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between items-start text-left group col-span-2 md:col-span-1 ${
          activeFilter === "All"
            ? "ring-2 ring-emerald-500/30 border-emerald-500/30"
            : ""
        }`}
      >
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Total Requests
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {tickets.length}
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            All
          </span>
        </div>
      </button>

      {/* Status Specific Cards */}
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const isActive = activeFilter === stat.status;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onFilterChange(stat.status)}
            className={`bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between items-start text-left group ${
              isActive ? stat.activeClass + " border-transparent" : ""
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {stat.label}
              </span>
              <div
                className={`p-1.5 rounded-lg border ${stat.colorClass} group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon
                  size={12}
                />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
              {stat.value}
            </div>
          </button>
        );
      })}
    </section>
  );
}
