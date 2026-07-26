"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Store,
  Network,
  Wallet,
  Users,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { apiUrl, authFetch } from "../../utils/apiBase";
import { formatTxnDateTime } from "../../utils/formatters";

type PartnerService = {
  applicationId: string;
  serviceName: string;
  status: string;
  debitAmount: number;
  creditAmount?: number;
  availableBalance?: number;
  createdDate: string;
  createdAtIst?: string;
  dateTime?: string;
};

type PartnerRow = {
  userId: string;
  name: string;
  role: string;
  mobile: string;
  email: string;
  status: string;
  walletBalance: number;
  serviceCount: number;
  totalDebited: number;
  activeServices: PartnerService[];
  recentServices: PartnerService[];
  amountDetails?: PartnerService[];
};

type RoleFilter = "all" | "retailer" | "distributor";

const statusStyle: Record<string, string> = {
  Approved:
    "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400",
  Completed:
    "bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300",
  Resubmit:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300",
  Pending:
    "bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300",
  Process: "bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300",
  Rejected:
    "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300",
};

function money(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Dashboard metric card — opens full Partners page (no popup). */
export function PartnersMetricCard({
  retailers = 0,
  distributors = 0,
}: {
  retailers?: number;
  distributors?: number;
}) {
  const router = useRouter();
  const total = retailers + distributors;

  return (
    <article
      id="partners-metric-card"
      onClick={() => router.push("/partners")}
      className="flex items-center justify-between bg-gradient-to-br from-[#0f766e] to-[#115e59] dark:from-[#134e4a] dark:to-[#042f2e] rounded-2xl px-5 py-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer min-h-[6rem]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push("/partners");
        }
      }}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-black uppercase tracking-wider text-white truncate">
            Partners
          </p>
          <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            Live
          </span>
        </div>
        <strong className="block text-3xl font-black text-white tracking-tight leading-none">
          {total}
        </strong>
        <span className="text-sm text-white/95 font-bold block truncate">
          {retailers} retailers · {distributors} distributors
        </span>
      </div>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
        <Users size={22} />
      </span>
    </article>
  );
}

