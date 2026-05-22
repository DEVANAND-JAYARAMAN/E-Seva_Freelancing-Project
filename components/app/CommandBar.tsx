"use client";

import { Plus, Search, Leaf } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function CommandBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="flex flex-col md:flex-row md:items-center gap-4 justify-between w-full">
      {/* Search Input Box */}
      <div className="flex-1 max-w-xl">
        <label className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0c1222]/50 focus-within:bg-white dark:focus-within:bg-[#0c1222]/80 shadow-sm focus-within:ring-4 focus-within:ring-emerald-500/5 dark:focus-within:ring-emerald-500/5 focus-within:border-[#005c3a] dark:focus-within:border-emerald-500 transition-all duration-300 group cursor-text">
          <Search size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-[#005c3a] dark:group-focus-within:text-emerald-400 transition-colors" />
          <input
            type="text"
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            aria-label="Search"
            placeholder="Search services, users, payments..."
          />
        </label>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0c1222]/30 hover:bg-[#f0fdf4]/50 dark:hover:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 font-bold text-sm border border-[#005c3a] dark:border-emerald-600/50 transition-all duration-200 active:scale-[0.98]">
          <Plus size={16} />
          <span>Add Money</span>
        </button>
        <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all duration-200 active:scale-[0.98]">
          <Plus size={16} />
          <span>Add Payment</span>
        </button>
        {/* Leaf Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-emerald-950/40 hover:bg-[#f0fdf4]/50 dark:hover:bg-emerald-900/40 text-[#005c3a] dark:text-emerald-400 border border-slate-100 dark:border-emerald-900/50 transition-all duration-300 shadow-sm"
          aria-label="Toggle Theme"
          title="Toggle color theme"
        >
          <Leaf size={16} className={`transition-transform duration-300 ${theme === 'dark' ? 'rotate-12 fill-emerald-400' : 'fill-[#005c3a]'}`} />
        </button>
      </div>
    </section>
  );
}
