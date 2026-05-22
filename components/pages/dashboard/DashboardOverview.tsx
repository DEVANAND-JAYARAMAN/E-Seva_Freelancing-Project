import { ArrowUpRight, Download } from "lucide-react";
import { ActivityChart } from "../charts/ActivityChart";

export function DashboardOverview() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center w-full">
      {/* Left copy column */}
      <div className="lg:col-span-2 flex flex-col justify-center space-y-3.5 pr-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest">
            OPERATIONS OVERVIEW!
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Service payment dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
          Track approvals, wallet balance, payment requests, and service
          movement from one clean top-bar workspace.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all duration-200">
            <span>Create request</span>
            <ArrowUpRight size={16} />
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#0c1222]/30 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-800/80 active:scale-[0.98] transition-all duration-200">
            <Download
              size={15}
              className="text-slate-500 dark:text-slate-400"
            />
            <span>Export report</span>
          </button>
        </div>
      </div>

      {/* Today collection card */}
      <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[250px] transition-all duration-300">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
            Today collection
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400 tracking-wide">
            + 12% vs yesterday
          </span>
        </div>

        {/* Amount */}
        <div className="my-3">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#005c3a] dark:text-emerald-400">
            50.00
          </div>
        </div>

        {/* Elegant line chart */}
        <div className="my-2 h-16 w-full opacity-95">
          <ActivityChart />
        </div>

        {/* Footer info: Monospaced details */}
        <div className="border-t border-slate-50 dark:border-slate-900/30 pt-3">
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono">
            03:03:03 - Aadhaar address update 200 only
          </p>
        </div>
      </div>
    </section>
  );
}
