"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  CreditCard,
  Search,
  Save,
  Settings
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
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

export interface ServiceRequest {
  id: string;
  serviceName: string;
  cost: number;
  officialCost: number;
  profit: number;
  status: string;
  createdDate: string;
}

import { defaultStaticServices } from "../../config/servicesData";

interface ConfigService {
  id: string;
  name: string;
  officialCost: number;
}

export function BillingPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [configServices, setConfigServices] = useState<ConfigService[]>([]);
  const [editingCosts, setEditingCosts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "year">("day");
  const [chartType, setChartType] = useState<"area" | "bar" | "line" | "pie">("area");

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "");

  const fetchData = async () => {
    try {
      // Fetch Requests
      const resReq = await fetch(`${baseUrl}/api/services/requests`);
      if (resReq.ok) {
        const data = await resReq.json();
        const mapped = (data || []).map((app: any) => ({
          id: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          cost: parseFloat(app.cost || app.Cost || "0"),
          officialCost: parseFloat(app.officialCost || app.OfficialCost || "0"),
          profit: parseFloat(app.profit || app.Profit || "0"),
          status: app.status || app.Status || "Pending",
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
        }));
        setRequests(mapped);
      }

      // Fetch Dynamic Services for Config Table
      const resDyn = await fetch(`${baseUrl}/api/services/dynamic`);
      let dynServices: any[] = [];
      if (resDyn.ok) {
        dynServices = await resDyn.json();
      }

      const dynMap = new Map();
      dynServices.forEach((s) => {
        dynMap.set(s.id, s.officialCost || 0);
      });

      // Combine Static + Dynamic
      const combined: ConfigService[] = [];
      const seenIds = new Set();

      // Add statics
      defaultStaticServices.forEach(s => {
        combined.push({
          id: s.id,
          name: s.name,
          officialCost: dynMap.get(s.id) || 0
        });
        seenIds.add(s.id);
      });

      // Add remaining dynamics
      dynServices.forEach((s) => {
        if (!seenIds.has(s.id)) {
          combined.push({
            id: s.id,
            name: s.name,
            officialCost: s.officialCost || 0
          });
        }
      });

      setConfigServices(combined);
      
      const initCosts: Record<string, string> = {};
      combined.forEach(s => {
        initCosts[s.id] = String(s.officialCost || 0);
      });
      setEditingCosts(initCosts);

    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveOfficialCost = async (id: string, name: string) => {
    try {
      const val = parseFloat(editingCosts[id] || "0");
      const res = await fetch(`${baseUrl}/api/services/dynamic/${id}/cost`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, officialCost: val })
      });
      if (res.ok) {
        // Refresh data to update profits in table and chart
        fetchData();
        alert("Official cost updated successfully!");
      } else {
        alert("Failed to update official cost.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving official cost.");
    }
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => r.status === "Completed") // Focus only on completed services for profit
      .filter((r) => r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [requests, searchTerm]);

  const totalServiceCharge = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.cost, 0);
  }, [filteredRequests]);

  const totalOfficialCost = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.officialCost, 0);
  }, [filteredRequests]);

  const netProfit = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.profit, 0);
  }, [filteredRequests]);
  
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
      const officialCost = req.officialCost;
      const profit = req.profit;

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
  }, [filteredRequests, timeFilter]);

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

        {/* Official Costs Configuration Section */}
        <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Settings size={20} className="text-[#005c3a] dark:text-emerald-500" />
              Official Costs Configuration
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Configure the exact official processing cost for each service here. This is subtracted from the user charge to calculate real profit.
            </p>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-sm">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4 w-1/2">Service Name</th>
                  <th className="py-4 px-4 text-center">Official Cost (₹)</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold">Loading data...</td>
                  </tr>
                ) : configServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                      {svc.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-slate-400 mr-2 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={editingCosts[svc.id] || ""}
                          onChange={(e) => setEditingCosts(prev => ({ ...prev, [svc.id]: e.target.value }))}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0f18] text-slate-800 dark:text-white focus:outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 shadow-sm"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSaveOfficialCost(svc.id, svc.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#005c3a] hover:bg-[#004a2e] dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-500">{req.createdDate}</td>
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                          {req.serviceName}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                          ₹{req.cost.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-rose-500 dark:text-rose-400">
                          ₹{req.officialCost.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-black">
                          <span className={req.profit >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {req.profit > 0 ? "+" : ""}₹{req.profit.toLocaleString()}
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
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl">
                {["area", "bar", "line", "pie"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      chartType === type
                        ? "bg-white dark:bg-slate-800 shadow-sm text-[#005c3a] dark:text-emerald-500"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
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
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Area type="monotone" dataKey="Service Charge" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Line type="monotone" dataKey="Official Cost" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Area type="monotone" dataKey="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                ) : chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar dataKey="Service Charge" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Official Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line type="monotone" dataKey="Service Charge" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="Official Cost" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="Net Profit" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData.filter(d => d["Net Profit"] > 0)}
                      dataKey="Net Profit"
                      nameKey="date"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
