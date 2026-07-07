"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { History, Search, ArrowLeft, Activity, Download } from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/context/AuthContext";

interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description: string;
  walletType: string;
  date?: string;
  createdDate?: string;
}

export function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const targetName = searchParams.get("name") || "Partner";

  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">(
    "all",
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!targetUserId) return;
      try {
        setLoading(true);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /(?:\/api|\/)+$/,
          "",
        );
        const res = await fetch(
          `${baseUrl}/api/wallet/transactions?userId=${targetUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setTransactions(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [targetUserId]);

  // Handle transaction search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        (t.description || "")
          .toLowerCase()
          .includes((searchTerm || "").toLowerCase()) ||
        (t.reference || "")
          .toLowerCase()
          .includes((searchTerm || "").toLowerCase()) ||
        t.amount.toString().includes(searchTerm);

      const matchesType =
        typeFilter === "all"
          ? true
          : (t.type || "").toLowerCase() === typeFilter.toLowerCase();

      const matchesWallet = t.walletType === "Main";

      return matchesSearch && matchesType && matchesWallet;
    });
  }, [transactions, searchTerm, typeFilter]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headersList = [
      "Date",
      "Reference / UTR",
      "Wallet",
      "Description",
      "Amount (INR)",
      "Type",
      "Status",
    ];
    const csvRows = [
      headersList.join(","),
      ...filteredTransactions.map((tx) =>
        [
          `"${tx.date || tx.createdDate || ""}"`,
          `"${tx.reference || ""}"`,
          `"${tx.walletType || "Main"}"`,
          `"${tx.description || ""}"`,
          tx.amount,
          tx.type,
          tx.status,
        ].join(","),
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Transactions_${targetName.replace(/\s+/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell activePage="Transactions">
      <section className="flex flex-col gap-6 w-full">
        {/* Top Navigation / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-[#090d16] border-2 border-black dark:border-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Transaction Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Viewing: {targetName} ({targetUserId})
            </p>
          </div>
        </div>

        {/* Interactive Transaction Ledger Section */}
        <section className="bg-white dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          {/* Header & Controls bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                <History size={16} />
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Deduction & Credit Ledger
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Comprehensive audit trail of all transactions for this user.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative max-w-xs w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search ref, desc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>

              {/* Type Filter Tab */}
              <div className="flex bg-slate-100 dark:bg-slate-950/60 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-900/80">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "all"
                      ? "bg-white dark:bg-[#0f1524] text-[#005c3a] dark:text-emerald-400 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  All Tx
                </button>
                <button
                  onClick={() => setTypeFilter("credit")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "credit"
                      ? "bg-white dark:bg-[#0f1524] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setTypeFilter("debit")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "debit"
                      ? "bg-white dark:bg-[#0f1524] text-rose-600 dark:text-rose-455 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Debits
                </button>
              </div>

              {/* Export button */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition-all"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border-2 border-black dark:border-white rounded-2xl">
            <table className="w-full text-left border-collapse border-2 border-black dark:border-white">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-extrabold tracking-wider">
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Reference / UTR</th>
                  <th className="py-4 px-5">Wallet</th>
                  <th className="py-4 px-5">Details / Description</th>
                  <th className="py-4 px-5 text-right">Amount</th>
                  <th className="py-4 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50 text-slate-650 dark:text-slate-300 text-xs">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold"
                    >
                      Loading transaction records...
                    </td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === "credit";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="py-4 px-5 font-semibold text-slate-450 dark:text-slate-500 shrink-0">
                          {tx.date || tx.createdDate || "-"}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {tx.reference || "-"}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                              tx.walletType === "Main"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400"
                                : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {tx.walletType || "Main"}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-semibold">
                          {tx.description || "-"}
                        </td>
                        <td
                          className={`py-4 px-5 text-right font-extrabold text-sm ${
                            isCredit
                              ? "text-[#005c3a] dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-455"
                          }`}
                        >
                          {isCredit ? "+" : "-"} ₹{(tx.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              tx.status === "Success"
                                ? "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-450"
                                : tx.status === "Pending"
                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                tx.status === "Success"
                                  ? "bg-[#005c3a] dark:bg-emerald-500"
                                  : tx.status === "Pending"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                              }`}
                            />
                            {tx.status || "Success"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold"
                    >
                      No matching transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
