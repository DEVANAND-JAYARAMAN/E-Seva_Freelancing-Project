import { AppShell } from "../AppShell";
import { DashboardOverview } from "../dashboard/DashboardOverview";
import { ServiceQueue } from "../dashboard/ServiceQueue";
import { StatsGrid } from "../dashboard/StatsGrid";
import { WalletHealth } from "../dashboard/WalletHealth";
import { WalletSummary } from "../dashboard/WalletSummary";

export function DashboardPage() {
  return (
    <AppShell activePage="Dashboard">
      <section className="dashboard-grid">
        <DashboardOverview />
        <WalletSummary />
        <StatsGrid />

        <section className="content-grid">
          <ServiceQueue />
          <WalletHealth />
        </section>
      </section>
    </AppShell>
  );
}
