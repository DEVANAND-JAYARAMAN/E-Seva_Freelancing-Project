"use client";

import { X, Leaf, ChevronRight } from "lucide-react";
import Link from "next/link";
import { navItems } from "../config/data";
import { useAuth } from "../store/context/AuthContext";

type SidebarProps = {
  activePage: string;
  isOpen: boolean;
  onClose: () => void;
};

const NAV_ORDER = [
  "Dashboard",
  "Services Status",
  "Our Service",
  "Service Payment",
  "PDF Services",
  "Distributors",
  "Retailers",
  "Billing",
  "Daily Payments",
  "Wallet",
  "Notifications",
  "Server Control",
];

export function Sidebar({ activePage, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const allowedLabels = [
    "Dashboard",
    "Services Status",
    "Our Service",
    "Wallet",
  ];

  const displayItems = isAdmin
    ? navItems
    : navItems.filter((item) => allowedLabels.includes(item.label));

  const displayByLabel = new Map(
    displayItems.map((item) => [item.label, item]),
  );

  const orderedItems = NAV_ORDER.map((label) => displayByLabel.get(label)).filter(
    Boolean,
  ) as typeof displayItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col bg-[#12151c] text-slate-200 border-r border-white/[0.06] transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/[0.06]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a9b5c] text-white shadow-[0_0_20px_-4px_rgba(26,155,92,0.7)] transition-transform group-hover:scale-105">
              <Leaf size={16} fill="currentColor" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-tight text-white leading-none">
                Thuruvan
              </span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                E-Seva
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Flat nav — no section headlines */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-3">
          <ul className="space-y-0.5">
            {orderedItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.label === activePage ||
                (item.label === "Services Status" && activePage === "Status") ||
                (item.label === "PDF Services" &&
                  activePage === "PDF Service") ||
                (item.label === "Daily Payments" &&
                  activePage === "Daily Payments");

              const displayLabel =
                !isAdmin && item.label === "Our Service"
                  ? "Our Services"
                  : item.label;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`relative group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-[#1a9b5c]/18 text-white"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1a9b5c]" />
                    )}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                        isActive
                          ? "text-[#3dd68c]"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.25 : 1.75} />
                    </span>
                    <span className="flex-1 truncate tracking-tight">
                      {displayLabel}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-opacity ${
                        isActive
                          ? "text-[#3dd68c] opacity-90"
                          : "text-slate-600 opacity-60 group-hover:opacity-90"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
