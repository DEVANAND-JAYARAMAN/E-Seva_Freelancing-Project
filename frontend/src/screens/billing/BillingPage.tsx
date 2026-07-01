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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
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
  const [officialCosts, setOfficialCosts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "year">("day");

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
    // Load saved official costs from local storage
    const saved = localStorage.getItem("eseva_official_costs");
    if (saved) {
      try {
        setOfficialCosts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOfficialCostChange = (id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newCosts = { ...officialCosts, [id]: numericValue };
    setOfficialCosts(newCosts);
    localStorage.setItem("eseva_official_costs", JSON.stringify(newCosts));
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => r.status === "Completed") // Focus only on completed services for profit
      .filter((r) => r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [requests, searchTerm]);

  // Calculations
  const totalServiceCharge = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.cost, 0);
  }, [filteredRequests]);

  const totalOfficialCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + (officialCosts[r.id] || 0), 0);
  }, [filteredRequests, officialCosts]);

  const netProfit = totalServiceCharge - totalOfficialCost;
  const isProfitPositive = netProfit >= 0;

  // Chart Data preparation
  const chartData = useMemo(() => {
    const groupedByTime: Record<string, { serviceCharge: number; officialCost: number; profit: number }> = {};

    filteredRequests.forEach((req) => {
      let timeKey = req.createdDate;
      if (timeFilter === "month") {
        timeKey = req.createdDate.substring(0, 7); // YYYY-MM
      } else if (timeFilter === "year") {
        timeKey = req.createdDate.substring(0, 4); // YYYY
      }

      const serviceCharge = req.cost;
      const officialCost = officialCosts[req.id] || 0;
      const profit = serviceCharge - officialCost;

      if (!groupedByTime[timeKey]) {
        groupedByTime[timeKey] = { serviceCharge: 0, officialCost: 0, profit: 0 };
      }
      groupedByTime[timeKey].serviceCharge += serviceCharge;
      groupedByTime[timeKey].officialCost += officialCost;
      groupedByTime[timeKey].profit += profit;
    });

    return Object.keys(groupedByTime)
      .sort()
      .slice(-15)
      .map((key) => ({
        date: key,
        "Service Charge": groupedByTime[key].serviceCharge,
        "Official Cost": groupedByTime[key].officialCost,
        "Net Profit": groupedByTime[key].profit,
      }));
  }, [filteredRequests, officialCosts, timeFilter]);

  return (
    <AppShell activePage="Billing">
      <section className="flex flex-col gap-8 w-full pb-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Billing
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Track the official service cost versus how much we charged to calculate net profit.
            </p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Official Cost
              </span>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                <CreditCard size={16} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              ₹{totalOfficialCost.toLocaleString()}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Service Charge (Revenue)
              </span>
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
                <DollarSign size={16} />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              ₹{totalServiceCharge.toLocaleString()}
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
                  <th className="py-4 px-4 text-center">Service Charge</th>
                  <th className="py-4 px-4 text-center">Official Cost</th>
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
                    const offCost = officialCosts[req.id] || 0;
                    const profit = req.cost - offCost;
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
                              value={officialCosts[req.id] || ""}
                              onChange={(e) => handleOfficialCostChange(req.id, e.target.value)}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-[#005c3a] dark:text-emerald-500" />
                Profit Analysis Chart
              </h3>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl">
                <button
                  onClick={() => setTimeFilter("day")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    timeFilter === "day"
                      ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    timeFilter === "month"
                      ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeFilter("year")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    timeFilter === "year"
                      ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="w-full h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Area type="monotone" dataKey="Service Charge" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Line type="monotone" dataKey="Official Cost" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Area type="monotone" dataKey="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
