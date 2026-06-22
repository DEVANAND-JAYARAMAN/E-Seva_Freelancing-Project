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
  Check,
  X,
} from "lucide-react";
import { useTheme } from "../store/context/ThemeProvider";
import { useAuth } from "../store/context/AuthContext";
import { useRouter } from "next/navigation";

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
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const targetUserId = user.role === "admin" ? "ADMIN" : user.id;
      const res = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications?userId=${targetUserId}`,
      );
      if (res.ok) {
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
      await fetch(
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
      await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/${id}?userId=${user.role === "admin" ? "ADMIN" : user.id}&createdAt=${createdAt}`,
        { method: "DELETE" }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-all duration-300"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#005c3a] dark:bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#060913]">
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
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c101d] p-3 shadow-2xl dark:shadow-black/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-2">
                <h3 className="text-sm font-extrabold px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await fetch(
                            `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/notifications/all?userId=${user.role === "admin" ? "ADMIN" : user.id}`,
                            { method: "DELETE" }
                          );
                          setNotifications([]);
                        } catch (err) {
                          console.error("Failed to clear all notifications:", err);
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
                          if (!notif.isRead) {
                            markAsRead(notif.id, notif.createdAt);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {notif.title}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.id, notif.createdAt);
                              }}
                              className="text-[#005c3a] dark:text-emerald-400 hover:opacity-70 p-1 bg-[#005c3a]/10 dark:bg-emerald-950/40 rounded-md"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif.id, notif.createdAt);
                            }}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Clear notification"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

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
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white transition-colors"
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
