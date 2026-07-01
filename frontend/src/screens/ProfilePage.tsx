"use client";

import React, { useState } from "react";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/context/AuthContext";
import {
  User,
  Mail,
  Shield,
  Wallet,
  Smartphone,
  Building,
  CheckCircle2,
} from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "Thuruvan Dev",
    email: user?.email || "thuruvan@eseva.com",
    mobile: "9876543210",
    shopName: "Thuruvan Digital Agency",
    address: "123, Central Plaza, Commercial Hub, TN, India",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <AppShell activePage="Profile">
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Sleek Header Jumbotron Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-emerald-950 via-[#005c3a] to-emerald-900 dark:from-[#091510] dark:via-[#004229] dark:to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
          {/* Decorative backdrop glows */}
          <div className="absolute top-[-20%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-white/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-15%] w-[30vw] h-[30vw] rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Avatar block */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-400 to-yellow-300 opacity-75 blur group-hover:opacity-100 transition duration-300" />
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-slate-900 text-3xl sm:text-4xl font-black text-emerald-400 border-2 border-white/10 shadow-inner">
                {formData.name.charAt(0)}
              </div>
            </div>

            {/* Profile Summary info */}
            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {formData.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider">
                  <span>{user?.role || "Administrator"}</span>
                </span>
              </div>
              <p className="text-emerald-100/70 text-sm font-semibold max-w-md">
                Manage operational credentials, shop configurations, and wallets
                from your secure profile dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Form and Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Metrics Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#0c101d] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-5 space-y-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Wallet Balance
              </h3>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005c3a]/10 text-[#005c3a] dark:bg-emerald-600/10 dark:text-emerald-400">
                  <Wallet size={20} />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Main Wallet
                  </p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">
                    ₹{(user?.walletBalance || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <Shield size={20} />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Security Level
                  </p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Level 3 (High-Security)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#0c101d] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 space-y-6 shadow-sm"
            >
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Account Credentials
                </h3>
                {success && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 size={14} className="stroke-[2.5]" />
                    Profile Updated!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full h-11 px-4 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full h-11 px-4 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone size={12} />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="w-full h-11 px-4 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={12} />
                    <span>Shop/Agency Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    className="w-full h-11 px-4 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  Agency Location Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-4 text-xs font-bold bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:border-[#005c3a] focus:ring-1 focus:ring-[#005c3a] dark:text-white transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-11 w-full sm:w-auto px-6 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all outline-none shadow-md"
                >
                  {isSaving ? "Saving Credentials..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
