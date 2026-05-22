import { AppShell } from "../../layouts/AppShell";
import { DashboardOverview } from "./DashboardOverview";
import { ServiceQueue } from "./ServiceQueue";
import { StatsGrid } from "./StatsGrid";
import { WalletHealth } from "./WalletHealth";
import { WalletSummary } from "./WalletSummary";

export function DashboardPage() {
  return (
    <AppShell activePage="Dashboard">
      <section className="flex flex-col gap-6 w-full">
        {/* Operations Overview and Today Collection */}
        <DashboardOverview />

        {/* Wallets and Accounts Summary */}
        <WalletSummary />

        {/* Metrics Grid */}
        <StatsGrid />

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
