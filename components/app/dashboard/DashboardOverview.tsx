import { ArrowUpRight } from "lucide-react";
import { ActivityChart } from "../charts/ActivityChart";

export function DashboardOverview() {
  return (
    <section className="overview-panel" id="dashboard">
      <div className="overview-copy">
        <p className="eyebrow">Operations overview</p>
        <h1>Service payment dashboard</h1>
        <p>
          Track approvals, wallet balance, payment requests, and service movement from one clean
          top-bar workspace.
        </p>
        <div className="overview-actions">
          <button className="primary-button">
            Create request
            <ArrowUpRight size={17} />
          </button>
          <button className="plain-button">Export report</button>
        </div>
      </div>

      <div className="collection-card">
        <span>Today collection</span>
        <strong>50.00</strong>
        <ActivityChart />
        <p>03:03:03 - Aadhaar address update 200 only</p>
      </div>
    </section>
  );
}
