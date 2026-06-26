
export function DashboardOverview({ stats }: { stats?: any }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center w-full">
      {/* Left copy column */}
      <div className="lg:col-span-2 flex flex-col justify-center space-y-3.5 pr-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest">
            Enterprise Operations Dashboard
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          E-Seva Operations & Payment Portal
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
          Monitor real-time service requests, verify wallet balances, dispatch
          payment requests, and oversee transactional workflow performance from
          a single unified operational command center.
        </p>
      </div>

      {/* Today collection card */}
      <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[250px] transition-all duration-300">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400">
            Total Today
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400 tracking-wide">
            +12% vs yesterday
          </span>
        </div>

        {/* Amount */}
        <div className="my-3">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#005c3a] dark:text-emerald-400">
            ₹{stats?.todayPayment !== undefined ? Number(stats.todayPayment).toFixed(2) : "0.00"}
          </div>
        </div>

        {/* Footer info: Monospaced details */}
        <div className="border-t border-slate-50 dark:border-slate-900/30 pt-3">
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono">
            03:03:03 - Aadhaar Address Update [₹200.00] processed
          </p>
        </div>
      </div>
    </section>
  );
}
