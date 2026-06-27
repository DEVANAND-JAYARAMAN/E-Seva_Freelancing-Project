"use client";

import React, { useState } from "react";
import { AppShell } from "../layouts/AppShell";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServicePriceRow {
  slNo: number;
  serviceName: string;
  admin: string;
  othersiteAdmin: string;
  distributor: string;
  retailer: string;
  customer: string;
}

export function PdfServicePage() {
  const router = useRouter();
  const [prices, setPrices] = useState<ServicePriceRow[]>([
    {
      slNo: 1,
      serviceName: "Adhaar to Pan Number",
      admin: "12.00",
      othersiteAdmin: "0.00",
      distributor: "30.00",
      retailer: "30.00",
      customer: "25.00",
    },
    {
      slNo: 2,
      serviceName: "Pan To Pan Details",
      admin: "10.00",
      othersiteAdmin: "0.00",
      distributor: "30.00",
      retailer: "30.00",
      customer: "25.00",
    },
    {
      slNo: 3,
      serviceName: "Driving License PDF",
      admin: "10.00",
      othersiteAdmin: "",
      distributor: "30.00",
      retailer: "30.00",
      customer: "25.00",
    },
    {
      slNo: 4,
      serviceName: "RC Pdf",
      admin: "12.00",
      othersiteAdmin: "",
      distributor: "30.00",
      retailer: "30.00",
      customer: "25.00",
    },
    {
      slNo: 5,
      serviceName: "Adhaar to Smart card Number FIND",
      admin: "12.00",
      othersiteAdmin: "",
      distributor: "20.00",
      retailer: "20.00",
      customer: "25.00",
    },
    {
      slNo: 6,
      serviceName: "Cell Number Link In Voter ID",
      admin: "20.00",
      othersiteAdmin: "",
      distributor: "60.00",
      retailer: "60.00",
      customer: "60.00",
    },
    {
      slNo: 7,
      serviceName: "EPIC INSTANT PDF",
      admin: "10.00",
      othersiteAdmin: "",
      distributor: "40.00",
      retailer: "40.00",
      customer: "40.00",
    },
    {
      slNo: 8,
      serviceName: "Adhaar verification",
      admin: "10.00",
      othersiteAdmin: "",
      distributor: "20.00",
      retailer: "20.00",
      customer: "20.00",
    },
    {
      slNo: 9,
      serviceName: "PAN TO GST Number Find",
      admin: "15.00",
      othersiteAdmin: "",
      distributor: "70.00",
      retailer: "70.00",
      customer: "70.00",
    },
    {
      slNo: 10,
      serviceName: "E-Shram PDF",
      admin: "30.00",
      othersiteAdmin: "",
      distributor: "130.00",
      retailer: "130.00",
      customer: "130.00",
    },
    {
      slNo: 11,
      serviceName: "Rc To Mobile Number Find",
      admin: "11.00",
      othersiteAdmin: "",
      distributor: "",
      retailer: "",
      customer: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Add Service custom modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newAdminPrice, setNewAdminPrice] = useState("0");
  const [newOthersiteAdminPrice, setNewOthersiteAdminPrice] = useState("0");
  const [newDistributorPrice, setNewDistributorPrice] = useState("0");
  const [newRetailerPrice, setNewRetailerPrice] = useState("0");
  const [newCustomerPrice, setNewCustomerPrice] = useState("0");

  const handleInputChange = (
    index: number,
    field: "admin" | "othersiteAdmin" | "distributor" | "retailer" | "customer",
    value: string,
  ) => {
    setPrices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    setPrices((prev) => [
      ...prev,
      {
        slNo: prev.length + 1,
        serviceName: newServiceName.trim(),
        admin: newAdminPrice || "0.00",
        othersiteAdmin: newOthersiteAdminPrice || "0.00",
        distributor: newDistributorPrice || "0.00",
        retailer: newRetailerPrice || "0.00",
        customer: newCustomerPrice || "0.00",
      },
    ]);

    // Reset states & close
    setNewServiceName("");
    setNewAdminPrice("0");
    setNewOthersiteAdminPrice("0");
    setNewDistributorPrice("0");
    setNewRetailerPrice("0");
    setNewCustomerPrice("0");
    setIsAddModalOpen(false);
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
              <span>Service Payment - PDF Services</span>
            </h1>
            <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 tracking-widest uppercase mt-1">
              Configure service commission prices & coordinator eligibility
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[#005c3a] hover:bg-[#004d30] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Plus size={13} />
              <span>Add Service</span>
            </button>

            {success && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/30 animate-in fade-in duration-200">
                <CheckCircle2 size={13} className="stroke-[2.5]" />
                Saved Successfully
              </span>
            )}
          </div>
        </div>

        {/* Pricing Matrix Panel Grid */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div className="bg-slate-50/40 dark:bg-[#0b0f19] border border-slate-200/60 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-900 bg-slate-100/40 dark:bg-transparent">
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest w-[80px]">
                      Sl No
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                      Service Name
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[120px]">
                      Admin
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[130px]">
                      Othersite Admin
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[120px]">
                      Distributor
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[120px]">
                      Retailer
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[120px]">
                      Customer
                    </th>
                    <th className="py-4 px-5 text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center w-[80px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-900/60">
                  {prices.map((row, idx) => (
                    <tr
                      key={row.slNo}
                      className="hover:bg-slate-100/30 dark:hover:bg-slate-950/20 transition-colors"
                    >
                      {/* Sl No */}
                      <td className="py-4 px-5 text-xs font-extrabold text-slate-500 dark:text-slate-600">
                        {row.slNo}
                      </td>

                      {/* Service Name */}
                      <td className="py-4 px-5 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {row.serviceName}
                      </td>

                      {/* Admin input capsule */}
                      <td className="py-3 px-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="text"
                            value={row.admin}
                            onChange={(e) =>
                              handleInputChange(idx, "admin", e.target.value)
                            }
                            className="w-24 h-9 px-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Othersite Admin input capsule */}
                      <td className="py-3 px-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="text"
                            value={row.othersiteAdmin}
                            onChange={(e) =>
                              handleInputChange(
                                idx,
                                "othersiteAdmin",
                                e.target.value,
                              )
                            }
                            className="w-24 h-9 px-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Distributor input capsule */}
                      <td className="py-3 px-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="text"
                            value={row.distributor}
                            onChange={(e) =>
                              handleInputChange(
                                idx,
                                "distributor",
                                e.target.value,
                              )
                            }
                            className="w-24 h-9 px-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Retailer input capsule */}
                      <td className="py-3 px-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="text"
                            value={row.retailer}
                            onChange={(e) =>
                              handleInputChange(idx, "retailer", e.target.value)
                            }
                            className="w-24 h-9 px-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Customer input capsule */}
                      <td className="py-3 px-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="text"
                            value={row.customer}
                            onChange={(e) =>
                              handleInputChange(idx, "customer", e.target.value)
                            }
                            className="w-24 h-9 px-3 text-xs font-black text-center bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800/80 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all outline-none"
                          />
                        </div>
                      </td>

                      {/* Action (Delete Row) */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPrices((prev) =>
                              prev.filter((item) => item.slNo !== row.slNo),
                            );
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete service row"
                        >
                          <Trash2 size={14} className="stroke-[2.5]" />
                        </button>
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

      {/* CUSTOM ADD NEW SERVICE POPUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                ADD NEW SERVICE
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors"
              >
                <Plus size={14} className="rotate-45" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateServiceSubmit} className="space-y-4">
              {/* Service Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                  SERVICE NAME
                </label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Passport Application"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Primary Prices Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    ADMIN PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newAdminPrice}
                    onChange={(e) => setNewAdminPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    OTHERSITE ADMIN PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newOthersiteAdminPrice}
                    onChange={(e) => setNewOthersiteAdminPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Secondary Prices Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    DISTRIBUTOR PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newDistributorPrice}
                    onChange={(e) => setNewDistributorPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    RETAILER PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newRetailerPrice}
                    onChange={(e) => setNewRetailerPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Customer Price Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                  CUSTOMER PRICE (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCustomerPrice}
                  onChange={(e) => setNewCustomerPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  CREATE SERVICE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
