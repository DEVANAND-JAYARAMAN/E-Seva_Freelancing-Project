"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/context/AuthContext";
import { apiUrl, authFetch } from "../utils/apiBase";
import { formatTxnDateTime } from "../utils/formatters";
import Swal from "sweetalert2";

type LedgerRow = {
  id: string;
  dateTime: string;
  title: string;
  status: string;
  debit: number;
  credit: number;
  availableBalance: number;
  fromUserId: string;
  toUserId: string;
  reference: string;
  createdAt: string;
};

export function AdminWalletPage() {
  const { updateWallet, refreshProfile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(apiUrl("admin/wallet/transactions"), {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.transactions || [];
      const bal =
        typeof data.balance === "number"
          ? data.balance
          : Number(data.adminWalletBalance || 0);
      setBalance(bal);
      updateWallet(bal);
      setRows(
        list.map((t: any) => ({
          id: String(t.id || ""),
          dateTime: formatTxnDateTime(
            t.dateTime || t.createdAt || t.date || "",
          ),
          title: String(t.title || t.description || "—"),
          status: String(t.status || "Success"),
          debit: Number(t.debit || 0),
          credit: Number(t.credit || 0),
          availableBalance: Number(t.availableBalance || 0),
          fromUserId: String(t.fromUserId || "—"),
          toUserId: String(t.toUserId || "—"),
          reference: String(t.reference || ""),
          createdAt: String(t.createdAt || ""),
        })),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [updateWallet]);

  useEffect(() => {
    void loadLedger();
    void refreshProfile();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "1") {
        setIsModalOpen(true);
      }
    }
    // Mount once — avoid reload loop when wallet/profile updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.fromUserId.toLowerCase().includes(q) ||
        r.toUserId.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q);

      const day = (
        r.createdAt
          ? formatTxnDateTime(r.createdAt)
          : r.dateTime
      ).slice(0, 10);
      const matchesFrom = !fromDate || day >= fromDate;
      const matchesTo = !toDate || day <= toDate;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [rows, search, fromDate, toDate]);

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Enter a valid amount greater than ₹0");
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(apiUrl("admin/wallet/add-money"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Failed to add money");
        return;
      }
      if (typeof data.adminWalletBalance === "number") {
        updateWallet(data.adminWalletBalance);
        setBalance(data.adminWalletBalance);
      }
      setIsModalOpen(false);
      setAmount("");
      await loadLedger();
      Swal.fire({
        icon: "success",
        title: "Added!",
        text: `₹${fmt(amt)} added to Main Wallet`,
        confirmButtonColor: "#005c3a",
      });
    } catch {
      setFormError("Failed to connect to backend");
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const header = [
      "Sl No",
      "Date Time",
      "From ID",
      "To ID",
      "Title",
      "Status",
      "Debit",
      "Credit",
      "Available Balance",
    ];
    const lines = filtered.map((r, i) =>
      [
        i + 1,
        r.dateTime,
        r.fromUserId,
        r.toUserId,
        `"${r.title.replace(/"/g, '""')}"`,
        r.status,
        r.debit || "",
        r.credit || "",
        r.availableBalance,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-wallet-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell activePage="Wallet">
      <section className="flex flex-col gap-5 w-full pb-8">
        {/* Header strip like reference */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18] px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">
              Wallet
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Admin Main Wallet — dummy top-up + partner recharges
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3 py-2 border border-rose-100 dark:border-rose-900/40">
              <span className="text-xs font-bold text-rose-600">
                Wallet Amount :{" "}
                <span className="font-black">{fmt(balance)}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setAmount("");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2.5 shadow-sm"
            >
              <Plus size={14} />
              Add Payment
            </button>
          </div>
        </div>

        {/* Main wallet card */}
        <article className="max-w-sm rounded-2xl bg-gradient-to-br from-[#005c3a] to-[#004229] text-white px-5 py-4 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200/90">
                Main Wallet
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                ₹{fmt(balance)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-200/80">
                Dummy add + retailer/distributor recharge
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Wallet size={18} />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white text-[#005c3a] text-[11px] font-extrabold px-3 py-1.5"
          >
            <Plus size={12} /> Add Money
          </button>
        </article>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18] p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              From Date
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              To Date
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
              />
            </label>
            <button
              type="button"
              onClick={() => loadLedger()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold px-4 py-2.5"
            >
              <Filter size={13} /> Filter
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Excel / CSV
            </button>
            <div className="relative flex-1 min-w-[12rem]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                  {[
                    "Sl No",
                    "Date Time",
                    "From ID & To ID",
                    "Title",
                    "Status",
                    "Debit",
                    "Credit",
                    "Available Balance",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900/40">
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-xs font-bold text-slate-400"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-xs font-bold text-slate-400"
                    >
                      No matching transaction history found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id || i}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 text-sm"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">
                        {i + 1}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {r.dateTime}
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <div>{r.fromUserId}</div>
                        <div className="text-slate-400">→ {r.toUserId}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                        {r.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600">
                        {r.debit > 0 ? fmt(r.debit) : "—"}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {r.credit > 0 ? `+${fmt(r.credit)}` : "—"}
                      </td>
                      <td className="py-3 px-3 font-black text-slate-800 dark:text-white">
                        {fmt(r.availableBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-semibold text-slate-500">
            Showing {filtered.length} of {rows.length} entries
          </p>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                Add Money (Dummy)
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddMoney} className="p-5 space-y-4">
              <p className="text-xs font-semibold text-slate-500">
                Amount will credit Admin Main Wallet and appear in the ledger as
                ADD MONEY.
              </p>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Amount (₹)
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#005c3a]/30"
                  placeholder="e.g. 5000"
                  autoFocus
                />
              </label>
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 px-3 py-2 text-xs font-bold">
                  <AlertCircle size={14} />
                  {formError}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#005c3a] hover:bg-[#004d30] text-white font-extrabold text-sm py-3 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirm Add Money
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
