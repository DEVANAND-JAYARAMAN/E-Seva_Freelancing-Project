"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Sparkles,
  Search,
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  ArrowUpRight,
  Filter,
  DollarSign,
  Building,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../store/context/AuthContext";
import {
  initialPaymentRequests,
  initialTransactions,
  type PaymentRequest,
  type WalletTransaction,
} from "../config/data";

export function PaymentsPage() {
  const { user, updateWallet } = useAuth();

  // Shared Local Storage States (to sync with WalletPage in real-time)
  const [paymentRequests, setPaymentRequests] = useLocalStorage<
    PaymentRequest[]
  >("thuruvan_payment_requests", initialPaymentRequests);

  const [transactions, setTransactions] = useLocalStorage<WalletTransaction[]>(
    "thuruvan_wallet_transactions",
    initialTransactions,
  );

  const [apiBalance, setApiBalance] = useLocalStorage<number>(
    "thuruvan_api_balance",
    4.0,
  );

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Approved" | "Resubmit" | "Rejected"
  >("all");
  const [walletFilter, setWalletFilter] = useState<"all" | "Main" | "API">(
    "all",
  );

  // Selected Request for Side Drawer / Details View
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(
    null,
  );

  // Action input states (Reason for Rejection / Notes for Resubmission)
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState<
    "approve" | "reject" | "resubmit" | null
  >(null);

  // Calculate high-fidelity aggregates
  const aggregates = useMemo(() => {
    const pendingList = paymentRequests.filter((r) => r.status === "Pending");
    const approvedList = paymentRequests.filter((r) => r.status === "Approved");
    const resubmitList = paymentRequests.filter((r) => r.status === "Resubmit");

    const totalRequested = paymentRequests.reduce(
      (sum, r) => sum + r.amount,
      0,
    );
    const pendingAmount = pendingList.reduce((sum, r) => sum + r.amount, 0);
    const approvedAmount = approvedList.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalRequested,
      pendingCount: pendingList.length,
      pendingAmount,
      approvedCount: approvedList.length,
      approvedAmount,
      resubmitCount: resubmitList.length,
    };
  }, [paymentRequests]);

  // Filter requests based on search term, status and wallet type
  const filteredRequests = useMemo(() => {
    return paymentRequests.filter((r) => {
      const matchesSearch =
        r.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.utrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.amount.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ? true : r.status === statusFilter;
      const matchesWallet =
        walletFilter === "all" ? true : r.walletType === walletFilter;

      return matchesSearch && matchesStatus && matchesWallet;
    });
  }, [paymentRequests, searchTerm, statusFilter, walletFilter]);

  // Process payment request status change (Approve, Reject, Resubmit)
  const processRequest = (
    requestId: string,
    action: "Approved" | "Rejected" | "Resubmit",
    notes?: string,
  ) => {
    let targetRequest: PaymentRequest | undefined;

    // Update payment request status
    setPaymentRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetRequest = {
            ...req,
            status: action,
            adminNotes: notes || undefined,
          };
          return targetRequest;
        }
        return req;
      }),
    );

    // If approved, dynamically credit the appropriate wallet balance and log a transaction
    if (action === "Approved" && targetRequest) {
      const amountToCredit = targetRequest.amount;

      if (targetRequest.walletType === "Main") {
        // Credit Retailer's Main Wallet
        // In this mock context, since user is the active retailer, we also update their balance if they matched
        if (user && targetRequest.retailerId === user.id) {
          updateWallet(user.walletBalance + amountToCredit);
        }
      } else if (targetRequest.walletType === "API") {
        // Credit API Wallet
        setApiBalance((prev) => prev + amountToCredit);
      }

      // Add a success transaction inside the ledger list
      const successTx: WalletTransaction = {
        id: `tx-appr-${Date.now()}`,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        type: "credit",
        description: `Wallet Recharge Approved (UTR: ${targetRequest.utrNumber})`,
        amount: amountToCredit,
        reference: targetRequest.utrNumber,
        status: "Success",
        walletType: targetRequest.walletType,
      };

      // Also filter out any "Pending" placeholder transaction created with this UTR in WalletPage
      setTransactions((prev) => {
        const filtered = prev.filter(
          (tx) =>
            !(
              tx.reference === targetRequest?.utrNumber &&
              tx.status === "Pending"
            ),
        );
        return [successTx, ...filtered];
      });
    }

    // If rejected or resubmitted, update any corresponding pending transaction in the ledger to "Failed" or "Pending" with admin notes
    if ((action === "Rejected" || action === "Resubmit") && targetRequest) {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (
            tx.reference === targetRequest?.utrNumber &&
            tx.status === "Pending"
          ) {
            return {
              ...tx,
              status: action === "Rejected" ? "Failed" : "Pending",
              description: `${action} Wallet Recharge (${targetRequest?.paymentMode}): ${notes || "No notes"}`,
            };
          }
          return tx;
        }),
      );
    }

    // Clean up drawer states
    setSelectedRequest((prev) =>
      prev?.id === requestId
        ? { ...prev, status: action, adminNotes: notes || undefined }
        : prev,
    );
    setShowNoteInput(null);
    setAdminNoteInput("");
  };

  return (
    <AppShell activePage="Payments">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <CreditCard size={12} />
              </span>
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                Admin Gateway{" "}
                <Sparkles size={10} className="text-yellow-500 animate-pulse" />
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Payment Request Management
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Audit merchant payment receipts, verify UTR bank reference
              numbers, and approve or request resubmission for fund recharge
              tickets.
            </p>
          </div>
        </div>

        {/* Aggregates Metrics Grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          aria-label="Requests stats"
        >
          {/* Total Pending Count */}
          <article className="flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                PENDING REQUESTS
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-55/10 text-amber-500 dark:text-amber-400">
                <Clock size={14} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {aggregates.pendingCount}
              </strong>
              <span className="text-[10px] font-bold text-amber-650 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg">
                Action Required
              </span>
            </div>
          </article>

          {/* Pending Amount */}
          <article className="flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                PENDING VALUE
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600">
                <DollarSign size={14} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="text-base font-semibold text-slate-400 dark:text-slate-600 mr-0.5">
                  ₹
                </span>
                {aggregates.pendingAmount.toLocaleString("en-IN")}
              </strong>
            </div>
          </article>

          {/* Total Approved Amount */}
          <article className="flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                APPROVED VOLUME
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f5e9] dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">
                <CheckCircle2 size={14} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="text-base font-semibold text-slate-400 dark:text-slate-600 mr-0.5">
                  ₹
                </span>
                {aggregates.approvedAmount.toLocaleString("en-IN")}
              </strong>
              <span className="text-[10px] font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                {aggregates.approvedCount} approved
              </span>
            </div>
          </article>

          {/* Rebuttals Count */}
          <article className="flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505">
                RESUBMIT QUEUE
              </p>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650">
                <MessageSquare size={14} />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {aggregates.resubmitCount}
              </strong>
              <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-lg">
                Awaiting Fixes
              </span>
            </div>
          </article>
        </div>

        {/* Requests Management Grid / Sidebar Drawer layout */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Main requests queue table */}
          <div className="xl:col-span-2 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Payment Verification Queue
              </h4>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-48">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search UTR, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-[11px] text-slate-700 dark:text-slate-350 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                </div>

                {/* Status selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-[11px] text-slate-650 dark:text-slate-400 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Resubmit">Resubmit</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Wallet Filter */}
                <select
                  value={walletFilter}
                  onChange={(e) => setWalletFilter(e.target.value as any)}
                  className="px-3 py-1.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-[11px] text-slate-650 dark:text-slate-400 outline-none"
                >
                  <option value="all">All Wallets</option>
                  <option value="Main">Main Wallet</option>
                  <option value="API">API Wallet</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-900/40 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-900/60 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-extrabold tracking-wider">
                    <th className="py-4 px-4">Retailer / Shop</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">UTR Number</th>
                    <th className="py-4 px-4">Wallet Type</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50 text-slate-650 dark:text-slate-350 text-xs">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowNoteInput(null);
                        }}
                        className={`cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all ${
                          selectedRequest?.id === req.id
                            ? "bg-slate-50/80 dark:bg-slate-900/30 font-semibold"
                            : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-white leading-tight">
                              {req.retailerName}
                            </p>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                              {req.shopName}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                          ₹{req.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {req.utrNumber}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                              req.walletType === "Main"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450"
                                : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400"
                            }`}
                          >
                            {req.walletType}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold ${
                              req.status === "Approved"
                                ? "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-450"
                                : req.status === "Pending"
                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                                  : req.status === "Resubmit"
                                    ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(req);
                              setShowNoteInput(null);
                            }}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                          >
                            Verify Slip
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-400 dark:text-slate-550 font-semibold"
                      >
                        No matching payment request records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              💡 Tip: Click on any row to open the high-fidelity bank receipt
              audit sheet on the right side.
            </p>
          </div>

          {/* Right Verification Sheet (Dynamic Card details / Bank Receipt verification drawer) */}
          <div className="xl:col-span-1 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col gap-5 min-h-[500px]">
            {selectedRequest ? (
              <div className="flex flex-col gap-5 h-full justify-between">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                      <FileText size={14} />
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Payment Audit Slip
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Styled Digital Bank Receipt */}
                <article className="bg-slate-50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-sans relative overflow-hidden flex flex-col gap-4">
                  {/* Decorative circular notch cuts */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-slate-800" />

                  {/* Receipt Brand header */}
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <span>Thuruvan E-Services</span>
                    <span className="text-[#005c3a] dark:text-emerald-400">
                      ★ Official Receipt
                    </span>
                  </div>

                  {/* Payment Amount */}
                  <div className="text-center py-2 border-y border-dashed border-slate-200 dark:border-slate-800 my-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      TRANSFER AMOUNT
                    </p>
                    <h5 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                      ₹
                      {selectedRequest.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </h5>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                        Merchant Agent
                      </p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {selectedRequest.retailerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                        Shop Name
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                        {selectedRequest.shopName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                        Channel Mode
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-350 mt-0.5">
                        {selectedRequest.paymentMode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                        Destination
                      </p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
                        {selectedRequest.walletType} Wallet
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                        Bank UTR / Reference ID
                      </p>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-100 text-xs mt-0.5 tracking-wide bg-white dark:bg-slate-900/60 p-1.5 border border-slate-100 dark:border-slate-850 rounded-lg">
                        {selectedRequest.utrNumber}
                      </p>
                    </div>
                    {selectedRequest.remarks && (
                      <div className="col-span-2">
                        <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase">
                          Agent Remarks
                        </p>
                        <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5 italic">
                          {`"${selectedRequest.remarks}"`}
                        </p>
                      </div>
                    )}
                    {selectedRequest.adminNotes && (
                      <div className="col-span-2 bg-yellow-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl text-amber-700 dark:text-amber-400">
                        <p className="text-[9px] font-extrabold uppercase tracking-wide">
                          Verification Response Notes
                        </p>
                        <p className="mt-0.5 font-bold leading-normal">
                          {selectedRequest.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </article>

                {/* Operations Action Bar */}
                <div className="flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-1">
                  {selectedRequest.status === "Pending" ? (
                    <>
                      {showNoteInput ? (
                        <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 animate-in slide-in-from-bottom-2 duration-200">
                          <label className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                            Add notes for{" "}
                            {showNoteInput === "approve"
                              ? "Approval"
                              : showNoteInput === "reject"
                                ? "Rejection"
                                : "Resubmission"}
                          </label>
                          <textarea
                            placeholder={
                              showNoteInput === "reject"
                                ? "Enter rejection reason (e.g. UTR matches an older transaction)"
                                : showNoteInput === "resubmit"
                                  ? "Enter resubmission requirements (e.g. upload clear screenshot of payment confirmation)"
                                  : "Add optional verification notes"
                            }
                            value={adminNoteInput}
                            onChange={(e) => setAdminNoteInput(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/40 text-xs text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                            required={showNoteInput !== "approve"}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowNoteInput(null);
                                setAdminNoteInput("");
                              }}
                              className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-100/60 dark:hover:bg-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                const action =
                                  showNoteInput === "approve"
                                    ? "Approved"
                                    : showNoteInput === "reject"
                                      ? "Rejected"
                                      : "Resubmit";
                                processRequest(
                                  selectedRequest.id,
                                  action,
                                  adminNoteInput.trim(),
                                );
                              }}
                              className={`flex-1 py-2 rounded-xl text-xs font-extrabold text-white ${
                                showNoteInput === "approve"
                                  ? "bg-[#005c3a] dark:bg-emerald-600 hover:bg-emerald-700"
                                  : showNoteInput === "reject"
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : "bg-indigo-600 hover:bg-indigo-750"
                              }`}
                            >
                              Confirm Action
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          <button
                            onClick={() => setShowNoteInput("approve")}
                            className="w-full py-3 bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
                          >
                            <Check size={15} className="stroke-[3]" />
                            Approve Recharge Request
                          </button>

                          <div className="flex gap-2.5">
                            <button
                              onClick={() => setShowNoteInput("resubmit")}
                              className="flex-1 py-2.8 border border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900/60 dark:hover:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                            >
                              <MessageSquare size={13} />
                              Resubmit Ticket
                            </button>
                            <button
                              onClick={() => setShowNoteInput("reject")}
                              className="flex-1 py-2.8 border border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                            >
                              <X size={13} />
                              Reject Slip
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                      {selectedRequest.status === "Approved" ? (
                        <>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-[#005c3a] dark:text-emerald-400">
                              Approved & Settled
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              {
                                "Funds have been successfully loaded onto the merchant's "
                              }
                              {selectedRequest.walletType}
                              {" balance ledger."}
                            </p>
                          </div>
                        </>
                      ) : selectedRequest.status === "Resubmit" ? (
                        <>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400">
                            <Clock size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                              Rebuttals Sent
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Waiting for the merchant agent to re-upload
                              reference records matching notes.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400">
                            <AlertCircle size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-rose-650 dark:text-rose-400">
                              Ticket Rejected
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              This payment slip has been flagged as invalid and
                              rejected from the system.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 my-auto py-12">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400">
                  <Building size={20} />
                </span>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    No Slip Selected
                  </h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-relaxed mx-auto">
                    Select a retailer request entry from the table queue on the
                    left to verify transaction details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
