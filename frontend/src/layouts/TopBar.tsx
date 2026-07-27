import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Leaf,
  Settings,
  User,
  LogOut,
  Wallet,
} from "lucide-react";
import { useTheme } from "../store/context/ThemeProvider";
import { useAuth } from "../store/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatTxnDateTime } from "../utils/formatters";
import { authFetch } from "../utils/apiBase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
};

type TopBarProps = {
  onMenuClick: () => void;
  activePage?: string;
};

export function TopBar({ onMenuClick, activePage }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    void refreshProfile();
    const onFocus = () => {
      void refreshProfile();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user?.id, user?.role, refreshProfile]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const targetUserId = user.role === "admin" ? "ADMIN" : user.id;
      let res;
      try {
        res = await authFetch(
          `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications?userId=${targetUserId}`,
        );
      } catch (e) {
        // Fallback for trailing slash redirect CORS issue
        res = await authFetch(
          `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/?userId=${targetUserId}`,
        );
      }
      if (res && res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((n: any) => ({
          id: n.Id || n.id,
          title: n.Title || n.title,
          message: n.Message || n.message,
          type: n.Type || n.type,
          isRead: n.IsRead || n.isRead,
          createdAt: n.CreatedAt || n.createdAt,
          link: n.Link || n.link,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string, createdAt: string) => {
    if (!user) return;
    try {
      await authFetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/${id}/read?userId=${user.id}&createdAt=${createdAt}`,
        {
          method: "PATCH",
        },
      );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const clearNotification = async (id: string, createdAt: string) => {
    if (!user) return;
    try {
      await authFetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/${id}?userId=${user.role === "admin" ? "ADMIN" : user.id}&createdAt=${createdAt}`,
        { method: "DELETE" },
      );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayName =
    user?.name?.trim() ||
    (user?.role === "admin" ? "Admin" : "Partner");
  const initial = (displayName.charAt(0) || "T").toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-teal-200/50 dark:border-teal-900/40 bg-white/85 dark:bg-[#060913]/85 pl-4 pr-2 sm:pl-6 sm:pr-3 lg:pl-8 lg:pr-4 backdrop-blur-xl transition-all duration-300 shadow-sm shadow-teal-900/5">
      {/* Teal accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 opacity-80" />

      <div className="flex items-center gap-4 relative">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/80 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/50 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
            <Leaf size={14} fill="white" />
          </span>
          <span className="font-extrabold text-slate-800 dark:text-white text-base">
            Thuruvan
          </span>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-xs font-bold text-teal-700/70 dark:text-teal-300/70 uppercase tracking-wider">
            Welcome back,{" "}
            <span className="text-slate-900 dark:text-white font-extrabold capitalize">
              {displayName}
            </span>
          </h1>
          {activePage ? (
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {activePage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative flex-wrap justify-end">
        {user && (
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-rose-200/80 dark:border-rose-800/50 bg-rose-50/90 dark:bg-rose-950/30 px-2.5 py-1.5 shadow-sm">
              <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300 whitespace-nowrap">
                Api Wallet :{" "}
                {(user.apiWalletBalance || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <button
                type="button"
                onClick={() => router.push("/wallets/?add=1&wallet=API")}
                className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-extrabold px-2.5 py-1.5 transition active:scale-95 whitespace-nowrap"
              >
                Add Money
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300/70 dark:border-emerald-700/50 bg-emerald-50/90 dark:bg-emerald-950/30 px-2.5 py-1.5 shadow-sm">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                Wallet Amount :{" "}
                {(user.walletBalance || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <button
                type="button"
                onClick={() => router.push("/wallets/?add=1&wallet=Main")}
                className="rounded-lg bg-[#0f766e] hover:bg-[#0d9488] text-white text-[11px] sm:text-xs font-extrabold px-2.5 py-1.5 transition active:scale-95 whitespace-nowrap"
              >
                Add Payment
              </button>
            </div>
          </div>
        )}

        {/* Mobile compact wallet */}
        {user && (
          <button
            type="button"
            onClick={() => router.push("/wallets")}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
            title="Wallets"
          >
            <Wallet size={14} />
            <span className="text-[11px] font-extrabold">
              ₹
              {(user.walletBalance || 0).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/70 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              const newIsOpen = !isNotifOpen;
              setIsNotifOpen(newIsOpen);

              if (newIsOpen && unreadCount > 0) {
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, isRead: true })),
                );

                if (user) {
                  const targetUserId =
                    user.role === "admin" ? "ADMIN" : user.id;
                  authFetch(
                    `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/read-all?userId=${targetUserId}`,
                    { method: "PATCH" },
                  ).catch(console.error);
                }
              }
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200/70 dark:border-sky-800/40 bg-sky-50/80 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 active:scale-95 transition-all duration-300"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#060913]">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-teal-200/60 dark:border-teal-800/60 bg-white dark:bg-[#0c101d] p-3 shadow-2xl dark:shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-2">
                <h3 className="text-sm font-extrabold px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Notifications</span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await authFetch(
                            `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/all?userId=${user.role === "admin" ? "ADMIN" : user.id}`,
                            { method: "DELETE" },
                          );
                          setNotifications([]);
                          setIsNotifOpen(false);
                        } catch (err) {
                          console.error(
                            "Failed to clear all notifications:",
                            err,
                          );
                        }
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  )}
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-4 text-slate-500">
                    No notifications.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0f1423] ${notif.isRead ? "border-transparent opacity-70" : "border-[#005c3a]/20 bg-[#005c3a]/5 dark:border-emerald-500/20 dark:bg-emerald-950/20"} transition-all group`}
                      onClick={() => {
                        if (notif.link) {
                          router.push(notif.link);
                          setIsNotifOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {notif.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        {formatTxnDateTime(notif.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative pl-3 border-l border-teal-200/60 dark:border-teal-800/50">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-md shadow-emerald-900/20 hover:brightness-110 transition focus:outline-none ring-2 ring-emerald-300/40"
            aria-label="User menu"
          >
            {initial}
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-teal-200/60 dark:border-teal-800/60 bg-white dark:bg-[#0c101d] p-2 shadow-2xl dark:shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-0.5">
                    {user?.role || "user"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User
                    size={16}
                    className="text-slate-450 dark:text-slate-400"
                  />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Settings
                    size={16}
                    className="text-slate-450 dark:text-slate-400"
                  />
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
