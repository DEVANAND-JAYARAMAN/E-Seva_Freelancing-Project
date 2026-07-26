"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../store/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Users,
  Clock,
  CheckCircle,
  Compass,
  Zap,
  RefreshCw,
  XCircle,
  Store,
  ArrowRight,
  FileText,
  Plus,
} from "lucide-react";
import { formatTxnDateTime } from "../../utils/formatters";
import { authFetch } from "../../utils/apiBase";

function parseForm(raw: unknown): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, any>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  }
  return {};
}

function extractApplicantName(form: Record<string, any>): string {
  const keys = [
    "applicantName",
    "applicant_name",
    "ApplicantName",
    "applicantNameEnglish",
    "nameAsPerAadhaar",
    "nameAsPerReg",
    "nameEnglish",
    "newNameEnglish",
    "fullName",
    "name",
    "customerName",
    "devoteeName",
    "ownerName",
    "tradeName",
  ];
  for (const key of keys) {
    const s = String(form?.[key] ?? "").trim();
    if (s) return s;
  }
  const skip = /(file|photo|sign|document|upload|card|proof|path|url|image)/i;
  for (const [key, val] of Object.entries(form || {})) {
    if (!/name/i.test(key) || skip.test(key)) continue;
    const s = String(val ?? "").trim();
    if (s && s.length >= 2 && !s.startsWith("/uploads/")) return s;
  }
  return "";
}

