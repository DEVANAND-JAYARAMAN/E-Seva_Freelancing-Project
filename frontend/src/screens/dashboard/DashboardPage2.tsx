"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../store/context/AuthContext";
import {
  Wallet,
  CircleDollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Compass,
  Zap,
  RefreshCw,
  XCircle,
  Store,
} from "lucide-react";

export function DashboardPage2({
  forceRole,
}: {
  forceRole?: "retailer" | "distributor";
}) {
  const { user: contextUser, updateWallet } = useAuth();
  const user = forceRole ? { ...contextUser, role: forceRole } : contextUser;

  // State for wallet request popup
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestUtr, setRequestUtr] = useState("");

  const [notifications, setNotifications] = useState<string[]>([
    "Your wallet request for ₹2500 has been approved.",
    "System Alert: PAN Card verification server speed optimized.",
  ]);

  const handleWalletRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount || isNaN(Number(requestAmount))) return;

    // Simulate updating wallet balance immediately for seamless demo
    const newBalance = (user?.walletBalance || 0) + Number(requestAmount);
    updateWallet(newBalance);

    setNotifications((prev) => [
      `Successfully loaded ₹${requestAmount} via UTR ${requestUtr || "MOCK-UTR-9092"}`,
      ...prev,
    ]);

    setShowRequestModal(false);
    setRequestAmount("");
    setRequestUtr("");
  };

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live requests specific to user
    const userFilter = user?.id ? `?userId=${user.id}` : "";
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/services/requests${userFilter}`)
      .then(res => res.json())
      .then(data => {
        const dataArray = Array.isArray(data) ? data : [];
        const sorted = dataArray.sort((a: any, b: any) => 
          new Date(b.createdDate || "").getTime() - new Date(a.createdDate || "").getTime()
        ).slice(0, 5); // top 5 recent
        setTransactions(sorted);
      })
      .catch(console.error);
  }, [user]);

  return (
    <AppShell activePage="Dashboard">
      <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Welcome Header Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-[#005c3a] to-emerald-900 dark:from-emerald-950 dark:via-[#003822] dark:to-emerald-950 p-6 lg:p-8 text-white shadow-xl">
          <div className="absolute top-[-20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-white/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider text-emerald-250">
                <Compass size={12} className="text-emerald-400" />
                <span>Thuruvan Terminal Portal</span>
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                Hello, <span className="capitalize">{user?.name || "Ram"}</span>
                !
              </h2>
              <p className="text-xs text-emerald-100/70 max-w-xl font-medium">
                Manage utility updates, track high-speed transactions, and
                overview your secure agency operations.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <span className="flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  Account Type
                </span>
                <span className="text-sm font-extrabold uppercase bg-white/15 px-3 py-1 rounded-lg border border-white/10 mt-1 shadow-inner tracking-wide">
                  {user?.role === "distributor"
                    ? "Distributor Network"
                    : "Retailer Partner"}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic State Overview Cards Grid (8 Cards) */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300"
          aria-label="Partner stats"
        >
          {/* Card 1: PENDING */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pending
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Awaiting Verification
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-55 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 bg-purple-50">
              <Clock size={18} />
            </span>
          </article>

          {/* Card 2: INPROCESS */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Inprocess
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Currently Processing
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
              <Zap size={18} />
            </span>
          </article>

          {/* Card 3: RESUBMIT */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Resubmit
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Needs Correction
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400">
              <RefreshCw size={18} />
            </span>
          </article>

          {/* Card 4: REJECTED */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Rejected
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Declined Submissions
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
              <XCircle size={18} />
            </span>
          </article>

          {/* Card 5: APPROVED */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Approved
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Completed Requests
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
              <CheckCircle size={18} />
            </span>
          </article>

          {/* Card 6: WALLET */}
          <article
            onClick={() => setShowRequestModal(true)}
            className="cursor-pointer flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                ₹
                {user?.walletBalance !== undefined
                  ? user.walletBalance.toFixed(2)
                  : "2895.00"}
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Available balance
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
              <Wallet size={18} />
            </span>
          </article>

          {/* Card 7: WALLET REQUEST */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet Request
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Pending approvals
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-405">
              <CircleDollarSign size={18} />
            </span>
          </article>

          {/* Card 8: CUSTOMERS */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Customers
              </p>
              <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                0
              </strong>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                Subscribed Clients
              </span>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-655 dark:text-blue-400">
              <Users size={18} />
            </span>
          </article>

          {/* Card 9: RETAILERS (Only for Distributor) */}
          {user?.role === "distributor" && (
            <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Retailers
                </p>
                <strong className="block text-2xl font-black text-slate-900 dark:text-white">
                  12
                </strong>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                  Registered Agents
                </span>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
                <Store size={18} />
              </span>
            </article>
          )}
        </section>

        {/* Notifications Ribbon Alert */}
        {notifications.length > 0 && (
          <div className="bg-[#e8f5e9]/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
            <CheckCircle
              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
              size={16}
            />
            <div className="flex-1 text-xs font-bold text-emerald-800 dark:text-emerald-350">
              <span className="uppercase tracking-wider mr-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                Latest Alert
              </span>
              {notifications[0]}
            </div>
          </div>
        )}

        {/* Our Services Status Table section */}
        <section className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-900/60 pb-3">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">
              Our Services Status
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5 font-medium">
              Real-time verification and processing status of your submitted
              service applications.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center p-4 text-sm text-slate-500">No recent transactions found</div>
            ) : transactions.map((txn) => {
              // Exact colors matched to standard stages
              const statusColors: Record<string, string> = {
                Approved:
                  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20",
                Pending:
                  "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20",
                Inprocess:
                  "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20",
                Processing:
                  "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20",
                Resubmit:
                  "bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20",
                Rejected:
                  "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-405 border border-red-100 dark:border-red-900/20",
                Completed:
                  "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/20",
              };
              const colorClass =
                statusColors[txn.status] || "bg-slate-50 text-slate-600";

              return (
                <div
                  key={txn.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-50 dark:border-slate-900/50 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400">
                      {txn.status === "Approved" || txn.status === "Completed" ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : txn.status === "Pending" ? (
                        <Clock size={16} className="text-amber-500" />
                      ) : txn.status === "Inprocess" || txn.status === "Processing" ? (
                        <Zap size={16} className="text-blue-500" />
                      ) : txn.status === "Resubmit" ? (
                        <RefreshCw size={16} className="text-purple-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {txn.serviceName || txn.service}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold block mt-0.5">
                        {txn.createdDate ? new Date(txn.createdDate).toLocaleDateString() : txn.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{txn.cost || txn.amount || "0.00"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest block mt-0.5 font-mono">
                        {txn.id}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${colorClass}`}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modal Dialog: Load Funds / Wallet Request */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 shadow-inner">
                  <Wallet size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Request Wallet Top-up
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold">
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 font-semibold"
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#005c3a] dark:bg-emerald-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
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
