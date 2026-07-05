import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Filter } from 'lucide-react';

interface ProfitAnalysisChartProps {
  profitByDate?: { date: string; profit: number }[];
  profitByService?: { serviceId: string; serviceName: string; profit: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ProfitAnalysisChart({ profitByDate = [], profitByService = [] }: ProfitAnalysisChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartData, setChartData] = useState<'date' | 'service'>('date');

  const data = chartData === 'date' ? profitByDate : profitByService;

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
          No profit data available
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey={chartData === 'date' ? 'date' : 'serviceName'} tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="profit" fill="#005c3a" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey={chartData === 'date' ? 'date' : 'serviceName'} tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="profit" stroke="#005c3a" strokeWidth={3} dot={{ r: 4, fill: '#005c3a' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="profit"
              nameKey={chartData === 'date' ? 'date' : 'serviceName'}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={5}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Profit Analysis</h3>
          <p className="text-[10px] text-slate-500 font-medium">Analyze profits over time and by service.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              value={chartData}
              onChange={(e) => setChartData(e.target.value as any)}
              className="appearance-none pl-8 pr-6 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 cursor-pointer"
            >
              <option value="date">By Date</option>
              <option value="service">By Service</option>
            </select>
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Pie
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        {renderChart()}
      </div>
    </div>
  );
}
