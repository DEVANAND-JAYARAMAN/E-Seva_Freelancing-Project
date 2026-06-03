"use client";

import { X, Leaf } from "lucide-react";
import Link from "next/link";
import { navItems } from "../config/data";
import { useAuth } from "../store/context/AuthContext";

type SidebarProps = {
  activePage: string;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ activePage, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isRetailerOrDistributor = user?.role === "retailer" || user?.role === "distributor";

  let filteredNavItems = navItems;
  if (isRetailerOrDistributor) {
    filteredNavItems = navItems
      .filter((item) =>
        ["Dashboard", "Status", "Our Service", "Wallet"].includes(item.label)
      )
      .map((item) => {
        if (item.label === "Status") {
          return { ...item, label: "Services Status" };
        }
        if (item.label === "Our Service") {
          return { ...item, label: "Our Services" };
        }
        return item;
      });
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-900/80 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header/Brand Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-50 dark:border-slate-900/50">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/10 transition-all group-hover:scale-105 group-hover:rotate-3 duration-300">
              <Leaf size={16} fill="white" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Thuruvan
            </span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto no-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.label === activePage ||
              (item.label === "Services Status" && activePage === "Status") ||
              (item.label === "Our Services" && activePage === "Our Service");

            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                    ? "bg-[#f0fdf4] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-950 dark:hover:text-slate-100 hover:translate-x-0.5"
                  }`}
              >
                <Icon
                  size={18}
                  className={`transition-all duration-200 ${isActive
                      ? "text-[#005c3a] dark:text-emerald-400 scale-105"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}
                />
                <span className="transition-colors">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

