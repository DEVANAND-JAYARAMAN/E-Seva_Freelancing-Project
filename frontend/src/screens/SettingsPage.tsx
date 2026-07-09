"use client";

import React, { useState } from "react";
import { AppShell } from "../layouts/AppShell";
import {
  Settings,
  Shield,
  Bell,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../store/context/ThemeProvider";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "security" | "notifications" | "appearance"
  >("security");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    walletAlerts: true,
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <AppShell activePage="Settings">
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Settings Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            System Settings
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
            Configure system themes, security credentials, and dispatch
            triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Sidebar Tabs */}
          <div className="md:col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-slate-800/40">
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all outline-none border whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-[#005c3a]/10 border-[#005c3a] text-[#005c3a] dark:bg-emerald-600/10 dark:border-emerald-500 dark:text-emerald-400"
                  : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Lock size={14} />
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all outline-none border whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-[#005c3a]/10 border-[#005c3a] text-[#005c3a] dark:bg-emerald-600/10 dark:border-emerald-500 dark:text-emerald-400"
                  : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Bell size={14} />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all outline-none border whitespace-nowrap ${
                activeTab === "appearance"
                  ? "bg-[#005c3a]/10 border-[#005c3a] text-[#005c3a] dark:bg-emerald-600/10 dark:border-emerald-500 dark:text-emerald-400"
                  : "border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
              <span>Theme</span>
            </button>
          </div>

          {/* Settings Tab Content */}
          <div className="md:col-span-3">
            {activeTab === "security" && (
              <form
                onSubmit={handlePasswordSubmit}
                className="bg-slate-50 dark:bg-[#0c101d] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 space-y-6 shadow-sm"
              >
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Shield
                      size={16}
                      className="text-[#005c3a] dark:text-emerald-400"
                    />
                    <span>Change Credentials</span>
                  </h3>
                  {success && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in slide-in-from-right-2">
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                      Password updated successfully!
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showCurrent ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full h-11 pl-4 pr-11 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 focus:outline-none transition-colors"
                        tabIndex={-1}
                      >
                        {showCurrent ? (
                          <EyeOff size={16} className="stroke-[2]" />
                        ) : (
                          <Eye size={16} className="stroke-[2]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-450 dark:text-slate-555 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showNew ? "text" : "password"}
                        required
                        placeholder="Enter a new strong password"
                        className="w-full h-11 pl-4 pr-11 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 focus:outline-none transition-colors"
                        tabIndex={-1}
                      >
                        {showNew ? (
                          <EyeOff size={16} className="stroke-[2]" />
                        ) : (
                          <Eye size={16} className="stroke-[2]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-450 dark:text-slate-555 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        placeholder="Re-enter to confirm password"
                        className="w-full h-11 pl-4 pr-11 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 focus:outline-none transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff size={16} className="stroke-[2]" />
                        ) : (
                          <Eye size={16} className="stroke-[2]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex h-11 px-6 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all outline-none shadow-md"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <div className="bg-slate-50 dark:bg-[#0c101d] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Bell
                      size={16}
                      className="text-[#005c3a] dark:text-emerald-400"
                    />
                    <span>Notification Settings</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Email System Alerts
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                        Receive transactional operations updates via email.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          emailAlerts: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-350 text-[#005c3a] focus:ring-[#005c3a]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Instant SMS Dispatches
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                        Receive mobile SMS updates for quick action requests.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          smsAlerts: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-350 text-[#005c3a] focus:ring-[#005c3a]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Low Wallet Warning Triggers
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                        Notify instantly when Main balance falls below ₹500.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.walletAlerts}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          walletAlerts: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-350 text-[#005c3a] focus:ring-[#005c3a]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="bg-slate-50 dark:bg-[#0c101d] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {theme === "dark" ? (
                      <Moon
                        size={16}
                        className="text-[#005c3a] dark:text-emerald-400"
                      />
                    ) : (
                      <Sun
                        size={16}
                        className="text-[#005c3a] dark:text-emerald-400"
                      />
                    )}
                    <span>Visual Theme Settings</span>
                  </h3>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      System Display Theme (
                      {theme === "dark" ? "Dark Mode" : "Light Mode"})
                    </p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                      Configure your visual UI display environment.
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex h-10 px-5 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all outline-none"
                  >
                    Switch to {theme === "dark" ? "Light Theme" : "Dark Theme"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
