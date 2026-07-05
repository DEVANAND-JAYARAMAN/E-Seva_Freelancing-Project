"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { ServiceQueue } from "./ServiceQueue";
import { StatsGrid } from "./StatsGrid";
import { WalletSummary } from "./WalletSummary";
import { useAuth } from "../../store/context/AuthContext";
import { DashboardPage2 } from "./DashboardPage2";
import { ProfitAnalysisChart } from "../../components/charts/ProfitAnalysisChart";

export function DashboardPage({
  forceRole,
}: {
  forceRole?: "admin" | "retailer" | "distributor";
}) {
  const { user } = useAuth();
  const role = forceRole || user?.role;
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (role === "admin") {
      fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/admin/dashboard`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Failed to load dashboard stats", err));
    }
  }, [role]);

  if (role === "retailer" || role === "distributor") {
    return <DashboardPage2 forceRole={role} />;
  }

  return (
    <AppShell activePage="Dashboard">
      <section className="flex flex-col gap-6 w-full">
        {/* Combined Stats & Wallets Grid (3 rows, 4 columns on large screens) */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-label="Wallet and metrics summary"
        >
          <WalletSummary stats={stats} />
          <StatsGrid stats={stats} />
        </section>

        {/* Live Queues & Profit Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <ServiceQueue />
          </div>
          <div className="lg:col-span-1 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-full min-h-[350px]">
            <ProfitAnalysisChart 
              profitByDate={stats?.profitByDate ? Object.entries(stats.profitByDate).map(([date, profit]) => ({ date, profit: Number(profit) })) : []} 
              profitByService={stats?.profitByService ? Object.entries(stats.profitByService).map(([serviceName, profit]) => ({ serviceId: serviceName, serviceName, profit: Number(profit) })) : []} 
            />
          </div>
        </section>
      </section>
    </AppShell>
  );
}
