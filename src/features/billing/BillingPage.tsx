"use client";

import { useState } from "react";
import { Plus, Receipt, Search, FileText, CheckCircle, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  retailerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  utrNumber?: string;
  category: "Service Charges" | "Wallet Topup" | "API Recharge" | "Late Penalty";
}

const initialInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    retailerName: "Devanand Jayaraman",
    amount: 1500.0,
    date: "2026-05-23",
    dueDate: "2026-06-05",
    status: "Paid",
    utrNumber: "629810458129",
    category: "Wallet Topup",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    retailerName: "Sahin Alam",
    amount: 5000.0,
    date: "2026-05-23",
    dueDate: "2026-06-05",
    status: "Pending",
    utrNumber: "N20260523000918",
    category: "API Recharge",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    retailerName: "Priya Sharma",
    amount: 500.0,
    date: "2026-05-22",
    dueDate: "2026-05-29",
    status: "Pending",
    utrNumber: "991827364510",
    category: "Wallet Topup",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    retailerName: "Karthik Raja",
    amount: 120.0,
    date: "2026-05-18",
    dueDate: "2026-05-25",
    status: "Overdue",
    category: "Service Charges",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-005",
    retailerName: "Rajesh Kumar",
    amount: 250.0,
    date: "2026-05-15",
    dueDate: "2026-05-22",
    status: "Paid",
    utrNumber: "551928374619",
    category: "Service Charges",
  }
];

export function BillingPage() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>("thuruvan_billing_invoices", initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [retailerName, setRetailerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Invoice["category"]>("Service Charges");
  const [status, setStatus] = useState<Invoice["status"]>("Pending");
  const [utrNumber, setUtrNumber] = useState("");

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.retailerName.toLowerCase().includes(search.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (i.utrNumber && i.utrNumber.includes(search));
    const matchesStatus = statusFilter === "All" || i.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || i.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerName || !amount || !dueDate) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-00${invoices.length + 1}`,
      retailerName,
      amount: parseFloat(amount),
      date: new Date().toISOString().split("T")[0],
      dueDate,
      status,
      category,
      utrNumber: utrNumber || undefined,
    };

    setInvoices([newInvoice, ...invoices]);
    setIsFormOpen(false);
    // Reset Form
    setRetailerName("");
    setAmount("");
    setDueDate("");
    setCategory("Service Charges");
    setStatus("Pending");
    setUtrNumber("");
  };

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const outstandingAmount = invoices
    .filter((i) => i.status === "Pending")
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueAmount = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <AppShell activePage="Billing">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#efebe9] dark:bg-amber-950/40 text-[#8d6e63] dark:text-amber-400">
                <Receipt size={12} />
              </span>
              <span className="text-[10px] font-extrabold text-[#8d6e63] dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                Accounts Department
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Billing & Invoices Hub
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Monitor payments received, draft business invoices, manage outstanding subscription dues, and track bank UTR allocations.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paid Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> Settled
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outstanding Dues</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">₹{outstandingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-extrabold text-amber-500 flex items-center gap-0.5">
                <Clock size={12} /> Awaiting
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overdue Invoices</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">₹{overdueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-extrabold text-rose-500 flex items-center gap-0.5">
                <ArrowDownRight size={12} /> Critical
              </span>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Collectability Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {((totalRevenue / (totalRevenue + outstandingAmount + overdueAmount || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-extrabold text-emerald-500">Efficiency</span>
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="flex flex-col gap-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
              <input
                type="text"
                placeholder="Search by client, invoice # or UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#005c3a]/50 dark:focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Service Charges">Service Charges</option>
                <option value="Wallet Topup">Wallet Topup</option>
                <option value="API Recharge">API Recharge</option>
                <option value="Late Penalty">Late Penalty</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4">Invoice #</th>
                  <th className="py-4 px-4">Client</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          <div className="font-extrabold text-slate-800 dark:text-white">{invoice.invoiceNumber}</div>
                        </div>
                        <div className="text-xs text-slate-400 font-semibold">{invoice.date}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-800 dark:text-white">{invoice.retailerName}</div>
                        {invoice.utrNumber && (
                          <div className="text-xs text-[#005c3a] dark:text-emerald-400 font-semibold">UTR: {invoice.utrNumber}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{invoice.category}</span>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-800 dark:text-white">
                        ₹{invoice.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">
                        {invoice.dueDate}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          invoice.status === "Paid"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                            : invoice.status === "Pending"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                        }`}>
                          {invoice.status === "Paid" ? (
                            <CheckCircle size={10} />
                          ) : invoice.status === "Pending" ? (
                            <Clock size={10} />
                          ) : (
                            <AlertTriangle size={10} />
                          )}
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-600 font-semibold">
                      No matching invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Create New Business Invoice</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddInvoice} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Client / Retailer Name</label>
                <input
                  type="text"
                  required
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  placeholder="e.g. Priyan Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Amount (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Invoice Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Invoice["category"])}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Service Charges">Service Charges</option>
                    <option value="Wallet Topup">Wallet Topup</option>
                    <option value="API Recharge">API Recharge</option>
                    <option value="Late Penalty">Late Penalty</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Payment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Invoice["status"])}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">UTR / Reference Number (Optional)</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                  placeholder="Bank payment transaction UTR reference"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white text-sm font-extrabold"
                >
                  Draft Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
