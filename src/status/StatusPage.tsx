"use client";

import { useState } from "react";
import {
  Clock,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { StatusStats } from "./StatusStats";
import { StatusTable } from "./StatusTable";
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
  },
];

export function StatusPage() {
  const [tickets, setTickets] = useLocalStorage<StatusTicket[]>(
    "thuruvan_status_tickets_list",
    seedTickets,
  );
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "All">("All");
  const [selectedTicket, setSelectedTicket] = useState<StatusTicket | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Update status and remarks inside LocalStorage
  const handleUpdateStatus = (
    id: string,
    newStatus: TicketStatus,
    remarks: string,
  ) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
            ...ticket,
            status: newStatus,
            remarks,
            lastUpdated: new Date().toISOString().split("T")[0],
          }
          : ticket,
      ),
    );
  };

  const handleSelectTicket = (ticket: StatusTicket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  return (
    <AppShell activePage="Status">
      <section className="flex flex-col gap-8 w-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#e8f5e9] dark:bg-emerald-950/40 text-[#005c3a] dark:text-emerald-400">
                <Clock size={12} />
              </span>
              <span className="text-[10px] font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                Real-Time Tracking
              </span>
            </div>
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
        />
      </section>
    </AppShell>
  );
}
