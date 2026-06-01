"use client";

import { useState, useMemo } from "react";
import {
  Wallet,
  CircleDollarSign,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../store/context/AuthContext";
import {
  initialTransactions,
  initialPaymentRequests,
  type WalletTransaction,
  type PaymentRequest,
} from "../config/data";

export function WalletPage() {
  const { user, updateWallet } = useAuth();
  const isRetailerOrDistributor = user?.role === "retailer" || user?.role === "distributor";

  // Balances
  const mainBalance = user?.walletBalance ?? 2895.0;
  const [apiBalance, setApiBalance] = useLocalStorage<number>(
    "thuruvan_api_balance",
    4.0,
  );

  // Transactions list via local storage
  const [transactions, setTransactions] = useLocalStorage<WalletTransaction[]>(
    "thuruvan_wallet_transactions",
    initialTransactions,
  );

  // Payment Requests list via local storage (to sync with Admin Verification panel)
  const [paymentRequests, setPaymentRequests] = useLocalStorage<
    PaymentRequest[]
  >("thuruvan_payment_requests", initialPaymentRequests);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">(
    "all",
  );
  const [walletFilter, setWalletFilter] = useState<"all" | "Main" | "API">(
    "all",
  );

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<"Main" | "API">(
    "Main",
  );
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<
    "UPI" | "IMPS" | "NEFT" | "Bank Transfer"
  >("UPI");
  const [utrNumber, setUtrNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Compute stats
  const stats = useMemo(() => {
    const mainCredit = transactions
      .filter(
        (t) =>
          t.walletType === "Main" &&
          t.type === "credit" &&
          t.status === "Success",
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const mainDebit = transactions
      .filter(
        (t) =>
          t.walletType === "Main" &&
          t.type === "debit" &&
          t.status === "Success",
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const apiCredit = transactions
      .filter(
        (t) =>
          t.walletType === "API" &&
          t.type === "credit" &&
          t.status === "Success",
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalCredits: isRetailerOrDistributor ? mainCredit : mainCredit + apiCredit,
      totalDebits: mainDebit,
    };
  }, [transactions, isRetailerOrDistributor]);

  // Handle transaction search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (isRetailerOrDistributor && t.walletType === "API") return false;

      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm);

      const matchesType = typeFilter === "all" ? true : t.type === typeFilter;
      const matchesWallet =
        walletFilter === "all" ? true : t.walletType === walletFilter;

      return matchesSearch && matchesType && matchesWallet;
    });
  }, [transactions, searchTerm, typeFilter, walletFilter, isRetailerOrDistributor]);

  // Open Recharge Form Modal
  const openRechargeModal = (type: "Main" | "API") => {
    setSelectedWalletType(type);
    setAmount("");
    setUtrNumber("");
    setUpiId("");
    setGatewayProcessing(false);
    setRemarks("");
    setFormError("");
    setFormSuccess(false);
    setIsModalOpen(true);
  };

  // Submit Recharge Request
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate inputs
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setFormError("Please enter a valid recharge amount greater than ₹0.");
      return;
    }

    if (paymentMode === "UPI" && !upiId.trim()) {
      setFormError("Please enter a valid UPI ID.");
      return;
    }

    if ((paymentMode === "NEFT" || paymentMode === "Bank Transfer") && !utrNumber.trim()) {
      setFormError("Transaction Reference/UTR Number is required for this mode.");
      return;
    }

    if ((paymentMode === "NEFT" || paymentMode === "Bank Transfer") && utrNumber.trim().length < 8) {
      setFormError(
        "UTR / Reference number must be at least 8 characters long.",
      );
      return;
    }

    if (paymentMode === "UPI" || paymentMode === "IMPS") {
      setGatewayProcessing(true);
      
      try {
        const reqBody = {
          amount: amtNum,
          customer_mobile: paymentMode === "UPI" ? upiId : (user?.phone || "9999999999"),
          customer_email: user?.email || "user@example.com",
          redirect_url: window.location.origin
        };

        // Calling our backend API instead of exposing Mugavai credentials
        const response = await fetch("http://localhost:8080/api/v1/wallet/recharge/gateway", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authorization token if your app uses one
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify(reqBody)
        });

        const data = await response.json();

        if (response.ok && data.data?.payment_url) {
          const width = 500;
          const height = 700;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          const popup = window.open(data.data.payment_url, "Mugavai Payment", `width=${width},height=${height},left=${left},top=${top}`);
          
          const pollTimer = setInterval(() => {
            if (!popup || popup.closed) {
              clearInterval(pollTimer);
              setGatewayProcessing(false);
              completeRequest(data.data.order_id);
            }
          }, 1000);
        } else {
          setGatewayProcessing(false);
          setFormError(data.message || "Failed to initiate payment gateway.");
        }
      } catch (err) {
        setGatewayProcessing(false);
        setFormError("Error connecting to Mugavai Payment Gateway.");
      }
      return;
    }

    completeRequest(utrNumber.trim());
  };

  const completeRequest = (finalUtr: string) => {
    const amtNum = parseFloat(amount);
    // Create a new Payment Request
    const newRequest: PaymentRequest = {
      id: `req-${Date.now()}`,
      retailerId: user?.id ?? "usr_1001",
      retailerName: user?.name ?? "Thuruvan Dev",
      shopName: "Thuruvan Headquarters",
      amount: amtNum,
      paymentMode,
      utrNumber: finalUtr,
      status: "Pending",
      requestDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      walletType: selectedWalletType,
      remarks: remarks.trim() || undefined,
    };

    // Save to payment requests list in local storage
    setPaymentRequests((prev) => [newRequest, ...prev]);

    // Add a corresponding "Pending" transaction inside the user's ledger as well
    const newTransaction: WalletTransaction = {
      id: `tx-req-${Date.now()}`,
      date: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      type: "credit",
      description: `Pending Wallet Recharge Request (${paymentMode})`,
      amount: amtNum,
      reference: finalUtr,
      status: "Pending",
      walletType: selectedWalletType,
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    // Success response
    setFormSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormSuccess(false);
    }, 1800);
  };

  // Reset to default seeds
  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all wallet transaction history and requests to defaults?",
      )
    ) {
      setTransactions(initialTransactions);
      setPaymentRequests(initialPaymentRequests);
      setApiBalance(4.0);
      updateWallet(2895.0);
    }
  };

  return (
    <AppShell activePage="Wallet">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400">
                <Wallet size={12} />
              </span>
              <span className="text-[10px] font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                E-Seva Wallet Hub
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              My Wallet Balance & History
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Add balance to your wallets, check real-time service deduction
              records, and audit all transaction histories below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all duration-200"
              title="Reset mock transactions and requests"
            >
              <RefreshCw size={13} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
        {/* Balance Cards Display */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isRetailerOrDistributor ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-5`}>
          {/* Main Wallet Card */}
          <article className="relative overflow-hidden bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e] text-white rounded-3xl p-6 shadow-md shadow-emerald-900/10 flex flex-col justify-between min-h-[175px] group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-32 w-32 rounded-full bg-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-extrabold tracking-widest text-emerald-200/80 uppercase">
                  MAIN WALLET
                </p>
                <h3 className="text-3xl font-black mt-2 tracking-tight">
                  <span className="text-xl font-bold text-emerald-300 mr-0.5">
                    ₹
                  </span>
                  {mainBalance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
                <Wallet size={18} />
              </span>
            </div>

            <div className="flex justify-between items-end mt-4">
              <span className="text-[10px] font-bold text-emerald-300 bg-white/10 px-2.5 py-1 rounded-lg">
                🟢 Active Account
              </span>
              <button
                onClick={() => openRechargeModal("Main")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#005c3a] hover:bg-emerald-50 text-xs font-extrabold rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Plus size={14} className="stroke-[3]" />
                Recharge
              </button>
            </div>
          </article>

          {/* API Wallet Card */}
          {!isRetailerOrDistributor && (
            <article className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 dark:from-[#0f1124] dark:to-[#070813] text-white rounded-3xl p-6 shadow-md shadow-indigo-950/20 flex flex-col justify-between min-h-[175px] group">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-32 w-32 rounded-full bg-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-extrabold tracking-widest text-indigo-200/80 uppercase">
                    API WALLET
                  </p>
                  <h3 className="text-3xl font-black mt-2 tracking-tight">
                    <span className="text-xl font-bold text-indigo-300 mr-0.5">
                      ₹
                    </span>
                    {apiBalance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
                  <CircleDollarSign size={18} />
                </span>
              </div>

              <div className="flex justify-between items-end mt-4">
                <span className="text-[10px] font-bold text-indigo-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  ⚡ API Linked
                </span>
                <button
                  onClick={() => openRechargeModal("API")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-extrabold rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Recharge
                </button>
              </div>
            </article>
          )}

          {/* Aggregate Total Credit Card */}
          <article className="flex items-center gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={22} className="stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                TOTAL CREDITS
              </p>
              <strong className="block text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-650 mr-0.5">
                  ₹
                </span>
                {stats.totalCredits.toLocaleString("en-IN")}
              </strong>
            </div>
          </article>

          {/* Aggregate Total Debit Card */}
          <article className="flex items-center gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450">
              <ArrowDownLeft size={22} className="stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                TOTAL DEBITS
              </p>
              <strong className="block text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-655 mr-0.5">
                  ₹
                </span>
                {stats.totalDebits.toLocaleString("en-IN")}
              </strong>
            </div>
          </article>
        </div>

        {/* Interactive Transaction Ledger Section */}
        <section className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
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
                  Comprehensive audit trail of all transactions.
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

              {/* Wallet Filter Toggle */}
              {!isRetailerOrDistributor && (
                <div className="flex bg-slate-100 dark:bg-slate-950/60 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-900/80">
                  <button
                    onClick={() => setWalletFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                      walletFilter === "all"
                        ? "bg-white dark:bg-[#0f1524] text-slate-850 dark:text-white shadow-sm"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setWalletFilter("Main")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                      walletFilter === "Main"
                        ? "bg-white dark:bg-[#0f1524] text-slate-850 dark:text-white shadow-sm"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                    }`}
                  >
                    Main
                  </button>
                  <button
                    onClick={() => setWalletFilter("API")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                      walletFilter === "API"
                        ? "bg-white dark:bg-[#0f1524] text-slate-850 dark:text-white shadow-sm"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                    }`}
                  >
                    API
                  </button>
                </div>
              )}

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
                      ? "bg-white dark:bg-[#0f1524] text-rose-600 dark:text-rose-450 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Debits
                </button>
              </div>

              {/* Export button */}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition-all">
                <Download size={13} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-900/40 rounded-2xl">
            <table className="w-full text-left border-collapse">
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
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === "credit";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="py-4 px-5 font-semibold text-slate-450 dark:text-slate-500 shrink-0">
                          {tx.date}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {tx.reference}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                              tx.walletType === "Main"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400"
                                : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {tx.walletType}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-semibold">
                          {tx.description}
                        </td>
                        <td
                          className={`py-4 px-5 text-right font-extrabold text-sm ${
                            isCredit
                              ? "text-[#005c3a] dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-450"
                          }`}
                        >
                          {isCredit ? "+" : "-"} ₹{tx.amount.toFixed(2)}
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
                            {tx.status}
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

          {/* Simple Mock Pagination */}
          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-900/50 pt-4 text-xs font-semibold text-slate-450 dark:text-slate-500">
            <p>
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              entries
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 text-slate-350 dark:text-slate-650 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 text-slate-350 dark:text-slate-650 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Modal: Recharge Wallet Request */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur Overlay */}
            <div
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10 p-6 flex flex-col gap-5">
              {/* Form Success State Screen */}
              {formSuccess ? (
                <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450 animate-bounce">
                    <CheckCircle2 size={36} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Request Submitted!
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Your recharge request has been recorded. Our
                      administrators will verify the UTR reference number
                      shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450">
                        <Plus size={16} />
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Recharge Request ({selectedWalletType})
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Form fields */}
                  <form
                    onSubmit={handleRechargeSubmit}
                    className="flex flex-col gap-4"
                  >
                    {formError && (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Amount field */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Amount to Recharge (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                        required
                        min="1"
                      />
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Payment Mode / channel
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as any)}
                        className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                      >
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="IMPS">IMPS Instant Transfer</option>
                        <option value="NEFT">NEFT / RTGS Transfer</option>
                        <option value="Bank Transfer">
                          Direct Bank Cash Deposit
                        </option>
                      </select>
                    </div>

                    {/* Dynamic Gateway / Payment Mode Options */}
                    {paymentMode === "UPI" && (
                      <div className="space-y-1.5 animate-in fade-in zoom-in duration-200">
                        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Enter UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. user@okicici or 9876543210@ybl"
                          value={upiId}
                          onChange={(e) => { setUpiId(e.target.value); setFormError(""); }}
                          className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-normal">
                          A payment request will be sent to this UPI ID via Mugavai Gateway.
                        </p>
                      </div>
                    )}

                    {paymentMode === "IMPS" && (
                      <div className="space-y-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-6 w-6 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">M</span>
                          <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Mugavai Payment Gateway</span>
                        </div>
                        <p className="text-[10px] font-medium text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                          You will be redirected to the Mugavai secure payment gateway to complete this IMPS transfer instantly using available options.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                           <span className="px-2 py-1 bg-white dark:bg-[#0f1124] rounded border border-indigo-100 dark:border-indigo-800 text-[9px] font-bold text-indigo-800 dark:text-indigo-300">Net Banking</span>
                           <span className="px-2 py-1 bg-white dark:bg-[#0f1124] rounded border border-indigo-100 dark:border-indigo-800 text-[9px] font-bold text-indigo-800 dark:text-indigo-300">Debit / Credit Card</span>
                           <span className="px-2 py-1 bg-white dark:bg-[#0f1124] rounded border border-indigo-100 dark:border-indigo-800 text-[9px] font-bold text-indigo-800 dark:text-indigo-300">IMPS Portal</span>
                        </div>
                      </div>
                    )}

                    {(paymentMode === "NEFT" || paymentMode === "Bank Transfer") && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          UTR / Transaction Reference Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter 12-digit UTR or Ref ID"
                          value={utrNumber}
                          onChange={(e) => { setUtrNumber(e.target.value); setFormError(""); }}
                          className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-normal">
                          Make sure to double-check this reference number. Wrong
                          UTR numbers will lead to immediate rejection.
                        </p>
                      </div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Add Remarks (Optional)
                      </label>
                      <textarea
                        placeholder="e.g. Urgent add, UPI paid from retail counter GPay"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={gatewayProcessing}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {gatewayProcessing ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Connecting to Gateway...
                          </>
                        ) : paymentMode === "UPI" || paymentMode === "IMPS" ? (
                          "Initiate Payment"
                        ) : (
                          "Submit Request"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
