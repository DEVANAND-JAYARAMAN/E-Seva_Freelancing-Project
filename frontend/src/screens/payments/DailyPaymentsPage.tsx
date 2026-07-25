"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, IndianRupee, CalendarDays } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { apiUrl } from "../../utils/apiBase";

type DayRow = {
  date: string;
  dateLabel: string;
  noOfPayments: number;
  amount: number;
};

type DailyPaymentsData = {
  totalSuccessPayments: number;
  totalAmount: number;
  todayAmount: number;
  days: DayRow[];
};

export function DailyPaymentsPage() {
  const [data, setData] = useState<DailyPaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl("admin/daily-payments"));
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setData(json);
        }
      } catch (e) {
        console.error("Failed to load daily payments", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const rows = data?.days || [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.dateLabel.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        String(r.amount).includes(q) ||
        String(r.noOfPayments).includes(q),
    );
  }, [data?.days, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (pageSafe - 1) * pageSize,
    pageSafe * pageSize,
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <AppShell activePage="Daily Payments">
      <section className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Daily Payments
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Partner wallet recharges grouped by date (IST)
          </p>
        </div>

        {/* Summary cards — reference model */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <article className="rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-5 py-5 text-white shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-white/80">
                  Total SUCCESS Payments
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                  {loading ? "—" : data?.totalSuccessPayments ?? 0}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <CheckCircle2 size={22} />
              </span>
            </div>
          </article>

          <article className="rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] px-5 py-5 text-white shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-white/80">
                  Total Amount
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                  ₹ {loading ? "—" : fmt(data?.totalAmount ?? 0)}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <IndianRupee size={22} />
              </span>
            </div>
          </article>

          <article className="rounded-2xl bg-gradient-to-br from-[#d97706] to-[#b45309] px-5 py-5 text-white shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-white/80">
                  Today Amount
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                  ₹ {loading ? "—" : fmt(data?.todayAmount ?? 0)}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <CalendarDays size={22} />
              </span>
            </div>
          </article>
        </div>

        {/* Daily table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18] shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search…"
                className="w-full sm:w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#005c3a]/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    #
                  </th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Date
                  </th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
                    No of Payments
                  </th>
                  <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900/40">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-xs font-bold text-slate-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-xs font-bold text-slate-400"
                    >
                      No daily payments found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr
                      key={row.date}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30"
                    >
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {(pageSafe - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                        {row.dateLabel}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 text-center">
                        {row.noOfPayments}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">
                        ₹ {fmt(row.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            <span>
              Showing{" "}
              {filtered.length === 0
                ? 0
                : (pageSafe - 1) * pageSize + 1}{" "}
              to {Math.min(pageSafe * pageSize, filtered.length)} of{" "}
              {filtered.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-200">
                {pageSafe} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
