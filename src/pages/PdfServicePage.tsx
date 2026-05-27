"use client";

import React, { useState } from "react";
import { AppShell } from "../layouts/AppShell";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServicePriceRow {
  slNo: number;
  serviceName: string;
  admin: string;
  distributor: string;
  retailer: string;
  needCoordinator: boolean;
}

export function PdfServicePage() {
  const router = useRouter();
  const [prices, setPrices] = useState<ServicePriceRow[]>([
    { slNo: 1, serviceName: "Adhaar to Pan Number", admin: "12.00", distributor: "30.00", retailer: "30.00", needCoordinator: false },
    { slNo: 2, serviceName: "Pan To Pan Details", admin: "10.00", distributor: "30.00", retailer: "30.00", needCoordinator: false },
    { slNo: 3, serviceName: "Driving License PDF", admin: "10.00", distributor: "30.00", retailer: "30.00", needCoordinator: false },
    { slNo: 4, serviceName: "RC Pdf", admin: "12.00", distributor: "30.00", retailer: "30.00", needCoordinator: false },
    { slNo: 5, serviceName: "Adhaar to Smart card Number FIND", admin: "12.00", distributor: "20.00", retailer: "20.00", needCoordinator: false },
    { slNo: 6, serviceName: "Cell Number Link In Voter ID", admin: "20.00", distributor: "60.00", retailer: "60.00", needCoordinator: false },
    { slNo: 7, serviceName: "EPIC INSTANT PDF", admin: "10.00", distributor: "40.00", retailer: "40.00", needCoordinator: false },
    { slNo: 8, serviceName: "Adhaar verification", admin: "10.00", distributor: "20.00", retailer: "20.00", needCoordinator: false },
    { slNo: 9, serviceName: "PAN TO GST Number Find", admin: "15.00", distributor: "70.00", retailer: "70.00", needCoordinator: false },
    { slNo: 10, serviceName: "E-Shram PDF", admin: "30.00", distributor: "130.00", retailer: "130.00", needCoordinator: false },
    { slNo: 11, serviceName: "Rc To Mobile Number Find", admin: "11.00", distributor: "0.00", retailer: "0.00", needCoordinator: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (index: number, field: "admin" | "distributor" | "retailer", value: string) => {
    setPrices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCheckboxChange = (index: number, value: boolean) => {
    setPrices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], needCoordinator: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <AppShell activePage="PDF Service">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#030712] rounded-3xl border border-slate-200/80 dark:border-emerald-950/60 shadow-xl dark:shadow-2xl relative overflow-hidden space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/[0.03] dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/[0.03] dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />

        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5 relative z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <span>Service Payment - TNeGA Services</span>
              <Sparkles size={18} className="text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
            </h1>
            <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 tracking-widest uppercase mt-1">
              Configure service commission prices & coordinator eligibility
            </p>
          </div>

          <div className="flex items-center gap-3">
            {success && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/30 animate-in fade-in duration-200">
                <CheckCircle2 size={13} className="stroke-[2.5]" />
                Saved Successfully
              </span>
            )}
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="flex h-9 px-4 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-all outline-none"
            >
              <ArrowLeft size={13} />
              <span>Back to Catalog</span>
            </button>
          </div>
        </div>

        {/* Pricing Matrix Panel Grid */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div className="bg-slate-50/40 dark:bg-[#0b0f19] border border-slate-200/60 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-900 bg-slate-100/40 dark:bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest w-[80px]">Sl No</th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Service Name</th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[150px]">Admin</th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[150px]">Distributor</th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[150px]">Retailer</th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[160px]">Need Coordinator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-900/60">
                  {prices.map((row, idx) => (
                    <tr key={row.slNo} className="hover:bg-slate-100/30 dark:hover:bg-slate-950/20 transition-colors">
                      {/* Sl No */}
                      <td className="py-4 px-5 text-xs font-extrabold text-slate-500 dark:text-slate-600">{row.slNo}</td>
                      
                      {/* Service Name */}
                      <td className="py-4 px-5 text-xs font-extrabold text-slate-700 dark:text-slate-300">{row.serviceName}</td>
                      
                      {/* Admin input capsule */}
                      <td className="py-3 px-4">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute left-6 text-xs font-bold text-slate-400 dark:text-slate-600 select-none">₹</span>
                          <input
                            type="text"
                            value={row.admin}
                            onChange={(e) => handleInputChange(idx, "admin", e.target.value)}
                            className="w-28 h-9 pl-8 pr-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-full focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Distributor input capsule */}
                      <td className="py-3 px-4">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute left-6 text-xs font-bold text-slate-400 dark:text-slate-600 select-none">₹</span>
                          <input
                            type="text"
                            value={row.distributor}
                            onChange={(e) => handleInputChange(idx, "distributor", e.target.value)}
                            className="w-28 h-9 pl-8 pr-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-full focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Retailer input capsule */}
                      <td className="py-3 px-4">
                        <div className="relative flex items-center justify-center">
                          <span className="absolute left-6 text-xs font-bold text-slate-400 dark:text-slate-600 select-none">₹</span>
                          <input
                            type="text"
                            value={row.retailer}
                            onChange={(e) => handleInputChange(idx, "retailer", e.target.value)}
                            className="w-28 h-9 pl-8 pr-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-full focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Coordinator Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={row.needCoordinator}
                          onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
                          className="h-4.5 w-4.5 rounded bg-white dark:bg-[#131926] border-slate-300 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 focus:outline-none cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 px-14 items-center justify-center rounded-xl bg-[#005c3a] dark:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all outline-none shadow-lg shadow-[#005c3a]/10 dark:shadow-emerald-950/20"
            >
              {isSubmitting ? "Submitting Configuration..." : "Submit"}
            </button>
          </div>
        </form>

      </div>
    </AppShell>
  );
}