/** Full-page Partners & Services (opened from dashboard card). */
export function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState({ retailers: 0, distributors: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authFetch(apiUrl("admin/partners-overview"), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPartners(Array.isArray(data?.partners) ? data.partners : []);
        setCounts({
          retailers: Number(data?.retailerCount || 0),
          distributors: Number(data?.distributorCount || 0),
        });
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return partners.filter((p) => {
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q) ||
        (p.mobile || "").toLowerCase().includes(q) ||
        p.recentServices.some((s) =>
          s.serviceName.toLowerCase().includes(q),
        )
      );
    });
  }, [partners, roleFilter, search]);

  const total = counts.retailers + counts.distributors;
  const totalCut = partners.reduce((s, p) => s + (p.totalDebited || 0), 0);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <AppShell activePage="Dashboard">
      <section className="flex flex-col gap-5 w-full max-w-[1400px] mx-auto">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2.5 self-start rounded-xl px-3 py-2 text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-[#0f766e] dark:hover:bg-teal-950/40 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <article className="rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-[#090d16]">
          {/* Hero header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#115e59] dark:from-[#134e4a] dark:via-[#0f766e] dark:to-[#042f2e] px-6 py-7 sm:px-8 sm:py-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #fff 0, transparent 45%), radial-gradient(circle at 85% 30%, #fff 0, transparent 40%)",
              }}
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm sm:text-base font-black uppercase tracking-[0.14em] text-white/95">
                    Partners &amp; Services
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/25 px-3 py-1 text-xs font-black uppercase tracking-wide text-white ring-1 ring-white/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Live
                  </span>
                </div>
                <strong className="block text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                  {loading ? "…" : total}
                </strong>
                <p className="text-base sm:text-lg text-white/95 font-semibold max-w-xl leading-snug">
                  Retailers &amp; distributors — wallet cut per service and live
                  balance
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[9.5rem] rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                    Retailers
                  </p>
                  <p className="mt-1 text-2xl font-black text-white tabular-nums">
                    {counts.retailers}
                  </p>
                </div>
                <div className="min-w-[9.5rem] rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                    Distributors
                  </p>
                  <p className="mt-1 text-2xl font-black text-white tabular-nums">
                    {counts.distributors}
                  </p>
                </div>
                <div className="min-w-[9.5rem] rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                    Total cut
                  </p>
                  <p className="mt-1 text-2xl font-black text-white tabular-nums">
                    ₹{money(totalCut)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters + table */}
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="inline-flex rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 p-1 self-start">
                {(
                  [
                    ["all", "All"],
                    ["retailer", "Retailers"],
                    ["distributor", "Distributors"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRoleFilter(key)}
                    className={`px-4 sm:px-5 py-2.5 text-sm sm:text-base font-extrabold transition-all duration-200 rounded-xl ${
                      roleFilter === key
                        ? "bg-[#0f766e] text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 min-w-[14rem]">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, ID, mobile, service…"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-12 pr-4 py-3.5 text-base font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e]/50 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/80 text-sm font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    <th className="px-4 py-4 w-10" />
                    <th className="px-4 py-4">Partner</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4 text-right">Wallet Balance</th>
                    <th className="px-4 py-4 text-right">Total Cut</th>
                    <th className="px-4 py-4 text-center">Services</th>
                    <th className="px-4 py-4">Latest Service</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-14 text-center text-base text-slate-500 font-bold"
                      >
                        Loading partners…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-14 text-center text-base text-slate-500 font-bold"
                      >
                        No partners found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const open = !!expanded[p.userId];
                      const latest = p.recentServices[0];
                      const isRetailer = p.role === "retailer";
                      return (
                        <PartnerBlock
                          key={p.userId}
                          partner={p}
                          open={open}
                          latest={latest}
                          isRetailer={isRetailer}
                          onToggle={() => toggle(p.userId)}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  );
}

function PartnerBlock({
  partner: p,
  open,
  latest,
  isRetailer,
  onToggle,
}: {
  partner: PartnerRow;
  open: boolean;
  latest?: PartnerService;
  isRetailer: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`border-t border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors ${
          open
            ? "bg-teal-50/70 dark:bg-teal-950/25"
            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
        }`}
        onClick={onToggle}
      >
        <td className="px-4 py-4 text-slate-500">
          {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </td>
        <td className="px-4 py-4">
          <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate max-w-[16rem]">
            {p.name || "—"}
          </div>
          <div className="text-sm font-semibold text-slate-500 mt-1">
            {p.userId}
            {p.mobile ? ` · ${p.mobile}` : ""}
          </div>
        </td>
        <td className="px-4 py-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wide ${
              isRetailer
                ? "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                : "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
            }`}
          >
            {isRetailer ? <Store size={14} /> : <Network size={14} />}
            {p.role}
          </span>
        </td>
        <td className="px-4 py-4 text-right">
          <span className="inline-flex items-center justify-end gap-1.5 text-base font-black text-[#0f766e] dark:text-emerald-400 tabular-nums">
            <Wallet size={16} />₹{money(p.walletBalance)}
          </span>
        </td>
        <td className="px-4 py-4 text-right text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
          ₹{money(p.totalDebited)}
        </td>
        <td className="px-4 py-4 text-center text-base font-extrabold text-slate-800 dark:text-slate-100">
          {p.serviceCount}
          {p.activeServices?.length > 0 && (
            <span className="ml-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
              ({p.activeServices.length} active)
            </span>
          )}
        </td>
        <td className="px-4 py-4">
          {latest ? (
            <div>
              <div className="font-bold text-base text-slate-800 dark:text-slate-100 truncate max-w-[14rem]">
                {latest.serviceName}
              </div>
              <div className="text-sm text-slate-500 font-semibold mt-0.5">
                −₹{money(latest.debitAmount)} ·{" "}
                {latest.createdAtIst ||
                  formatTxnDateTime(latest.createdDate)}
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-sm font-semibold">
              No services yet
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
          <td colSpan={7} className="px-5 py-5">
            {(() => {
              const rows =
                p.amountDetails && p.amountDetails.length > 0
                  ? p.amountDetails
                  : p.recentServices;
              if (rows.length === 0) {
                return (
                  <p className="text-base font-semibold text-slate-500 py-3">
                    No service amount history for this partner.
                  </p>
                );
              }
              return (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="bg-[#0f766e] text-white">
                        {[
                          "Sl No",
                          "Date Time",
                          "Service",
                          "Status",
                          "Debit",
                          "Credit",
                          "Available Balance",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`py-3.5 px-4 text-sm font-extrabold uppercase tracking-wide whitespace-nowrap ${
                              h === "Debit" ||
                              h === "Credit" ||
                              h === "Available Balance"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((s, i) => (
                        <tr
                          key={
                            s.applicationId ||
                            `${s.serviceName}-${s.createdDate}-${i}`
                          }
                          className={
                            i % 2 === 0
                              ? "bg-white dark:bg-slate-950/40"
                              : "bg-slate-50 dark:bg-slate-900/50"
                          }
                        >
                          <td className="py-3.5 px-4 text-base font-semibold text-slate-600">
                            {i + 1}
                          </td>
                          <td className="py-3.5 px-4 text-base font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {s.dateTime ||
                              s.createdAtIst ||
                              formatTxnDateTime(s.createdDate)}
                          </td>
                          <td className="py-3.5 px-4 text-base font-bold text-slate-900 dark:text-slate-100">
                            {s.serviceName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                                statusStyle[s.status] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-base font-bold text-rose-600 tabular-nums">
                            {(s.debitAmount || 0) > 0
                              ? money(s.debitAmount)
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right text-base font-bold text-emerald-600 tabular-nums">
                            {(s.creditAmount || 0) > 0
                              ? `+ ${money(s.creditAmount || 0)}`
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right text-base font-black text-slate-900 dark:text-white tabular-nums">
                            {typeof s.availableBalance === "number"
                              ? money(s.availableBalance)
                              : money(p.walletBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </td>
        </tr>
      )}
    </>
  );
}
