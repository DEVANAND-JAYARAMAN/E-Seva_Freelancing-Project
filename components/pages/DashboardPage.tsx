import { AppShell } from "../AppShell";
import { DashboardOverview } from "./dashboard/DashboardOverview";
import { ServiceQueue } from "./dashboard/ServiceQueue";
import { StatsGrid } from "./dashboard/StatsGrid";
import { WalletHealth } from "./dashboard/WalletHealth";
import { WalletSummary } from "./dashboard/WalletSummary";

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
