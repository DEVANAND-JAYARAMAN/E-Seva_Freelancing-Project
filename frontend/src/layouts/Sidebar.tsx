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

/** Per-item accent for colorful icon chips (brand teal family + status tones). */
const NAV_ACCENT: Record<
  string,
  { chip: string; active: string; bar: string }
> = {
  Dashboard: {
    chip: "from-emerald-500 to-teal-600",
    active: "from-emerald-500/25 to-teal-500/10",
    bar: "bg-emerald-400",
  },
  "Services Status": {
    chip: "from-sky-500 to-cyan-600",
    active: "from-sky-500/25 to-cyan-500/10",
    bar: "bg-sky-400",
  },
  "Our Service": {
    chip: "from-amber-500 to-orange-600",
    active: "from-amber-500/25 to-orange-500/10",
    bar: "bg-amber-400",
  },
  "Service Payment": {
    chip: "from-teal-500 to-cyan-600",
    active: "from-teal-500/25 to-cyan-500/10",
    bar: "bg-teal-400",
  },
  "PDF Services": {
    chip: "from-rose-500 to-orange-600",
    active: "from-rose-500/25 to-orange-500/10",
    bar: "bg-rose-400",
  },
  Distributors: {
    chip: "from-indigo-500 to-blue-600",
    active: "from-indigo-500/25 to-blue-500/10",
    bar: "bg-indigo-400",
  },
  Retailers: {
    chip: "from-orange-500 to-amber-600",
    active: "from-orange-500/25 to-amber-500/10",
    bar: "bg-orange-400",
  },
  Billing: {
    chip: "from-cyan-500 to-teal-600",
    active: "from-cyan-500/25 to-teal-500/10",
    bar: "bg-cyan-400",
  },
  "Daily Payments": {
    chip: "from-lime-500 to-emerald-600",
    active: "from-lime-500/25 to-emerald-500/10",
    bar: "bg-lime-400",
  },
  Wallet: {
    chip: "from-emerald-500 to-green-600",
    active: "from-emerald-500/25 to-green-500/10",
    bar: "bg-emerald-400",
  },
  Notifications: {
    chip: "from-amber-400 to-yellow-500",
    active: "from-amber-400/25 to-yellow-500/10",
    bar: "bg-amber-300",
  },
  "Server Control": {
    chip: "from-slate-500 to-slate-700",
    active: "from-slate-500/25 to-slate-600/10",
    bar: "bg-slate-400",
  },
};

const DEFAULT_ACCENT = {
  chip: "from-teal-500 to-emerald-600",
  active: "from-teal-500/25 to-emerald-500/10",
  bar: "bg-teal-400",
};

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

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "distributor"
        ? "Distributor"
        : "Retailer";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[16.5rem] flex-col text-slate-200 border-r border-teal-900/40 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-[#0a1f18] via-[#0d1a16] to-[#071210]`}
      >
        {/* Soft color washes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-1/3 -right-16 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute bottom-10 left-0 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex h-[4.25rem] shrink-0 items-center justify-between px-4 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-transparent">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-white/15 transition-transform group-hover:scale-105">
              <Leaf size={17} fill="currentColor" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-black tracking-tight text-white leading-none">
                Thuruvan
              </span>
              <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300/90">
                E-Seva Portal
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-3 py-4">
          <p className="px-2 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-teal-400/70">
            Menu
          </p>
          <ul className="space-y-1.5">
            {orderedItems.map((item) => {
              const Icon = item.icon;
              const accent = NAV_ACCENT[item.label] || DEFAULT_ACCENT;
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
                    className={`relative group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${accent.active} text-white shadow-sm ring-1 ring-white/10`
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span
                        className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full ${accent.bar} shadow-[0_0_12px_currentColor]`}
                      />
                    )}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accent.chip} text-white shadow-md shadow-black/20 ${
                        isActive ? "scale-105" : "opacity-90 group-hover:opacity-100"
                      } transition-transform`}
                    >
                      <Icon size={15} strokeWidth={2.25} />
                    </span>
                    <span className="flex-1 truncate tracking-tight">
                      {displayLabel}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-all ${
                        isActive
                          ? "text-white opacity-90 translate-x-0.5"
                          : "text-slate-600 opacity-50 group-hover:opacity-90 group-hover:translate-x-0.5"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer role chip */}
        <div className="relative z-10 p-3 border-t border-white/10">
          <div className="rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-700/20 border border-emerald-400/20 px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300/80">
              Signed in as
            </p>
            <p className="text-xs font-bold text-white truncate mt-0.5 capitalize">
              {user?.name || "Partner"}
            </p>
            <span className="inline-flex mt-1.5 items-center rounded-md bg-amber-400/20 border border-amber-300/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-200">
              {roleLabel}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
