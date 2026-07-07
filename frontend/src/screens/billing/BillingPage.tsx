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
  Settings,
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
  Cell,
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
  const [chartType, setChartType] = useState<"area" | "bar" | "line" | "pie">(
    "area",
  );

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
    /(?:\/api|\/)+$/,
    "",
  );

  const fetchData = async () => {
    try {
      // Fetch Dynamic Services for Config Table First
      const resDyn = await fetch(`${baseUrl}/api/services/dynamic`);
      let dynServices: any[] = [];
      if (resDyn.ok) {
        dynServices = await resDyn.json();
      }

      const dynMap = new Map();
      dynServices.forEach((s) => {
        if (s.id) dynMap.set(s.id, s.officialCost || 0);
        if (s.name) dynMap.set(s.name.toLowerCase().trim(), s.officialCost || 0);
      });

      // Fetch Requests first to find all sub-services
      const resReq = await fetch(`${baseUrl}/api/services/requests`);
      let rawRequests: any[] = [];
      if (resReq.ok) {
        rawRequests = await resReq.json() || [];
      }

      const combined: ConfigService[] = [];
      const seenIds = new Set();
      
      // Helper to add a service to config list safely
      const addConfigService = (id: string, name: string) => {
        const tempId = id || name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        if (!seenIds.has(tempId)) {
          let cost = dynMap.get(tempId);
          if (cost === undefined) cost = dynMap.get(name.toLowerCase().trim());
          combined.push({
            id: tempId,
            name: name,
            officialCost: cost || 0,
          });
          seenIds.add(tempId);
        }
      };

      // 1. Add statics
      defaultStaticServices.forEach((s) => {
        addConfigService(s.id, s.name);
      });

      // 2. Add remaining dynamics
      dynServices.forEach((s) => {
        addConfigService(s.id, s.name);
      });

      // 3. Add ALL unique serviceNames from Requests (these are the Sub-Services)
      rawRequests.forEach((app: any) => {
        const sName = (app.serviceName || app.ServiceName || "").trim();
        if (sName) {
           addConfigService("", sName);
        }
      });

      setConfigServices(combined);

      const initCosts: Record<string, string> = {};
      combined.forEach((s) => {
        initCosts[s.id] = String(s.officialCost || 0);
      });
      setEditingCosts(initCosts);

      // Now apply official cost to the requests for profit calculation
      const mapped = rawRequests.map((app: any) => {
        const rawSId = app.serviceId || app.ServiceId || "";
        const sName = (app.serviceName || app.ServiceName || "").trim();
        const sNameKey = sName.toLowerCase();

        // Map older legacy IDs to the new standard IDs used in configServices
        const legacyIdMap: Record<string, string> = {
          sabarimala_dharsan_booking: "dharsan",
          sabarimala: "dharsan",
          aadhaar_address_update: "aadhaar-card-address",
          long_adhaar_setup: "pdf-services", // Fallback for old PDF/Print services if any
        };

        const sId = legacyIdMap[rawSId] || rawSId;
        const generatedId = sNameKey.replace(/[^a-z0-9]/g, "-");

        // Hierarchy of finding cost: 
        // 1. By exact sub-service name (generated ID)
        // 2. By exact sub-service name (string)
        // 3. By parent service ID
        let currentOfficialCost = dynMap.get(generatedId);
        if (currentOfficialCost === undefined) currentOfficialCost = dynMap.get(sNameKey);
        if (currentOfficialCost === undefined) currentOfficialCost = dynMap.get(sId);
        if (currentOfficialCost === undefined) {
          currentOfficialCost = parseFloat(app.officialCost || app.OfficialCost || "0");
        }

        const cost = parseFloat(app.cost || app.Cost || "0");
        const calculatedProfit = cost - currentOfficialCost;

        return {
          id: app.id || app.Id,
          serviceName: sName || "Unknown Service",
          cost: cost,
          officialCost: currentOfficialCost,
          profit: calculatedProfit,
          status: app.status || app.Status || "Pending",
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
        };
      });
      
      setRequests(mapped);
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
        body: JSON.stringify({ name, officialCost: val }),
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
      .filter((r) =>
        r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
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
    const groupedByTime: Record<
      string,
      { serviceCharge: number; officialCost: number; profit: number }
    > = {};

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
        groupedByTime[timeKey] = {
          serviceCharge: 0,
          officialCost: 0,
          profit: 0,
        };
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
              Track the official service cost versus how much we charged to
              calculate net profit.
            </p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white shadow-sm flex flex-col gap-3">
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

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white shadow-sm flex flex-col gap-3">
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

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white shadow-sm flex flex-col gap-3">
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
                {isProfitPositive ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
              </div>
            </div>
            <span
              className={`text-3xl font-black ${
                isProfitPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ₹{netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Official Costs Configuration Section */}
        <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Settings
                size={20}
                className="text-[#005c3a] dark:text-emerald-500"
              />
              Official Costs Configuration
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Configure the exact official processing cost for each service
              here. This is subtracted from the user charge to calculate real
              profit.
            </p>
          </div>
          <div className="overflow-x-auto max-h-96 rounded-2xl border-2 border-black dark:border-white">
            <table className="w-full text-left border-collapse border-2 border-black dark:border-white">
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
                    <td
                      colSpan={3}
                      className="py-8 text-center text-slate-400 font-semibold"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : (
                  configServices.map((svc) => (
                    <tr
                      key={svc.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                        {svc.name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-slate-400 mr-2 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={editingCosts[svc.id] || ""}
                            onChange={(e) =>
                              setEditingCosts((prev) => ({
                                ...prev,
                                [svc.id]: e.target.value,
                              }))
                            }
                            placeholder="0"
                            className="w-24 px-3 py-1.5 text-center font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0f18] text-slate-800 dark:text-white focus:outline-none focus:border-[#005c3a] dark:focus:border-emerald-500 shadow-sm"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() =>
                            handleSaveOfficialCost(svc.id, svc.name)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#005c3a] hover:bg-[#004a2e] dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                        >
                          <Save size={14} />
                          Save
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity
                size={20}
                className="text-[#005c3a] dark:text-emerald-500"
              />
              Completed Services
            </h3>
            <div className="relative max-w-sm w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#005c3a]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-black dark:border-white">
            <table className="w-full text-left border-collapse border-2 border-black dark:border-white">
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
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 font-semibold"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="py-4 px-4 font-semibold text-slate-500">
                          {req.createdDate}
                        </td>
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
                          <span
                            className={
                              req.profit >= 0
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }
                          >
                            {req.profit > 0 ? "+" : ""}₹
                            {req.profit.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 font-semibold"
                    >
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
          <div className="flex flex-col gap-6 bg-white dark:bg-[#0b101e] border-2 border-black dark:border-white rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp
                  size={20}
                  className="text-[#005c3a] dark:text-emerald-500"
                />
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
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorProfit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Area
                      type="monotone"
                      dataKey="Service Charge"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Line
                      type="monotone"
                      dataKey="Official Cost"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="Net Profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                ) : chartType === "bar" ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="Service Charge"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Official Cost"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Net Profit"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line
                      type="linear"
                      dataKey="Service Charge"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Line
                      type="linear"
                      dataKey="Official Cost"
                      stroke="#ef4444"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Line
                      type="linear"
                      dataKey="Net Profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Service Charge",
                          value: totalServiceCharge,
                          fill: "#3b82f6",
                        },
                        {
                          name: "Official Cost",
                          value: totalOfficialCost,
                          fill: "#ef4444",
                        },
                        {
                          name: netProfit >= 0 ? "Net Profit" : "Net Loss",
                          value: Math.abs(netProfit),
                          fill: netProfit >= 0 ? "#10b981" : "#f43f5e",
                        },
                      ].filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {[
                        {
                          name: "Service Charge",
                          value: totalServiceCharge,
                          fill: "#3b82f6",
                        },
                        {
                          name: "Official Cost",
                          value: totalOfficialCost,
                          fill: "#ef4444",
                        },
                        {
                          name: netProfit >= 0 ? "Net Profit" : "Net Loss",
                          value: Math.abs(netProfit),
                          fill: netProfit >= 0 ? "#10b981" : "#f43f5e",
                        },
                      ]
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
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
