"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { ServiceQueue } from "./ServiceQueue";
import { StatsGrid } from "./StatsGrid";
import { WalletSummary } from "./WalletSummary";
import { useAuth } from "../../store/context/AuthContext";
import { DashboardPage2 } from "./DashboardPage2";

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

        {/* Live Queues */}
        <section className="grid grid-cols-1 gap-6 items-start">
          <div className="lg:col-span-1">
            <ServiceQueue />
          </div>
        </section>
      </section>
    </AppShell>
  );
}
