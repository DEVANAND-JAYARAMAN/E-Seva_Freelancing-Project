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
      gradientClass:
        "bg-gradient-to-br from-[#7c2d12] to-[#451a03] dark:from-[#431407] dark:to-[#270b04]",
    },
    {
      label: "Process",
      value: getCount("Process"),
      icon: Loader,
      status: "Process" as TicketStatus,
      gradientClass:
        "bg-gradient-to-br from-[#005274] to-[#003850] dark:from-[#002e42] dark:to-[#001c29]",
    },
    {
      label: "Resubmit",
      value: getCount("Resubmit"),
      icon: RefreshCw,
      status: "Resubmit" as TicketStatus,
      gradientClass:
        "bg-gradient-to-br from-[#7e22ce] to-[#581c87] dark:from-[#3b0764] dark:to-[#2e1065]",
    },
    {
      label: "Rejected",
      value: getCount("Rejected"),
      icon: AlertTriangle,
      status: "Rejected" as TicketStatus,
      gradientClass:
        "bg-gradient-to-br from-[#881337] to-[#4c0519] dark:from-[#4c0519] dark:to-[#2c030e]",
    },
    {
      label: "Approved",
      value: getCount("Approved"),
      icon: CheckCircle2,
      status: "Approved" as TicketStatus,
      gradientClass:
        "bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e]",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      {/* "All" Filter Card — slate-indigo gradient */}
      <button
        type="button"
        onClick={() => onFilterChange("All")}
        className={`bg-gradient-to-br from-[#312e81] to-[#1e1b4b] dark:from-[#1e1b4b] dark:to-[#0f0e26] rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between items-start text-left group col-span-2 md:col-span-1 ${
          activeFilter === "All" ? "ring-2 ring-white/40" : ""
        }`}
      >
        <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">
          Total Requests
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-white">
            {tickets.length}
          </span>
          <span className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest">
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
            className={`${stat.gradientClass} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between items-start text-left group ${
              isActive ? "ring-2 ring-white/40" : ""
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">
                {stat.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white/20 text-white group-hover:scale-105 transition-transform duration-200">
                <Icon size={12} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white mt-3">
              {stat.value}
            </div>
          </button>
        );
      })}
    </section>
  );
}
