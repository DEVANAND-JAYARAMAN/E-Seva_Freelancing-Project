"use client";

import { useState } from "react";
import { X, Leaf, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { navItems } from "../config/data";
import { useAuth } from "../store/context/AuthContext";

type SidebarProps = {
  activePage: string;
  isOpen: boolean;
  onClose: () => void;
};

const NAV_GROUPS: { title: string; labels: string[] }[] = [
  {
    title: "Main",
    labels: ["Dashboard", "Services Status", "Our Service"],
  },
  {
    title: "Services",
    labels: ["Service Payment", "PDF Services"],
  },
  {
    title: "Network",
    labels: ["Distributors", "Retailers"],
  },
  {
    title: "Finance",
    labels: ["Billing", "Daily Payments", "Wallet"],
  },
  {
    title: "System",
    labels: ["Notifications", "Server Control"],
  },
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

  const groups = isAdmin
    ? NAV_GROUPS.map((group) => ({
        ...group,
        labels: group.labels.filter((label) => displayByLabel.has(label)),
      })).filter((group) => group.labels.length > 0)
    : [
        {
          title: "Menu",
          labels: allowedLabels.filter((label) => displayByLabel.has(label)),
        },
      ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) init[g.title] = true;
    return init;
  });

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "distributor"
        ? "Distributor"
        : user?.role === "retailer"
          ? "Retailer"
          : "Console";

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
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

        {/* Nav — reference flat list, better active/hover + collapsible sections */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-3 space-y-1">
          {groups.map((group) => {
            const expanded = openGroups[group.title] !== false;
            return (
              <div key={group.title} className="mb-1">
                {isAdmin && groups.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span>{group.title}</span>
                    {expanded ? (
                      <ChevronDown size={12} className="opacity-70" />
                    ) : (
                      <ChevronRight size={12} className="opacity-70" />
                    )}
                  </button>
                ) : null}

                {expanded && (
                  <ul className="space-y-0.5">
                    {group.labels.map((label) => {
                      const item = displayByLabel.get(label);
                      if (!item) return null;
                      const Icon = item.icon;
                      const isActive =
                        item.label === activePage ||
                        (item.label === "Services Status" &&
                          activePage === "Status") ||
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
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.06] px-3 py-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a9b5c]/20 text-[#3dd68c] text-xs font-bold">
              {(user?.name || roleLabel).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || roleLabel}
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
