"use client";

import { useState } from "react";
import {
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { StatusTable } from "./StatusTable";
import { StatusStats } from "./StatusStats";
import { useEffect } from "react";
import { StatusDetailModal } from "./StatusDetailModal";
import type { StatusTicket, TicketStatus } from "./types";

// Seed data with precisely the 5 statuses requested by the user
const seedTickets: StatusTicket[] = [
  {
    id: "t-1",
    transactionId: "TXN-902348",
    serviceName: "Aadhaar Address Update",
    retailerName: "Deva",
    amount: 200.0,
    status: "Approved",
    createdDate: "2026-05-22",
    lastUpdated: "2026-05-22",
    remarks: "Request approved and processed successfully.",
    userRole: "Retailer",
  },
  {
    id: "t-2",
    transactionId: "TXN-382947",
    serviceName: "PAN Card Application",
    retailerName: "Alam",
    amount: 120.0,
    status: "Pending",
    createdDate: "2026-05-22",
    lastUpdated: "2026-05-22",
    remarks: "Awaiting physical scan validation of PAN application form.",
    userRole: "Distributor",
  },
  {
    id: "t-3",
    transactionId: "TXN-774921",
    serviceName: "Voter Card Correction",
    retailerName: "Priya Sharma",
    amount: 80.0,
    status: "Resubmit",
    createdDate: "2026-05-21",
    lastUpdated: "2026-05-22",
    remarks:
      "Incomplete profile. Please upload a clear photo copy of address proof.",
    userRole: "Retailer",
  },
  {
    id: "t-4",
    transactionId: "TXN-104928",
    serviceName: "Income Certificate E-Seva",
    retailerName: "Deva",
    amount: 150.0,
    status: "Processing",
    createdDate: "2026-05-22",
    lastUpdated: "2026-05-22",
    remarks: "Sent to local Tahsildar department for verifying signatures.",
    userRole: "Retailer",
  },
  {
    id: "t-5",
    transactionId: "TXN-554039",
    serviceName: "GSTR Filing Service",
    retailerName: "Alam",
    amount: 500.0,
    status: "Rejected",
    createdDate: "2026-05-20",
    lastUpdated: "2026-05-21",
    remarks: "Rejected due to mismatch in bank details and transaction log.",
    userRole: "Distributor",
  },
];

export function StatusPage() {
  const [tickets, setTickets] = useState<StatusTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "All">("All");
  const [selectedTicket, setSelectedTicket] = useState<StatusTicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalEditMode, setIsModalEditMode] = useState(false);

  // Fetch real data from backend
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/services/requests`);
      if (res.ok) {
        const data = await res.json();
        // map backend model to StatusTicket
        const mapped: StatusTicket[] = (data || []).map((app: any) => ({
          id: app.id || app.Id,
          transactionId: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          retailerName: app.retailerId || app.RetailerId || "Unknown", 
          amount: app.cost || app.Cost || 0,
          status: (app.status || app.Status || "Pending") as TicketStatus,
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
          lastUpdated: (app.lastUpdated || app.LastUpdated || "").split("T")[0],
          remarks: app.adminRemarks || app.AdminRemarks || "No remarks.",
          formData: typeof (app.formData || app.FormData) === "string" ? JSON.parse(app.formData || app.FormData || "{}") : (app.formData || app.FormData || {}),
          documents: typeof (app.documents || app.Documents) === "string" ? JSON.parse(app.documents || app.Documents || "[]") : (app.documents || app.Documents || []),
        }));
        setTickets(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update status and remarks via API
  const handleUpdateStatus = async (
    id: string,
    newStatus: TicketStatus,
    remarks: string,
  ) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api/services/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminRemarks: remarks }),
      });
      if (res.ok) {
        fetchTickets(); // Refresh data
        setIsDetailOpen(false);
      } else {
        console.error("Failed to update status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTicket = (ticket: StatusTicket, editMode = false) => {
    setSelectedTicket(ticket);
    setIsModalEditMode(editMode);
    setIsDetailOpen(true);
  };

  return (
    <AppShell activePage="Services Status">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Service Status Operations
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
              Seamlessly track, manage, and transition the operational lifecycle
              of service requests across five standard stages:{" "}
              <strong className="font-extrabold text-slate-700 dark:text-slate-300">
                Pending
              </strong>{" "}
              review,{" "}
              <strong className="font-extrabold text-slate-700 dark:text-slate-300">
                Resubmission
              </strong>{" "}
              required, active{" "}
              <strong className="font-extrabold text-slate-700 dark:text-slate-300">
                Processing
              </strong>
              ,{" "}
              <strong className="font-extrabold text-slate-700 dark:text-slate-300">
                Rejected
              </strong>
              , and{" "}
              <strong className="font-extrabold text-slate-700 dark:text-slate-300">
                Approved
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Dynamic Metric Tabs */}
        <StatusStats
          tickets={tickets}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Dynamic Ticket Table */}
        <StatusTable
          tickets={tickets}
          activeFilter={activeFilter}
          onSelectTicket={handleSelectTicket}
        />

        {/* Detailed Modal Workflow Operations */}
        <StatusDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          ticket={selectedTicket}
          onUpdateStatus={handleUpdateStatus}
          isEditMode={isModalEditMode}
        />
      </section>
    </AppShell>
  );
}
