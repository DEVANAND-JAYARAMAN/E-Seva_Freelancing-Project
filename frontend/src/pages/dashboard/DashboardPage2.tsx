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
} from "lucide-react";

export function DashboardPage2() {
  const { user, updateWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<"services" | "history" | "distributors">(
    user?.role === "distributor" ? "distributors" : "services"
  );
  
  // State for wallet request popup
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestUtr, setRequestUtr] = useState("");
  
  // State for adding retailer (distributor exclusive)
  const [showAddRetailer, setShowAddRetailer] = useState(false);
  const [newRetailer, setNewRetailer] = useState({ name: "", email: "", shopName: "" });

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
    
    setNotifications(prev => [
      `Successfully loaded ₹${requestAmount} via UTR ${requestUtr || "MOCK-UTR-9092"}`,
      ...prev
    ]);
    
    setShowRequestModal(false);
    setRequestAmount("");
    setRequestUtr("");
  };

  const handleAddRetailerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRetailer.name || !newRetailer.email) return;
    
    setNotifications(prev => [
      `Retailer "${newRetailer.name}" (${newRetailer.shopName || "Generic Services"}) has been successfully registered under your network.`,
      ...prev
    ]);
    
    // Save to mockup db
    try {
      const registeredUsersStr = localStorage.getItem("e_seva_registered_users") || "[]";
      const registeredUsers = JSON.parse(registeredUsersStr);
      registeredUsers.push({
        email: newRetailer.email,
        role: "retailer",
        name: newRetailer.name,
        mobile: "9876543210",
        password: "password"
      });
      localStorage.setItem("e_seva_registered_users", JSON.stringify(registeredUsers));
    } catch (err) {
      console.error(err);
    }

    setNewRetailer({ name: "", email: "", shopName: "" });
    setShowAddRetailer(false);
  };

  // Mock list of transactions for retailers/distributors
  const mockTransactions = [
    { id: "TXN-901", service: "Aadhaar Address Update", date: "Today, 04:30 PM", amount: "₹200.00", status: "Approved" },
    { id: "TXN-902", service: "PAN Card Application", date: "Today, 11:15 AM", amount: "₹120.00", status: "Pending" },
    { id: "TXN-903", service: "Electricity Bill Payment", date: "Yesterday, 06:12 PM", amount: "₹1,450.00", status: "Approved" },
    { id: "TXN-904", service: "Wallet Top-up Request", date: "2 days ago", amount: "₹5,000.00", status: "Approved" },
  ];

  // Services available
  const coreServices = [
    { name: "PAN Card Service", icon: Fingerprint, desc: "New / correction application with instant digital verification", tone: "mint" },
    { name: "Aadhaar Update", icon: FileText, desc: "Fast-track address, photo, demographic details sync", tone: "sky" },
    { name: "Utility Payments", icon: CircleDollarSign, desc: "Instant BBPS water, gas, and high-voltage power bills", tone: "amber" },
    { name: "Central PDF Export", icon: Cpu, desc: "Official verification PDF printing & smart watermarks", tone: "violet" },
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
                Hello, <span className="capitalize">{user?.name || "Agency Partner"}</span>!
              </h2>
              <p className="text-xs text-emerald-100/70 max-w-xl font-medium">
                Manage utility updates, track high-speed transactions, and overview your secure agency operations.
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-center">
              <span className="flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Account Type</span>
                <span className="text-sm font-extrabold uppercase bg-white/15 px-3 py-1 rounded-lg border border-white/10 mt-1 shadow-inner tracking-wide">
                  {user?.role === "distributor" ? "Distributor Network" : "Retailer Partner"}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic State Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Partner stats">
          {/* Main Wallet Card */}
          <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e9] dark:bg-emerald-950/30 text-[#005c3a] dark:text-emerald-400">
                <Wallet size={22} className="stroke-[2.5]" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Main Wallet</p>
                <strong className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  <span className="text-sm font-bold text-slate-450 mr-0.5">₹</span>
                  {user?.walletBalance?.toFixed(2) || "0.00"}
                </strong>
              </div>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1 bg-[#005c3a] dark:bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <PlusCircle size={14} />
              <span>Load Funds</span>
            </button>
          </article>

          {/* API Wallet Balance */}
          <article className="flex items-center gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
              <CircleDollarSign size={22} className="stroke-[2.5]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">API Wallet Balance</p>
              <strong className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                <span className="text-sm font-bold text-slate-450 mr-0.5">₹</span>
                450.00
              </strong>
            </div>
          </article>

          {/* Dynamic Third Card: Sub-retailers count for Distributor or Commission tracker for Retailer */}
          {user?.role === "distributor" ? (
            <article className="flex items-center justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400">
                  <Users size={22} className="stroke-[2.5]" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sub-Retailers</p>
                  <strong className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    12 Active
                  </strong>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab("distributors");
                  setShowAddRetailer(true);
                }}
                className="flex items-center gap-1 bg-sky-600 dark:bg-sky-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <UserPlus size={14} />
                <span>Add Retailer</span>
              </button>
            </article>
          ) : (
            <article className="flex items-center gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                <TrendingUp size={22} className="stroke-[2.5]" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Today's Profit/Margin</p>
                <strong className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  <span className="text-sm font-bold text-slate-450 mr-0.5">₹</span>
                  180.00
                </strong>
              </div>
            </article>
          )}
        </section>

        {/* Notifications Ribbon */}
        {notifications.length > 0 && (
          <div className="bg-[#e8f5e9]/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
            <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={16} />
            <div className="flex-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="uppercase tracking-wider mr-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Latest Alert</span>
              {notifications[0]}
            </div>
          </div>
        )}

        {/* Interactive Workspace Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Interactive Workspace Column */}
          <div className="lg:col-span-2 space-y-6">
            
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
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "services"
                    ? "border-[#005c3a] dark:border-emerald-600 text-[#005c3a] dark:text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                Core Services Console
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "history"
                    ? "border-[#005c3a] dark:border-emerald-600 text-[#005c3a] dark:text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                Operation Log
              </button>
            </div>

            {/* Tab: Distributors/Retailers Panel */}
            {activeTab === "distributors" && user?.role === "distributor" && (
              <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Sub-Retailer Operations Network</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Review active agents and commissions under your agency tree.</p>
                  </div>
                </div>

                {showAddRetailer && (
                  <form onSubmit={handleAddRetailerSubmit} className="bg-slate-50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                    <h4 className="text-xs font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest">Register New Network Agent</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Agent Full Name"
                        value={newRetailer.name}
                        onChange={e => setNewRetailer({...newRetailer, name: e.target.value})}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#005c3a] dark:focus:border-emerald-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Agent Email Address"
                        value={newRetailer.email}
                        onChange={e => setNewRetailer({...newRetailer, email: e.target.value})}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#005c3a] dark:focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Shop / Corporate Title"
                        value={newRetailer.shopName}
                        onChange={e => setNewRetailer({...newRetailer, shopName: e.target.value})}
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
                        <th className="py-3 px-1 text-right">Commission Earned</th>
                        <th className="py-3 px-1 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-900/60">
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">Devanand Sharma</td>
                        <td className="py-4 px-1">deva@sharmamulti.in</td>
                        <td className="py-4 px-1">Sharma Multi Digital</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">₹845.00</td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">Active</span>
                        </td>
                      </tr>
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">Ramesh K.</td>
                        <td className="py-4 px-1">ramesh.k@gmail.com</td>
                        <td className="py-4 px-1">RK E-Seva Centre</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">₹412.50</td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400">Active</span>
                        </td>
                      </tr>
                      <tr className="dark:text-slate-350">
                        <td className="py-4 px-1 font-bold text-slate-900 dark:text-white">Mohit Rawat</td>
                        <td className="py-4 px-1">rawat.online@yahoo.com</td>
                        <td className="py-4 px-1">Rawat Cyber Point</td>
                        <td className="py-4 px-1 text-right font-extrabold text-emerald-600 dark:text-emerald-400">₹0.00</td>
                        <td className="py-4 px-1 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500">Idle</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Core Services Console */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coreServices.map(svc => {
                    const Icon = svc.icon;
                    return (
                      <article
                        key={svc.name}
                        onClick={() => {
                          setNotifications(prev => [
                            `Launching secure application portal for "${svc.name}"...`,
                            ...prev
                          ]);
                        }}
                        className="cursor-pointer group flex flex-col justify-between bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 hover:border-[#005c3a] dark:hover:border-emerald-650 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[#005c3a] dark:text-emerald-450 shadow-inner group-hover:scale-105 transition-transform">
                              <Icon size={18} />
                            </span>
                            <ArrowUpRight size={14} className="text-slate-350 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{svc.name}</h4>
                            <p className="text-[10px] leading-relaxed text-slate-450 dark:text-slate-500 font-medium mt-1">{svc.desc}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Operation Log */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Operation Log</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Audit trail for service triggers initiated by your credentials.</p>
                
                <div className="mt-4 space-y-4">
                  {mockTransactions.map((txn, idx) => (
                    <div key={txn.id} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900/65 pb-3">
                      <div className="flex gap-3 items-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400">
                          {txn.status === "Approved" ? <CheckCircle size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{txn.service}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">{txn.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-extrabold text-slate-900 dark:text-white">{txn.amount}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest">{txn.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Utilities Column */}
          <div className="space-y-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Quick Actions Console</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setNotifications(prev => [
                      "Synchronizing secure wallet vaults with terminal gateway...",
                      ...prev
                    ]);
                  }}
                  className="w-full text-left rounded-xl p-3 border border-slate-100 dark:border-slate-900 hover:border-[#005c3a] dark:hover:border-emerald-600 text-xs font-bold text-slate-850 dark:text-slate-300 flex justify-between items-center transition-all"
                >
                  <span>Sync Wallet Server</span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full text-left rounded-xl p-3 border border-slate-100 dark:border-slate-900 hover:border-[#005c3a] dark:hover:border-emerald-600 text-xs font-bold text-slate-850 dark:text-slate-300 flex justify-between items-center transition-all"
                >
                  <span>Request Credit Line</span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>
                <a
                  href="#support"
                  className="w-full text-left rounded-xl p-3 border border-slate-100 dark:border-slate-900 hover:border-[#005c3a] dark:hover:border-emerald-600 text-xs font-bold text-slate-850 dark:text-slate-300 flex justify-between items-center transition-all"
                >
                  <span>Partner Help desk</span>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Quick Guidelines Panel */}
            <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-650 dark:text-amber-400">
                <AlertTriangle size={16} />
                <h3 className="text-xs font-black uppercase tracking-wider">Security Advisory</h3>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-450 dark:text-slate-500 font-semibold">
                Never share your OTP, terminal credentials, or API secret key with anyone. Thuruvan admins will never request your credentials. Keep auto-logout timer active in Settings.
              </p>
            </div>

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
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Request Wallet Top-up</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold">Transfer fund requests to your distributor account.</p>
                </div>
              </div>

              <form onSubmit={handleWalletRequest} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Top-up Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter amount (e.g. 500)"
                    value={requestAmount}
                    onChange={e => setRequestAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 font-semibold"
                    required
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Payment Transaction UTR</label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit transaction ID"
                    value={requestUtr}
                    onChange={e => setRequestUtr(e.target.value)}
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
