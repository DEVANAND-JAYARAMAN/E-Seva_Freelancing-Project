"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  CreditCard,
  Search,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../store/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ServiceRequest {
  id: string;
  serviceName: string;
  cost: number;
  status: string;
  createdDate: string;
}

export function BillingPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/services/requests`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((app: any) => ({
          id: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          cost: parseFloat(app.cost || app.Cost || "0"),
          status: app.status || app.Status || "Pending",
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Load saved customer payments from local storage
    const saved = localStorage.getItem("eseva_customer_payments");
    if (saved) {
      try {
        setCustomerPayments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleCustomerPaymentChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newPayments = { ...customerPayments, [id]: numericValue };
    setCustomerPayments(newPayments);
    localStorage.setItem("eseva_customer_payments", JSON.stringify(newPayments));
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => r.status === "Completed") // Focus only on completed services for profit
      .filter((r) => r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [requests, searchTerm]);

  // Calculations
  const totalOriginalCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.cost, 0);
  }, [filteredRequests]);

  const totalCustomerPaid = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + (customerPayments[r.id] || 0), 0);
  }, [filteredRequests, customerPayments]);

  const netProfit = totalCustomerPaid - totalOriginalCost;
  const isProfitPositive = netProfit >= 0;

  // Chart Data preparation
  const chartData = useMemo(() => {
    const groupedByDate: Record<string, { original: number; customer: number; profit: number }> = {};

    filteredRequests.forEach((req) => {
      const date = req.createdDate;
      const original = req.cost;
      const customer = customerPayments[req.id] || 0;
      const profit = customer - original;

      if (!groupedByDate[date]) {
        groupedByDate[date] = { original: 0, customer: 0, profit: 0 };
      }
      groupedByDate[date].original += original;
      groupedByDate[date].customer += customer;
      groupedByDate[date].profit += profit;
    });

    return Object.keys(groupedByDate)
      .sort()
      .slice(-10) // show last 10 days
      .map((date) => ({
        date,
        "Original Cost": groupedByDate[date].original,
        "Customer Paid": groupedByDate[date].customer,
        "Net Profit": groupedByDate[date].profit,
      }));
  }, [filteredRequests, customerPayments]);

  return (
    <AppShell activePage="Profit Analysis">
      <section className="flex flex-col gap-8 w-full pb-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Profit Analysis
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Track the original service cost versus how much the customer paid to calculate your net profit.
            </p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Original Cost
              </span>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                <CreditCard size={16} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              ₹{totalOriginalCost.toLocaleString()}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Customer Paid
              </span>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                <DollarSign size={16} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              ₹{totalCustomerPaid.toLocaleString()}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Net Profit
              </span>
              <div
                className={`p-2 rounded-lg ${
                  isProfitPositive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"
                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-500"
                }`}
              >
                {isProfitPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
            <span
              className={`text-3xl font-black ${
                isProfitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ₹{netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-[#005c3a] dark:text-emerald-500" />
              Completed Services
            </h3>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#005c3a]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Service Name</th>
                  <th className="py-4 px-4 text-center">Original Cost</th>
                  <th className="py-4 px-4 text-center">Customer Paid</th>
                  <th className="py-4 px-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      Loading data...
                    </td>
                  </tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const custPaid = customerPayments[req.id] || 0;
                    const profit = custPaid - req.cost;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-500">{req.createdDate}</td>
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                          {req.serviceName}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                          ₹{req.cost.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <span className="text-slate-400 mr-2 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={customerPayments[req.id] || ""}
                              onChange={(e) => handleCustomerPaymentChange(req.id, e.target.value)}
                              placeholder="0"
                              className="w-24 px-3 py-1.5 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0f18] text-slate-800 dark:text-white focus:outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 shadow-sm"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-black">
                          <span className={profit >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {profit > 0 ? "+" : ""}₹{profit.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      No completed services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        {chartData.length > 0 && (
          <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-[#005c3a] dark:text-emerald-500" />
              Profit Analysis Chart (Last 10 Days)
            </h3>
            <div className="w-full h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="Original Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Customer Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net Profit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
