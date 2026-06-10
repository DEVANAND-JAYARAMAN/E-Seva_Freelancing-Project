"use client";

import { AppShell } from "../../layouts/AppShell";
import { DashboardOverview } from "./DashboardOverview";
import { ServiceQueue } from "./ServiceQueue";
import { StatsGrid } from "./StatsGrid";
import { WalletHealth } from "./WalletHealth";
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

  if (role === "retailer" || role === "distributor") {
    return <DashboardPage2 forceRole={role} />;
  }

  return (
    <AppShell activePage="Dashboard">
      <section className="flex flex-col gap-6 w-full">
        {/* Operations Overview and Today Collection */}
        <DashboardOverview />

        {/* Combined Stats & Wallets Grid (3 rows, 4 columns on large screens) */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-label="Wallet and metrics summary"
        >
          <WalletSummary />
          <StatsGrid />
        </section>

        {/* Live Queues & Wallet Warnings */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <ServiceQueue />
          </div>
          <div className="lg:col-span-1">
            <WalletHealth />
          </div>
        </section>
      </section>
    </AppShell>
  );
}