function statusStyle(status: string) {
  const s = String(status || "");
  if (s === "Approved" || s === "Completed")
    return {
      pill: "bg-emerald-500 text-white",
      soft: "from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-900/40",
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
  if (s === "Pending")
    return {
      pill: "bg-amber-500 text-white",
      soft: "from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-900/40",
      icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    };
  if (s === "Process" || s === "InProcess" || s === "Processing")
    return {
      pill: "bg-sky-500 text-white",
      soft: "from-sky-50 to-cyan-50 border-sky-200 dark:from-sky-950/40 dark:to-cyan-950/30 dark:border-sky-900/40",
      icon: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
    };
  if (s === "Resubmit")
    return {
      pill: "bg-violet-500 text-white",
      soft: "from-violet-50 to-fuchsia-50 border-violet-200 dark:from-violet-950/40 dark:to-fuchsia-950/30 dark:border-violet-900/40",
      icon: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300",
    };
  if (s === "Rejected")
    return {
      pill: "bg-rose-500 text-white",
      soft: "from-rose-50 to-orange-50 border-rose-200 dark:from-rose-950/40 dark:to-orange-950/30 dark:border-rose-900/40",
      icon: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    };
  return {
    pill: "bg-slate-500 text-white",
    soft: "from-slate-50 to-slate-100 border-slate-200 dark:from-slate-900/40 dark:to-slate-800/30 dark:border-slate-700",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
}

export function DashboardPage2({
  forceRole,
}: {
  forceRole?: "retailer" | "distributor";
}) {
  const router = useRouter();
  const { user: contextUser, updateWallet, refreshProfile } = useAuth();
  const user = React.useMemo(
    () => (forceRole ? { ...contextUser, role: forceRole } : contextUser),
    [contextUser, forceRole],
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestUtr, setRequestUtr] = useState("");
  const [allRequests, setAllRequests] = useState<any[]>([]);

  const handleWalletRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount || isNaN(Number(requestAmount))) return;

    const amtNum = Number(requestAmount);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
        /(?:\/api|\/)+$/,
        "",
      );
      const res = await authFetch(`${baseUrl}/api/wallet/recharge/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: amtNum,
          utrNumber: requestUtr.trim(),
          remarks: "Recharge from Dashboard",
          userId: user?.id,
        }),
      });

      if (res.ok) {
        const newBalance = (user?.walletBalance || 0) + amtNum;
        updateWallet(newBalance);
        setShowRequestModal(false);
        setRequestAmount("");
        setRequestUtr("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || err.message || "Failed to submit wallet request");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const userFilter = user?.id ? `?userId=${user.id}` : "";
    authFetch(
      `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/services/requests${userFilter}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setAllRequests(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, [user?.id]);

  const pendingCount = allRequests.filter((r) => r.status === "Pending").length;
  const processCount = allRequests.filter(
    (r) =>
      r.status === "Process" ||
      r.status === "InProcess" ||
      r.status === "Processing",
  ).length;
  const resubmitCount = allRequests.filter(
    (r) => r.status === "Resubmit",
  ).length;
  const rejectedCount = allRequests.filter(
    (r) => r.status === "Rejected",
  ).length;
  const approvedCount = allRequests.filter(
    (r) => r.status === "Approved" || r.status === "Completed",
  ).length;
  const totalCount = allRequests.length;

  const recentTransactions = useMemo(
    () =>
      [...allRequests]
        .sort(
          (a, b) =>
            new Date(b.createdDate || b.CreatedDate || 0).getTime() -
            new Date(a.createdDate || a.CreatedDate || 0).getTime(),
        )
        .slice(0, 6),
    [allRequests],
  );

  const metricCards = [
    {
      key: "wallet",
      label: "Wallet",
      value: `₹${
        user?.walletBalance !== undefined
          ? Number(user.walletBalance).toFixed(2)
          : "0.00"
      }`,
      hint: "Available balance",
      icon: Wallet,
      tone: "from-emerald-600 to-teal-700",
      soft: "from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/50 dark:to-teal-950/40 dark:border-emerald-800/50",
      onClick: () => router.push("/wallets"),
    },
    {
      key: "pending",
      label: "Pending",
      value: String(pendingCount),
      hint: "Awaiting review",
      icon: Clock,
      tone: "from-amber-500 to-orange-600",
      soft: "from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/50 dark:to-orange-950/40 dark:border-amber-800/50",
      onClick: () => router.push("/status"),
    },
    {
      key: "process",
      label: "In Process",
      value: String(processCount),
      hint: "Being processed",
      icon: Zap,
      tone: "from-sky-500 to-cyan-600",
      soft: "from-sky-50 to-cyan-50 border-sky-200 dark:from-sky-950/50 dark:to-cyan-950/40 dark:border-sky-800/50",
      onClick: () => router.push("/status"),
    },
    {
      key: "resubmit",
      label: "Resubmit",
      value: String(resubmitCount),
      hint: "Needs attention",
      icon: RefreshCw,
      tone: "from-violet-500 to-fuchsia-600",
      soft: "from-violet-50 to-fuchsia-50 border-violet-200 dark:from-violet-950/50 dark:to-fuchsia-950/40 dark:border-violet-800/50",
      onClick: () => router.push("/status"),
    },
    {
      key: "rejected",
      label: "Rejected",
      value: String(rejectedCount),
      hint: "Declined",
      icon: XCircle,
      tone: "from-rose-500 to-red-600",
      soft: "from-rose-50 to-red-50 border-rose-200 dark:from-rose-950/50 dark:to-red-950/40 dark:border-rose-800/50",
      onClick: () => router.push("/status"),
    },
    {
      key: "approved",
      label: "Approved",
      value: String(approvedCount),
      hint: "Completed",
      icon: CheckCircle,
      tone: "from-teal-500 to-emerald-600",
      soft: "from-teal-50 to-emerald-50 border-teal-200 dark:from-teal-950/50 dark:to-emerald-950/40 dark:border-teal-800/50",
      onClick: () => router.push("/status"),
    },
    {
      key: "apps",
      label: "Applications",
      value: String(totalCount),
      hint: "Total submitted",
      icon: Users,
      tone: "from-cyan-600 to-blue-700",
      soft: "from-cyan-50 to-blue-50 border-cyan-200 dark:from-cyan-950/50 dark:to-blue-950/40 dark:border-cyan-800/50",
      onClick: () => router.push("/status"),
    },
  ];

  if (user?.role === "distributor") {
    metricCards.push({
      key: "retailers",
      label: "Retailers",
      value: "Active",
      hint: "Network partners",
      icon: Store,
      tone: "from-orange-500 to-amber-600",
      soft: "from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950/50 dark:to-amber-950/40 dark:border-orange-800/50",
      onClick: () => router.push("/retailers"),
    });
  }

  return (
    <AppShell activePage="Dashboard">
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004229] via-[#005c3a] to-teal-700 text-white shadow-xl shadow-emerald-900/20">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-wider">
                <Compass size={12} className="text-amber-200" />
                Thuruvan Terminal Portal
              </span>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
                Hello,{" "}
                <span className="capitalize text-amber-200">
                  {user?.name || "Partner"}
                </span>
              </h2>
              <p className="text-sm text-emerald-50/85 font-medium leading-relaxed">
                Track applications, manage wallet, and submit services from one
                place.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/services")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#005c3a] px-4 py-2.5 text-xs font-black uppercase tracking-wide hover:bg-amber-50 transition-colors"
                >
                  <Plus size={14} />
                  New service
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/status")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/25 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wide hover:bg-white/25 transition-colors"
                >
                  View status
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 self-stretch lg:self-auto">
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 min-w-[150px]">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-100/80">
                  Account type
                </p>
                <p className="text-sm font-extrabold mt-1 uppercase">
                  {user?.role === "distributor"
                    ? "Distributor"
                    : "Retailer partner"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/wallets")}
                className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-emerald-950 px-4 py-3 text-left shadow-lg shadow-amber-900/20 hover:brightness-105 transition min-w-[150px]"
              >
                <p className="text-[10px] font-black uppercase tracking-wider opacity-80">
                  Wallet
                </p>
                <p className="text-xl font-black mt-0.5">
                  ₹
                  {user?.walletBalance !== undefined
                    ? Number(user.walletBalance).toFixed(2)
                    : "0.00"}
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* Metric cards */}
        <section
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          aria-label="Partner stats"
        >
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.key}
                onClick={card.onClick}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.soft} p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              >
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${card.tone} opacity-15 group-hover:opacity-25 transition-opacity`}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {card.label}
                    </p>
                    <strong className="block text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
                      {card.value}
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-1">
                      {card.hint}
                    </span>
                  </div>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.tone} text-white shadow-sm`}
                  >
                    <Icon size={17} />
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        {/* Recent applications */}
        <section className="rounded-3xl border border-teal-200/80 dark:border-teal-900/50 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-sm shadow-md overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                Our Services Status
              </h3>
              <p className="text-xs text-teal-50/90 mt-1 font-medium">
                Latest applications with applicant name and status
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/status")}
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Open full status
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 px-4 py-10 text-center">
                <FileText
                  size={28}
                  className="mx-auto text-teal-500 mb-3 opacity-80"
                />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No applications yet
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Submit a service to see live status here.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/services")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#005c3a] text-white px-4 py-2 text-xs font-bold"
                >
                  <Plus size={14} />
                  Browse services
                </button>
              </div>
            ) : (
              recentTransactions.map((txn) => {
                const form = parseForm(txn.formData || txn.FormData);
                const applicant = extractApplicantName(form);
                const style = statusStyle(txn.status);
                const Icon =
                  txn.status === "Approved" || txn.status === "Completed"
                    ? CheckCircle
                    : txn.status === "Pending"
                      ? Clock
                      : txn.status === "Process" ||
                          txn.status === "InProcess" ||
                          txn.status === "Processing"
                        ? Zap
                        : txn.status === "Resubmit"
                          ? RefreshCw
                          : XCircle;

                return (
                  <button
                    type="button"
                    key={txn.id || txn.Id}
                    onClick={() => router.push("/status")}
                    className={`w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border bg-gradient-to-br ${style.soft} hover:shadow-sm transition-all`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {txn.serviceName || txn.ServiceName || "Service"}
                        </h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                          {applicant || "—"}
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {formatTxnDateTime(
                            txn.createdDate ||
                              txn.CreatedDate ||
                              txn.date ||
                              "",
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(txn.cost || txn.Cost || txn.amount || 0).toFixed(2)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${style.pill}`}
                      >
                        {txn.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">
                  <Wallet size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Request Wallet Top-up
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Transfer fund requests to your distributor account.
                  </p>
                </div>
              </div>

              <form onSubmit={handleWalletRequest} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                    Top-up Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount (e.g. 500)"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#005c3a] font-semibold"
                    required
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                    Payment Transaction UTR
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit transaction ID"
                    value={requestUtr}
                    onChange={(e) => setRequestUtr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#005c3a] font-semibold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="border border-slate-250 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#005c3a] text-white rounded-xl px-4 py-2 text-xs font-bold hover:opacity-90 transition-all shadow-md"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
