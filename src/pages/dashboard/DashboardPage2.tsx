"use client";

import React, { useState } from "react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../store/context/AuthContext";
import {
  Wallet,
  CircleDollarSign,
  TrendingUp,
  Users,
  Cpu,
  PlusCircle,
  FileText,
  Fingerprint,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  UserPlus,
  Compass,
  Activity,
  RefreshCw,
  XCircle,
} from "lucide-react";

export function DashboardPage2() {
  const { user, updateWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "distributors">(
    user?.role === "distributor" ? "distributors" : "history",
  );

  // State for wallet request popup
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestUtr, setRequestUtr] = useState("");

  // State for adding retailer (distributor exclusive)
  const [showAddRetailer, setShowAddRetailer] = useState(false);
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    email: "",
    shopName: "",
  });

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

  const handleAddRetailerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRetailer.name || !newRetailer.email) return;

    setNotifications((prev) => [
      `Retailer "${newRetailer.name}" (${newRetailer.shopName || "Generic Services"}) has been successfully registered under your network.`,
      ...prev,
    ]);

    // Save to mockup db
    try {
      const registeredUsersStr =
        localStorage.getItem("e_seva_registered_users") || "[]";
      const registeredUsers = JSON.parse(registeredUsersStr);
      registeredUsers.push({
        email: newRetailer.email,
        role: "retailer",
        name: newRetailer.name,
        mobile: "9876543210",
        password: "password",
      });
      localStorage.setItem(
        "e_seva_registered_users",
        JSON.stringify(registeredUsers),
      );
    } catch (err) {
      console.error(err);
    }

    setNewRetailer({ name: "", email: "", shopName: "" });
    setShowAddRetailer(false);
  };

  // Mock list of transactions for retailers/distributors
  const mockTransactions = [
    {
      id: "TXN-901",
      service: "Aadhaar Address Update",
      date: "Today, 04:30 PM",
      amount: "₹200.00",
      status: "Approved",
    },
    {
      id: "TXN-902",
      service: "PAN Card Application",
      date: "Today, 11:15 AM",
      amount: "₹120.00",
      status: "Pending",
    },
    {
      id: "TXN-903",
      service: "Electricity Bill Payment",
      date: "Yesterday, 06:12 PM",
      amount: "₹1,450.00",
      status: "Inprocess",
    },
    {
      id: "TXN-904",
      service: "Voter Card Correction",
      date: "2 days ago",
      amount: "₹150.00",
      status: "Resubmit",
    },
    {
      id: "TXN-905",
      service: "Income Tax Return filing",
      date: "3 days ago",
      amount: "₹450.00",
      status: "Rejected",
    },
  ];

  // Services available
  const coreServices = [
    {
      name: "PAN Card Service",
      icon: Fingerprint,
      desc: "New / correction application with instant digital verification",
      tone: "mint",
    },
    {
      name: "Aadhaar Update",
      icon: FileText,
      desc: "Fast-track address, photo, demographic details sync",
      tone: "sky",
    },
    {
      name: "Utility Payments",
      icon: CircleDollarSign,
      desc: "Instant BBPS water, gas, and high-voltage power bills",
      tone: "amber",
    },
    {
      name: "Central PDF Export",
      icon: Cpu,
      desc: "Official verification PDF printing & smart watermarks",
      tone: "violet",
    },
  ];

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
                Hello,{" "}
                <span className="capitalize">
                  {user?.name || "Agency Partner"}
                </span>
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

        {/* Dynamic State Overview Cards - Premium UI Grid */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          aria-label="Partner stats"
        >
          {/* Card 1: Pending */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pending
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400">
                <Clock size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>Awaiting Verification</span>
            </div>
          </article>

          {/* Card 2: Inprocess */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-orange-500/30 dark:hover:border-orange-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Inprocess
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-650 dark:text-orange-450">
                <Activity size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span>Currently Processing</span>
            </div>
          </article>

          {/* Card 3: Resubmit */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Resubmit
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400">
                <RefreshCw size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Needs Correction</span>
            </div>
          </article>

          {/* Card 4: Rejected */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Rejected
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-450">
                <XCircle size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Declined Submissions</span>
            </div>
          </article>

          {/* Card 5: Approved */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Approved
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Completed Requests</span>
            </div>
          </article>

          {/* Card 6: Wallet */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-600/40 dark:hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400">
                <Wallet size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap">
              <strong className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                <span className="text-xs sm:text-sm font-bold text-slate-450 mr-0.5">
                  ₹
                </span>
                {user?.walletBalance?.toFixed(2) || "0.00"}
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
              Available balance
            </div>
          </article>

          {/* Card 7: Wallet Request */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-sky-500/30 dark:hover:border-sky-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Wallet Request
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400">
                <CircleDollarSign size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                0
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
              Pending approvals
            </div>
          </article>

          {/* Card 8: Customers */}
          <article className="relative overflow-hidden bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Customers
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                <Users size={16} className="stroke-[2.5]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {user?.role === "distributor" ? "12" : "0"}
              </strong>
            </div>
            <div className="mt-2 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
              {user?.role === "distributor"
                ? "Active Retailers"
                : "Subscribed Clients"}
            </div>
          </article>
        </section>

        {/* Notifications Ribbon */}
        {notifications.length > 0 && (
          <div className="bg-[#e8f5e9]/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
            <CheckCircle
              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
              size={16}
            />
            <div className="flex-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="uppercase tracking-wider mr-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                Latest Alert
              </span>
              {notifications[0]}
            </div>
          </div>
        )}

        {/* Interactive Workspace Area */}
        <section className="w-full">
          {/* Main Interactive Workspace Column */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800/80">
              {user?.role === "distributor" && (
                <button
                  onClick={() => setActiveTab("distributors")}
                  className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                    activeTab === "distributors"
                      ? "border-[#005c3a] dark:border-emerald-600 text-[#005c3a] dark:text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                  }`}
                >
                  My Retailers
                </button>
              )}
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "history"
                    ? "border-[#005c3a] dark:border-emerald-600 text-[#005c3a] dark:text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                Our Services Status
              </button>
            </div>

            {/* Tab: Distributors/Retailers Panel */}
            {activeTab === "distributors" && user?.role === "distributor" && (
              <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Sub-Retailer Operations Network
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                      Review active agents and commissions under your agency
                      tree.
                    </p>
                  </div>
                </div>

                {showAddRetailer && (
                  <form
                    onSubmit={handleAddRetailerSubmit}
                    className="bg-slate-50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200"
                  >
                    <h4 className="text-xs font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest">
                      Register New Network Agent
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Agent Full Name"
                        value={newRetailer.name}
                        onChange={(e) =>
                          setNewRetailer({
                            ...newRetailer,
                            name: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#005c3a] dark:focus:border-emerald-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Agent Email Address"
                        value={newRetailer.email}
                        onChange={(e) =>
                          setNewRetailer({
                            ...newRetailer,
                            email: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#005c3a] dark:focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Shop / Corporate Title"
                        value={newRetailer.shopName}
                        onChange={(e) =>
                          setNewRetailer({
                            ...newRetailer,
                            shopName: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#005c3a] dark:focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddRetailer(false)}
                        className="border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#005c3a] dark:bg-emerald-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:opacity-90 shadow"
                      >
                        Add Retailer Agent
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-750">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-1">Agent Name</th>
                        <th className="py-3 px-1">Email</th>
                        <th className="py-3 px-1">Shop / Tag</th>
                        <th className="py-3 px-1 text-right">
                          Commission Earned
                        </th>
                        <th className="py-3 px-1 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-900/60">
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">
                          Devanand Sharma
                        </td>
                        <td className="py-4 px-1">deva@sharmamulti.in</td>
                        <td className="py-4 px-1">Sharma Multi Digital</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹845.00
                        </td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">
                          Ramesh K.
                        </td>
                        <td className="py-4 px-1">ramesh.k@gmail.com</td>
                        <td className="py-4 px-1">RK E-Seva Centre</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹412.50
                        </td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">
                          Mohit Rawat
                        </td>
                        <td className="py-4 px-1">rawat.online@yahoo.com</td>
                        <td className="py-4 px-1">Rawat Cyber Point</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹0.00
                        </td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500">
                            Idle
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Our Services Status */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Our Services Status
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                  Real-time verification and processing status of your submitted
                  service applications.
                </p>

                <div className="mt-4 space-y-4">
                  {mockTransactions.map((txn, idx) => {
                    let statusIcon = (
                      <Clock size={14} className="text-amber-500" />
                    );
                    let statusBg =
                      "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400";

                    if (txn.status === "Approved") {
                      statusIcon = (
                        <CheckCircle size={14} className="text-emerald-500" />
                      );
                      statusBg =
                        "bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-450";
                    } else if (txn.status === "Inprocess") {
                      statusIcon = (
                        <Activity size={14} className="text-sky-500" />
                      );
                      statusBg =
                        "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400";
                    } else if (txn.status === "Resubmit") {
                      statusIcon = (
                        <RefreshCw size={14} className="text-indigo-500" />
                      );
                      statusBg =
                        "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400";
                    } else if (txn.status === "Rejected") {
                      statusIcon = (
                        <XCircle size={14} className="text-rose-500" />
                      );
                      statusBg =
                        "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400";
                    }

                    return (
                      <div
                        key={txn.id}
                        className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900/65 pb-3"
                      >
                        <div className="flex gap-3 items-center">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400">
                            {statusIcon}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                              {txn.service}
                            </h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">
                              {txn.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBg}`}
                          >
                            {txn.status}
                          </span>
                          <div>
                            <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                              {txn.amount}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold tracking-widest">
                              {txn.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                    className="border border-slate-250 dark:border-slate-850 rounded-xl px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
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
