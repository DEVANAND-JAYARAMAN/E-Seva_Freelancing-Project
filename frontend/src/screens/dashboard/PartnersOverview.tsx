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
import { apiUrl } from "../../utils/apiBase";
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
    "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400",
  Resubmit:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  Pending:
    "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
  Process: "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400",
  Rejected:
    "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
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
      className="flex items-center justify-between bg-gradient-to-br from-[#0f766e] to-[#115e59] dark:from-[#134e4a] dark:to-[#042f2e] rounded-2xl px-4 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer min-h-[5.5rem]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push("/partners");
        }
      }}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-white truncate">
            Partners
          </p>
          <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
            Live
          </span>
        </div>
        <strong className="block text-2xl font-black text-white tracking-tight leading-tight">
          {total}
        </strong>
        <span className="text-[11px] text-white font-bold block truncate">
          {retailers} retailers · {distributors} distributors
        </span>
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
        <Users size={20} />
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
    fetch(apiUrl("admin/partners-overview"), { cache: "no-store" })
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
      <section className="flex flex-col gap-4 w-full">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 self-start text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#005c3a] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <article className="rounded-2xl shadow-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <div className="bg-gradient-to-br from-[#0f766e] to-[#115e59] dark:from-[#134e4a] dark:to-[#042f2e] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white">
                    Partners &amp; Services
                  </p>
                  <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Live
                  </span>
                </div>
                <strong className="block text-3xl font-black text-white tracking-tight leading-tight">
                  {loading ? "…" : total}
                </strong>
                <span className="text-[11px] text-white/95 font-bold block">
                  Retailers &amp; distributors — wallet cut per service &amp;
                  live balance
                </span>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    <Store size={11} /> {counts.retailers} Retailers
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    <Network size={11} /> {counts.distributors} Distributors
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    Total cut ₹{money(totalCut)}
                  </span>
                </div>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <Users size={24} />
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#090d16] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px] font-extrabold uppercase tracking-wide">
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
                    className={`px-3 py-2 transition-colors ${
                      roleFilter === key
                        ? "bg-[#005c3a] text-white"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 min-w-[12rem]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, ID, mobile, service…"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0f766e]/35"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-900/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-3 w-8" />
                    <th className="px-3 py-3">Partner</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3 text-right">Wallet Balance</th>
                    <th className="px-3 py-3 text-right">Total Cut</th>
                    <th className="px-3 py-3 text-center">Services</th>
                    <th className="px-3 py-3">Latest Service</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-500 font-semibold"
                      >
                        Loading partners…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-500 font-semibold"
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
        className="border-t border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-3 py-3 text-slate-400">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </td>
        <td className="px-3 py-3">
          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[14rem]">
            {p.name || "—"}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {p.userId}
            {p.mobile ? ` · ${p.mobile}` : ""}
          </div>
        </td>
        <td className="px-3 py-3">
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase ${
              isRetailer
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
                : "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300"
            }`}
          >
            {isRetailer ? <Store size={11} /> : <Network size={11} />}
            {p.role}
          </span>
        </td>
        <td className="px-3 py-3 text-right">
          <span className="inline-flex items-center justify-end gap-1 font-extrabold text-[#005c3a] dark:text-emerald-400">
            <Wallet size={13} />₹{money(p.walletBalance)}
          </span>
        </td>
        <td className="px-3 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
          ₹{money(p.totalDebited)}
        </td>
        <td className="px-3 py-3 text-center font-bold text-slate-700 dark:text-slate-200">
          {p.serviceCount}
          {p.activeServices?.length > 0 && (
            <span className="ml-1 text-[10px] font-extrabold text-amber-600">
              ({p.activeServices.length} active)
            </span>
          )}
        </td>
        <td className="px-3 py-3">
          {latest ? (
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[12rem]">
                {latest.serviceName}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                −₹{money(latest.debitAmount)} ·{" "}
                {latest.createdAtIst ||
                  formatTxnDateTime(latest.createdDate)}
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs font-semibold">
              No services yet
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50/60 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
          <td colSpan={7} className="px-4 py-3">
            {(() => {
              const rows =
                p.amountDetails && p.amountDetails.length > 0
                  ? p.amountDetails
                  : p.recentServices;
              if (rows.length === 0) {
                return (
                  <p className="text-xs font-semibold text-slate-500 py-2">
                    No service amount history for this partner.
                  </p>
                );
              }
              return (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40">
                  <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                    <thead>
                      <tr className="bg-[#1e293b] text-white">
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
                            className={`py-2.5 px-3 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${
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
                          <td className="py-2.5 px-3 font-semibold text-slate-600">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {s.dateTime ||
                              s.createdAtIst ||
                              formatTxnDateTime(s.createdDate)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                            {s.serviceName}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                statusStyle[s.status] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                            {(s.debitAmount || 0) > 0
                              ? money(s.debitAmount)
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            {(s.creditAmount || 0) > 0
                              ? `+ ${money(s.creditAmount || 0)}`
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-white">
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
