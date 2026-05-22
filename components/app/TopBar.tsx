import { Bell, Menu, Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-[#060913]/80 px-4 sm:px-6 lg:px-8 backdrop-blur-xl transition-all duration-300">
      {/* Mobile Menu Open Trigger & Brand Signpost */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Small Brand Logo shown only on mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-500 text-white shadow-md">
            <Sparkles size={14} />
          </span>
          <span className="font-extrabold text-slate-800 dark:text-white text-base">
            Thuruvan
          </span>
        </div>

        {/* Desktop Greeting Info */}
        <div className="hidden lg:block">
          <h1 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Welcome back,{" "}
            <span className="text-slate-800 dark:text-slate-200 font-extrabold capitalize">
              {theme === "dark" ? "Thuruvan ✦" : "Thuruvan"}
            </span>
          </h1>
        </div>
      </div>

      {/* Global Utilities (Notifications, Theme, Mini Profile) */}
      <div className="flex items-center gap-3">
        {/* Toggle Theme button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-amber-400 animate-spin-slow" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
        </button>

        {/* Notifications button */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#060913]" />
        </button>

        {/* User profile bubble */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800/65">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-xs font-bold text-white shadow-inner">
            T
          </div>
          <span className="hidden sm:block text-sm font-bold text-slate-700 dark:text-slate-300">
            Thuruvan
          </span>
        </div>
      </div>
    </header>
  );
}
