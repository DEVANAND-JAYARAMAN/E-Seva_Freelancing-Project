"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wallet,
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
  ChevronDown,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/context/AuthContext";
import { type WalletTransaction, type PaymentRequest } from "../config/data";
import { apiUrl, authFetch } from "../utils/apiBase";
import { formatTxnDateTime, nowTxnDateTime } from "../utils/formatters";

function mapTx(raw: any): WalletTransaction {
  const typeRaw = String(raw.type || "").toLowerCase();
  const type: "credit" | "debit" = typeRaw === "debit" ? "debit" : "credit";
  const statusRaw = String(raw.status || "Success");
  const status =
    statusRaw === "Failed" || statusRaw === "Pending"
      ? statusRaw
      : ("Success" as const);
  return {
    id: String(raw.id || raw.SK || `tx-${Date.now()}`),
    date: formatTxnDateTime(raw.dateTime || raw.createdAt || raw.date || ""),
    type,
    description: String(raw.description || ""),
    amount: Number(raw.amount || 0),
    reference: String(raw.reference || raw.partnerRef || ""),
    status,
    walletType: raw.walletType === "API" ? "API" : "Main",
  };
}

export function WalletPage() {
  const { user, updateWallet, refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // After gateway redirect back to /wallets/#payment-return (or ?add=1)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = (window.location.hash || "").replace(/^#/, "");
    const paymentReturn =
      params.get("payment") === "return" ||
      hash === "payment-return" ||
      hash.startsWith("payment-return") ||
      !!params.get("order_id") ||
      !!params.get("status");
    const openAdd = params.get("add") === "1";

    if (paymentReturn) {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
        /(?:\/api|\/)+$/,
        "",
      );
      let orderId =
        params.get("order_id") ||
        params.get("client_txn_id") ||
        params.get("txn_id") ||
        "";
      try {
        if (!orderId) {
          orderId = sessionStorage.getItem("wallet_recharge_order") || "";
        }
      } catch {
        /* ignore */
      }
      const statusParam = params.get("status") || "";
      const utrParam =
        params.get("utr") ||
        params.get("upi_txn_id") ||
        params.get("bank_txn_id") ||
        "";
      let storedAmount = 0;
      try {
        storedAmount = Number(
          sessionStorage.getItem("wallet_recharge_amount") || "0",
        );
      } catch {
        /* ignore */
      }

      const verify = async () => {
        setIsModalOpen(true);
        setGatewayProcessing(true);
        setFormError("");

        // Confirm credit from site (no api.* browser visit)
        if (orderId) {
          try {
            await authFetch(`${baseUrl}/api/wallet/recharge/confirm`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                order_id: orderId,
                status: statusParam || "SUCCESS",
                utr: utrParam,
              }),
            });
          } catch {
            /* webhook may still complete */
          }
        }

        let finalStatus = "Pending";
        if (orderId) {
          for (let i = 0; i < 20; i++) {
            try {
              const statusRes = await authFetch(
                `${baseUrl}/api/wallet/recharge/status/${orderId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                },
              );
              const statusData = await statusRes.json().catch(() => ({}));
              finalStatus = String(statusData.status || "Pending");
              if (
                finalStatus === "Success" ||
                finalStatus === "SUCCESS" ||
                finalStatus === "success"
              ) {
                break;
              }
            } catch {
              /* retry */
            }
            await new Promise((r) => setTimeout(r, 2000));
          }
        }

        setGatewayProcessing(false);
        void refreshProfile();

        if (
          finalStatus === "Success" ||
          finalStatus === "SUCCESS" ||
          finalStatus === "success"
        ) {
          if (storedAmount > 0) {
            setAmount(String(storedAmount));
          }
          setFormSuccess(true);
          setFormError("");
          try {
            sessionStorage.removeItem("wallet_recharge_order");
            sessionStorage.removeItem("wallet_recharge_amount");
          } catch {
            /* ignore */
          }
        } else {
          setFormError(
            "Payment is still confirming. If money was deducted, wait 1–2 minutes and refresh Wallet.",
          );
        }

        const clean = window.location.pathname;
        window.history.replaceState({}, "", clean);
        setTimeout(() => {
          setFormSuccess(false);
          if (
            finalStatus === "Success" ||
            finalStatus === "SUCCESS" ||
            finalStatus === "success"
          ) {
            setIsModalOpen(false);
          }
        }, 2800);
      };
      void verify();
      return;
    }

    if (openAdd) {
      setIsModalOpen(true);
    }
  }, [refreshProfile]);

  // Balances
  const mainBalance = user?.walletBalance || 0;

  // Transactions list via API
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const endpoint =
          user?.role === "admin"
            ? apiUrl("admin/wallet/transactions")
            : `${apiUrl("wallet/transactions")}?userId=${encodeURIComponent(user?.id || "")}`;
        const res = await authFetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions((Array.isArray(data) ? data : []).map(mapTx));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id || user?.role === "admin") fetchTransactions();
  }, [user?.id, user?.role]);

  // Payment Requests list via local storage (to sync with Admin Verification panel)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "credit" | "debit" | "refund"
  >("all");

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedWalletType = "Main";
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"UPI" | "QR">("UPI");
  const [upiId, setUpiId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Compute stats — Total Credits = money added (top-up / admin), not refunds
  const stats = useMemo(() => {
    const isRefundTx = (t: WalletTransaction) => {
      const ref = (t.reference || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return (
        ref.includes("refund") ||
        desc.includes("refund") ||
        ref.endsWith("-refund")
      );
    };

    const mainTx = transactions.filter(
      (t) => t.walletType === "Main" && t.status === "Success",
    );

    const mainCredit = mainTx
      .filter((t) => t.type === "credit" && !isRefundTx(t))
      .reduce((sum, t) => sum + t.amount, 0);

    const mainRefund = mainTx
      .filter((t) => t.type === "credit" && isRefundTx(t))
      .reduce((sum, t) => sum + t.amount, 0);

    const mainDebit = mainTx
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalCredits: mainCredit,
      totalRefunds: mainRefund,
      totalDebits: mainDebit,
    };
  }, [transactions]);

  // Handle transaction search and filters
  const filteredTransactions = useMemo(() => {
    const isRefund = (t: WalletTransaction) => {
      const ref = (t.reference || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return (
        ref.includes("refund") ||
        desc.includes("refund") ||
        ref.endsWith("-refund")
      );
    };

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
          : typeFilter === "refund"
            ? isRefund(t)
            : typeFilter === "credit"
              ? (t.type || "").toLowerCase() === "credit" && !isRefund(t)
              : (t.type || "").toLowerCase() === typeFilter.toLowerCase();
      const matchesWallet = t.walletType === "Main";

      return matchesSearch && matchesType && matchesWallet;
    });
  }, [transactions, searchTerm, typeFilter]);

  // Open Recharge Form Modal
  const openRechargeModal = () => {
    setAmount("");
    setUtrNumber("");
    setUpiId("");
    setMobileNumber("");
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

    if (user?.role === "admin") {
      setGatewayProcessing(true);
      setTimeout(() => {
        handleGatewaySuccess(`admin-manual-${Date.now()}`);
      }, 500);
      return;
    }

    if (paymentMode === "UPI") {
      if (!mobileNumber.trim() || mobileNumber.trim().length !== 10) {
        setFormError("Please enter a valid 10-digit mobile number.");
        return;
      }
      setGatewayProcessing(true);
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
          /(?:\/api|\/)+$/,
          "",
        );
        const res = await authFetch(`${baseUrl}/api/v1/wallet/recharge/gateway`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: amtNum,
            customer_mobile: mobileNumber,
            customer_email: user?.email || "user@thuruvan.com",
            // Never send browsers to api.* (Edge HTTP 403). Site return only.
            redirect_url:
              window.location.origin + "/wallets/#payment-return",
            user_id: user?.id || "",
          }),
        });
        const data = await res.json();
        if (res.ok && data.data?.payment_url) {
          const orderId = String(data.data.order_id || "");
          try {
            sessionStorage.setItem("wallet_recharge_order", orderId);
            sessionStorage.setItem(
              "wallet_recharge_amount",
              String(amtNum),
            );
          } catch {
            /* ignore */
          }

          // Same-tab checkout avoids popup + api.* 403 return window
          window.location.assign(data.data.payment_url);
          return;
        } else {
          setGatewayProcessing(false);
          setFormError(
            data.error || data.message || "Failed to initiate payment gateway.",
          );
        }
      } catch (err) {
        setGatewayProcessing(false);
        setFormError("Error connecting to Payment Gateway.");
      }
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setFormError("Invalid UTR. Please enter a valid 12-digit UTR number.");
      return;
    }

    completeRequest(cleanUtr);
  };

  const handleGatewayFailed = (orderId: string, status: string) => {
    const amtNum = parseFloat(amount);
    const newTransaction: WalletTransaction = {
      id: `tx-gw-fail-${Date.now()}`,
      date: nowTxnDateTime(),
      type: "credit",
      description: `Wallet Recharge via Gateway (${status})`,
      amount: amtNum,
      reference: orderId,
      status: "Failed",
      walletType: selectedWalletType,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleGatewaySuccess = (orderId: string) => {
    const amtNum = parseFloat(amount);

    // Add transaction to ledger as Success
    const newTransaction: WalletTransaction = {
      id: `tx-gw-${Date.now()}`,
      date: nowTxnDateTime(),
      type: "credit",
      description: `Wallet Recharge via Mugavai Gateway`,
      amount: amtNum,
      reference: orderId,
      status: "Success",
      walletType: selectedWalletType,
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update wallet balance locally
    updateWallet(mainBalance + amtNum);

    // Sync with server as source of truth
    refreshProfile();

    setFormSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormSuccess(false);
    }, 2000);
  };

  const completeRequest = async (finalUtr: string) => {
    const amtNum = parseFloat(amount);

    setGatewayProcessing(true);
    setFormError("");

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
          utrNumber: finalUtr,
          mobileNumber: mobileNumber,
          remarks: remarks.trim(),
          userId: user?.id ?? "usr_1001",
        }),
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const textData = await res.text();
        throw new Error(
          `Server returned unexpected format (Status: ${res.status}). Server might be outdated or unreachable.`,
        );
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to recharge wallet");
      }

      // Create a new Payment Request locally
      const newRequest: PaymentRequest = {
        id: `req-${Date.now()}`,
        retailerId: user?.id ?? "usr_1001",
        retailerName: user?.name ?? "Thuruvan Dev",
        shopName: "Thuruvan Headquarters",
        amount: amtNum,
        paymentMode,
        utrNumber: finalUtr,
        status: "Success",
        requestDate: nowTxnDateTime(),
        walletType: selectedWalletType,
        remarks: remarks.trim() || undefined,
      };

      // Save to payment requests list in local storage
      setPaymentRequests((prev) => [newRequest, ...prev]);

      // Add a corresponding "Success" transaction inside the user's ledger
      const newTransaction: WalletTransaction = {
        id: `tx-req-${Date.now()}`,
        date: nowTxnDateTime(),
        type: "credit",
        description: `Wallet Recharge (${paymentMode})`,
        amount: amtNum,
        reference: finalUtr,
        status: "Success",
        walletType: selectedWalletType,
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      // Ensure balance updating correctly
      updateWallet(mainBalance + amtNum);

      // Success response
      setGatewayProcessing(false);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
      }, 1800);
    } catch (error: any) {
      setGatewayProcessing(false);
      setFormError(
        error.message || "Something went wrong while saving to database.",
      );

      const newTransaction: WalletTransaction = {
        id: `tx-fail-${Date.now()}`,
        date: nowTxnDateTime(),
        type: "credit",
        description: `Wallet Recharge QR (Failed/Invalid)`,
        amount: parseFloat(amount),
        reference: finalUtr,
        status: "Failed",
        walletType: selectedWalletType,
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }
  };

  // Reset Main Wallet balance + ledger via API
  const handleResetData = async () => {
    if (
      !window.confirm(
        "Reset Main Wallet to ₹0 and clear all wallet transaction history?",
      )
    ) {
      return;
    }
    const userId = user?.id;
    if (!userId) {
      window.alert("User not loaded — login again and retry.");
      return;
    }
    try {
      const res = await authFetch(
        `${apiUrl("wallet/reset")}?userId=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error || "Wallet reset failed");
        return;
      }
      setTransactions([]);
      setPaymentRequests([]);
      updateWallet(0);
      await refreshProfile();
    } catch (e) {
      console.error(e);
      window.alert("Could not reach server to reset wallet");
    }
  };

  return (
    <AppShell activePage="Wallet">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900/60 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              My Wallet Balance
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main Wallet Card */}
          <article className="relative overflow-hidden bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e] text-white rounded-2xl px-4 py-3.5 shadow-md shadow-emerald-900/10 flex flex-col justify-between min-h-[7.5rem] group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-24 w-24 rounded-full bg-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-emerald-200/80 uppercase">
                  MAIN WALLET
                </p>
                <h3 className="text-xl font-black mt-1 tracking-tight">
                  <span className="text-sm font-bold text-emerald-300 mr-0.5">
                    ₹
                  </span>
                  {mainBalance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-md">
                <Wallet size={15} />
              </span>
            </div>

            <div className="flex justify-between items-end mt-2.5">
              <span className="text-[9px] font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-md">
                Active Account
              </span>
              <button
                onClick={() => openRechargeModal()}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-[#005c3a] hover:bg-emerald-50 text-[10px] font-extrabold rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Plus size={12} className="stroke-[3]" />
                Recharge
              </button>
            </div>
          </article>

          {/* Aggregate Total Credit Card — top-ups only (refunds excluded) */}
          <article className="flex items-center gap-3 bg-gradient-to-br from-[#005c3a] to-[#004229] dark:from-[#08291c] dark:to-[#02150e] rounded-2xl px-4 py-3.5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 min-h-[7.5rem]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <ArrowUpRight size={17} className="stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                TOTAL CREDITS
              </p>
              <strong className="block text-lg font-extrabold text-white tracking-tight mt-0.5">
                <span className="text-xs font-semibold text-white/70 mr-0.5">
                  ₹
                </span>
                {stats.totalCredits.toLocaleString("en-IN")}
              </strong>
              {stats.totalRefunds > 0 ? (
                <p className="text-[10px] font-semibold text-emerald-200/90 mt-1">
                  Refunds separate: ₹
                  {stats.totalRefunds.toLocaleString("en-IN")}
                </p>
              ) : (
                <p className="text-[10px] font-semibold text-white/50 mt-1">
                  Top-ups / admin credit only
                </p>
              )}
            </div>
          </article>

          {/* Aggregate Total Debit Card */}
          <article className="flex items-center gap-3 bg-gradient-to-br from-[#881337] to-[#4c0519] dark:from-[#4c0519] dark:to-[#2c030e] rounded-2xl px-4 py-3.5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 min-h-[7.5rem]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <ArrowDownLeft size={17} className="stroke-[2.5]" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                TOTAL DEBITS
              </p>
              <strong className="block text-lg font-extrabold text-white tracking-tight mt-0.5">
                <span className="text-xs font-semibold text-white/70 mr-0.5">
                  ₹
                </span>
                {stats.totalDebits.toLocaleString("en-IN")}
              </strong>
            </div>
          </article>
        </div>

        {/* Interactive Transaction Ledger Section */}
        <section className="bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm flex flex-col gap-6">
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
                  placeholder="Search refund, ref, desc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>

              {/* Type Filter Tab */}
              <div className="flex bg-slate-100 dark:bg-slate-950/60 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-900/80">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "all"
                      ? "bg-slate-50 dark:bg-[#0f1524] text-[#005c3a] dark:text-emerald-400 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  All Tx
                </button>
                <button
                  onClick={() => setTypeFilter("credit")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "credit"
                      ? "bg-slate-50 dark:bg-[#0f1524] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setTypeFilter("debit")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "debit"
                      ? "bg-slate-50 dark:bg-[#0f1524] text-rose-600 dark:text-rose-450 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Debits
                </button>
                <button
                  onClick={() => setTypeFilter("refund")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    typeFilter === "refund"
                      ? "bg-slate-50 dark:bg-[#0f1524] text-amber-600 dark:text-amber-400 shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-300"
                  }`}
                >
                  Refunds
                </button>
              </div>

              {/* Export button */}
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold transition-all">
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
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    const isRefund =
                      (tx.reference || "").toLowerCase().includes("refund") ||
                      (tx.description || "").toLowerCase().includes("refund");

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
                          <div className="flex flex-col gap-1">
                            {isRefund ? (
                              <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                Refund
                              </span>
                            ) : null}
                            <span>{tx.description}</span>
                          </div>
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
            <div className="relative w-full max-w-2xl bg-slate-50 dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10 p-6 flex flex-col gap-5">
              {/* Form Success State Screen */}
              {formSuccess ? (
                <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450 animate-bounce">
                    <CheckCircle2 size={36} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Recharge Successful!
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Your recharge was successful and the amount has been
                      credited directly to your wallet.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450">
                        <Wallet size={16} />
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Recharge Request ({selectedWalletType})
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Form fields */}
                  <form
                    onSubmit={handleRechargeSubmit}
                    className={`grid grid-cols-1 ${user?.role === "admin" ? "" : "md:grid-cols-2"} gap-6`}
                  >
                    {formError && (
                      <div className={`col-span-1 ${user?.role === "admin" ? "" : "md:col-span-2"} flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold animate-in fade-in duration-200`}>
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Left Column: Form Controls */}
                    <div className="space-y-4">
                      {/* Amount field */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Amount to {user?.role === "admin" ? "Add" : "Recharge"} (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          disabled={user?.role !== "admin" && utrNumber.trim().length > 0}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                          min="1"
                        />
                      </div>

                      {user?.role !== "admin" && (
                        <>
                          {/* Payment Mode */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Payment Mode / channel
                            </label>
                            <select
                              value={paymentMode}
                              onChange={(e) => {
                                setPaymentMode(e.target.value as "UPI" | "QR");
                                setFormError("");
                              }}
                              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="UPI">UPI ID Request (Gateway)</option>
                              <option value="QR">Manual QR Scan</option>
                            </select>
                          </div>

                          {/* Mobile Number (shown for both modes) */}
                          <div className="space-y-1.5 animate-in fade-in duration-200">
                            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              placeholder="Enter 10-digit mobile number"
                              value={mobileNumber}
                              onChange={(e) => {
                                setMobileNumber(e.target.value.replace(/\D/g, ""));
                                setFormError("");
                              }}
                              maxLength={10}
                              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                              required
                            />
                          </div>

                          {/* UTR reference */}
                          {paymentMode === "QR" && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                Transaction UTR / Ref ID
                              </label>
                              <input
                                type="text"
                                placeholder="Enter 12-digit UTR/Ref No."
                                value={utrNumber}
                                onChange={(e) => {
                                  setUtrNumber(e.target.value);
                                  setFormError("");
                                }}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Right Column: Dynamic Info / QR details / Bank Details Card */}
                    {user?.role !== "admin" && (
                      <div className="flex flex-col justify-center h-full">
                        <div className="bg-slate-50/50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px] text-center">
                          {paymentMode === "QR" && (
                            <div className="flex flex-col items-center gap-3.5 animate-in fade-in duration-200">
                              <div className="p-2.5 bg-slate-50 rounded-xl shadow-sm border border-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                                    `upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || "mkksriptsami@oksbi"}&pn=Thuruvan%20Communications&am=${amount || 0}&cu=INR&tn=Wallet%20Recharge`,
                                  )}`}
                                  alt="Payment QR Code"
                                  className="w-28 h-28 object-contain"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                  Scan & Pay ₹{amount || "0.00"}
                                </p>
                              </div>
                            </div>
                          )}

                          {paymentMode === "UPI" && (
                            <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 p-2 animate-in fade-in duration-200">
                              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450 shadow-sm">
                                <Wallet size={20} />
                              </span>
                              <div className="space-y-1">
                                <h5 className="text-xs font-black text-slate-855 dark:text-slate-200 uppercase tracking-wider">
                                  Payment Gateway
                                </h5>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 max-w-[200px] leading-relaxed">
                                  You will be redirected to the secure payment
                                  gateway to complete the payment via any UPI App.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Action Buttons */}
                    <div className={`col-span-1 ${user?.role === "admin" ? "" : "md:col-span-2"} flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2`}>
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
                            {paymentMode === "UPI"
                              ? "Connecting to Gateway..."
                              : "Submitting..."}
                          </>
                        ) : paymentMode === "UPI" ? (
                          "Pay via Gateway"
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
