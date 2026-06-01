import React, { useState } from "react";
import { Bell, Menu, Moon, Sun, Leaf, Settings, User, LogOut } from "lucide-react";
import { useTheme } from "../store/context/ThemeProvider";
import { useAuth } from "../store/context/AuthContext";
import { useRouter } from "next/navigation";

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-[#060913]/80 pl-4 pr-2 sm:pl-6 sm:pr-3 lg:pl-8 lg:pr-4 backdrop-blur-xl transition-all duration-300">
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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005c3a] dark:bg-emerald-600 text-white shadow-md">
            <Leaf size={14} fill="white" />
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
              Thuruvan
            </span>
          </h1>
        </div>
      </div>

      {/* Global Utilities (Notifications, Settings, Theme, Mini Profile) */}
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

        {/* Notifications link */}
        <a
          href="#notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-all duration-300"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#005c3a] dark:bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#060913]">
            3
          </span>
        </a>


        {/* User profile bubble */}
        <div className="relative pl-3 border-l border-slate-200 dark:border-slate-800/65">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-xs font-bold text-white shadow-inner hover:opacity-90 transition-opacity focus:outline-none"
            aria-label="User menu"
          >
            T
          </button>

          {isDropdownOpen && (
            <>
              {/* Invisible backdrop to close dropdown on click outside */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c101d] p-2 shadow-2xl dark:shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User size={16} className="text-slate-450 dark:text-slate-400" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Settings size={16} className="text-slate-450 dark:text-slate-400" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
