"use client";

import { X, Leaf, Sparkles } from "lucide-react";
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
    title: "Overview",
    labels: ["Dashboard", "Services Status", "Our Service"],
  },
  {
    title: "Operations",
    labels: ["Service Payment", "PDF Services"],
  },
  {
    title: "Network",
    labels: ["Distributors", "Retailers"],
  },
  {
    title: "Finance",
    labels: ["Billing", "Wallet"],
  },
  {
    title: "System",
    labels: ["Notifications", "Server Control"],
  },
];

export function Sidebar({ activePage, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  // Only exact admin role gets full console. Everyone else gets partner menu.
  const isAdmin = user?.role === "admin";
  const isRetailerOrDistributor = !isAdmin;

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

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "distributor"
        ? "Distributor"
        : user?.role === "retailer"
          ? "Retailer"
          : "Console";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#04150f]/35 backdrop-blur-[2px] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar-shell fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col text-slate-800 dark:text-slate-200 border-r border-[#d7e8df] dark:border-emerald-950/60 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 40% at 0% 0%, rgba(0,92,58,0.12), transparent 55%), radial-gradient(ellipse 60% 35% at 100% 100%, rgba(0,92,58,0.08), transparent 50%)",
          }}
        />

        {/* Brand */}
        <div className="relative flex h-[4.75rem] items-center justify-between px-5 border-b border-[#d7e8df]/80 dark:border-emerald-950/50">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#005c3a] text-white shadow-[0_8px_20px_-6px_rgba(0,92,58,0.55)] transition-transform duration-300 group-hover:scale-[1.04] group-hover:-rotate-2">
              <Leaf size={17} fill="currentColor" className="opacity-95" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-[#f7fbf8] dark:ring-[#0a1210]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[1.15rem] font-extrabold tracking-tight text-[#0b1f17] dark:text-white leading-none">
                Thuruvan
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#5f7a6d] dark:text-emerald-500/70">
                E-Seva Console
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#cfe0d6] dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-500 hover:bg-white hover:text-[#005c3a] lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto no-scrollbar px-3.5 py-5 space-y-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7a9488] dark:text-slate-500">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.labels.map((label) => {
                  const item = displayByLabel.get(label);
                  if (!item) return null;
                  const Icon = item.icon;
                  const isActive =
                    item.label === activePage ||
                    (item.label === "Services Status" &&
                      activePage === "Status") ||
                    (item.label === "PDF Services" &&
                      activePage === "PDF Service");

                  const displayLabel =
                    isRetailerOrDistributor && item.label === "Our Service"
                      ? "Our Services"
                      : item.label;

                  return (
                    <Link
                      href={item.href}
                      key={item.label}
                      onClick={onClose}
                      className={`relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 group ${
                        isActive
                          ? "bg-[#005c3a] text-white shadow-[0_10px_24px_-10px_rgba(0,92,58,0.75)]"
                          : "text-[#4d6559] dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-900/60 hover:text-[#0b1f17] dark:hover:text-white hover:shadow-sm"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-200/90" />
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-[#e4f0e9] dark:bg-slate-900 text-[#5f7a6d] dark:text-slate-400 group-hover:bg-[#d7ebe1] dark:group-hover:bg-slate-800 group-hover:text-[#005c3a] dark:group-hover:text-emerald-400"
                        }`}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.25 : 2} />
                      </span>
                      <span className="truncate tracking-tight">
                        {displayLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative px-3.5 pb-4 pt-2">
          <div className="rounded-2xl border border-[#cfe0d6] dark:border-slate-800 bg-white/75 dark:bg-slate-950/50 backdrop-blur-sm px-3.5 py-3 shadow-[0_8px_24px_-16px_rgba(0,92,58,0.35)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#005c3a]/10 dark:bg-emerald-500/10 text-[#005c3a] dark:text-emerald-400">
                <Sparkles size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#5f7a6d] dark:text-slate-500">
                  Signed in
                </p>
                <p className="truncate text-sm font-bold text-[#0b1f17] dark:text-white">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
