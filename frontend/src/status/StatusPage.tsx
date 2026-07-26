"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { AppShell } from "../layouts/AppShell";
import { StatusTable } from "./StatusTable";
import { StatusStats } from "./StatusStats";
import { StatusDetailModal } from "./StatusDetailModal";
import type { StatusTicket, TicketStatus } from "./types";
import { useAuth } from "../store/context/AuthContext";
import { apiUrl, authFetch } from "../utils/apiBase";

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
    status: "Resubmit",
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
    remarks: "Awaiting processing.",
    userRole: "Retailer",
  },
  {
    id: "t-4",
    transactionId: "TXN-104928",
    serviceName: "Income Certificate E-Seva",
    retailerName: "Deva",
    amount: 150.0,
    status: "Resubmit",
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
  const { user } = useAuth();
  const [tickets, setTickets] = useState<StatusTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus | "All">("All");
  const [selectedTicket, setSelectedTicket] = useState<StatusTicket | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isModalEditMode, setIsModalEditMode] = useState(false);

  // Keep open File Details in sync when the tickets list refreshes
  useEffect(() => {
    if (!selectedTicket?.id) return;
    const fresh = tickets.find((t) => t.id === selectedTicket.id);
    if (fresh) setSelectedTicket(fresh);
  }, [tickets, selectedTicket?.id]);

  // Fetch real data from backend
  const fetchTickets = async () => {
    try {
      let url = apiUrl("services/requests");
      if (user?.role && user.role !== "admin") {
        url +=
          (url.includes("?") ? "&" : "?") +
          `userId=${encodeURIComponent(user.id)}`;
      }
      const res = await authFetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const sortedData = (data || []).sort(
          (a: any, b: any) =>
            new Date(b.createdDate || b.CreatedDate || "").getTime() -
            new Date(a.createdDate || a.CreatedDate || "").getTime(),
        );
        const mapped: StatusTicket[] = sortedData.map((app: any) => {
          const form =
            typeof (app.formData || app.FormData) === "string"
              ? (() => {
                  try {
                    return JSON.parse(app.formData || app.FormData || "{}");
                  } catch {
                    return {};
                  }
                })()
              : app.formData || app.FormData || {};
          const formPhone =
            form.mobile ||
            form.mobileNo ||
            form.mobileNumber ||
            form.phone ||
            form.cellNo ||
            form.whatsapp ||
            "";
          const applicantName = String(
            form.applicantName ||
              form.applicant_name ||
              form.ApplicantName ||
              form.name ||
              form.fullName ||
              form.customerName ||
              "",
          ).trim();
          const mobile =
            app.retailerMobile ||
            app.RetailerMobile ||
            formPhone ||
            app.customerWhatsApp ||
            app.CustomerWhatsApp ||
            "";
          const roleRaw = String(
            app.userRole || app.UserRole || app.role || app.Role || "",
          ).toLowerCase();
          const userRole =
            roleRaw === "distributor"
              ? ("Distributor" as const)
              : ("Retailer" as const);
          return {
          id: app.id || app.Id,
          transactionId: app.id || app.Id,
          serviceName: app.serviceName || app.ServiceName || "Unknown Service",
          retailerName:
            app.retailerName ||
            app.RetailerName ||
            app.retailerId ||
            app.RetailerId ||
            "Unknown",
          retailerMobile: mobile || "-",
          amount: app.cost || app.Cost || 0,
          status: (app.status || app.Status || "Pending") as TicketStatus,
          createdDate: (app.createdDate || app.CreatedDate || "").split("T")[0],
          lastUpdated: (app.lastUpdated || app.LastUpdated || "").split("T")[0],
          remarks: app.adminRemarks || app.AdminRemarks || "No remarks.",
          formData: form,
          documents: (() => {
            const raw = app.documents || app.Documents;
            if (typeof raw !== "string") return raw || [];
            try {
              return JSON.parse(raw || "[]");
            } catch {
              return [];
            }
          })(),
          ackFiles: (() => {
            const raw = app.ackFiles || app.AckFiles;
            if (typeof raw !== "string") return raw || [];
            try {
              return JSON.parse(raw || "[]");
            } catch {
              return [];
            }
          })(),
          ackText: app.ackText || app.AckText || "",
          userRole,
          applicantName: applicantName || "—",
          customerName: applicantName || "—",
          mobileNumber: mobile || "-",
        };
        });
        setTickets(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

  // Update status and remarks via API
  const handleUpdateStatus = async (
    id: string,
    newStatus: TicketStatus,
    remarks: string,
    ackFiles?: File[],
    ackText?: string,
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      formData.append("adminRemarks", remarks || "");

      if (ackFiles && ackFiles.length > 0) {
        ackFiles.forEach((file) => {
          formData.append("ackFiles", file);
        });
      }
      if (ackText) {
        formData.append("ackText", ackText);
      }

      const res = await authFetch(apiUrl(`services/${id}/status`), {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Status update failed",
          text: data.error || data.message || `Could not set status to ${newStatus}`,
        });
        return false;
      }

      await fetchTickets();
      setIsDetailOpen(false);
      const refundAmt = Number(data.refundAmount || 0);
      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          newStatus === "Rejected" && refundAmt > 0
            ? `Rejected — ₹${refundAmt.toFixed(2)} refunded to retailer wallet`
            : newStatus === "Rejected" && data.refundMessage
              ? `Rejected — ${data.refundMessage}`
              : `Status changed to ${newStatus}`,
        timer: refundAmt > 0 ? 2200 : 1400,
        showConfirmButton: false,
      });
      return true;
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach server to update status",
      });
      return false;
    }
  };

  const handleResubmit = async (
    id: string,
    formData: Record<string, string>,
    documents: string[],
  ): Promise<boolean> => {
    try {
      const res = await authFetch(apiUrl(`services/${id}/resubmit`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, documents }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Resubmit failed",
          text: data.error || data.message || "Could not resubmit application",
        });
        return false;
      }

      await fetchTickets();
      setIsDetailOpen(false);
      await Swal.fire({
        icon: "success",
        title: "Resubmitted",
        text: data.message || "Application resubmitted successfully",
        timer: 1400,
        showConfirmButton: false,
      });
      return true;
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach server to resubmit",
      });
      return false;
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
          onResubmit={handleResubmit}
        />
      </section>
    </AppShell>
  );
}
