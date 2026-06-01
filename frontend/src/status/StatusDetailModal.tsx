import { useState, useEffect } from "react";
import {
  X,
  Check,
  AlertOctagon,
  RefreshCw,
  Loader,
  MessageSquare,
} from "lucide-react";
import type { StatusTicket, TicketStatus } from "./types";

type StatusDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ticket: StatusTicket | null;
  onUpdateStatus: (
    id: string,
    newStatus: TicketStatus,
    remarks: string,
  ) => void;
};

export function StatusDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdateStatus,
}: StatusDetailModalProps) {
  const [remarks, setRemarks] = useState("");
  const [isCustomRemarks, setIsCustomRemarks] = useState(false);

  useEffect(() => {
    if (ticket) {
      setRemarks(ticket.remarks || "");
    }
    setIsCustomRemarks(false);
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const handleStatusClick = (newStatus: TicketStatus) => {
    let finalRemarks = remarks.trim();
    if (!finalRemarks || !isCustomRemarks) {
      if (newStatus === "Approved")
        finalRemarks = "Request approved and processed successfully.";
      if (newStatus === "Rejected")
        finalRemarks = "Rejected due to invalid documents or mismatch.";
      if (newStatus === "Resubmit")
        finalRemarks = "Incomplete profile. Please upload a clear photo copy.";
      if (newStatus === "Processing")
        finalRemarks = "Application is in review by backend administrator.";
    }
    onUpdateStatus(ticket.id, newStatus, finalRemarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-900/40">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Service Ticket Details
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
              TXN: {ticket.transactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-[#0a0f18]/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-900/40">
            {/* Service Name */}
            <div className="col-span-2">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Requested Service
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">
                {ticket.serviceName}
              </span>
            </div>

            {/* Retailer */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Retailer Merchant
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                {ticket.retailerName}
              </span>
            </div>

            {/* Charge */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Processing Charge
              </span>
              <span className="font-extrabold text-[#005c3a] dark:text-emerald-400 text-sm mt-0.5 block">
                ₹{ticket.amount.toFixed(2)}
              </span>
            </div>

            {/* Created At */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Submission Date
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                {ticket.createdDate}
              </span>
            </div>

            {/* Last Updated */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Last Status Update
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                {ticket.lastUpdated}
              </span>
            </div>
          </div>

          {/* Current Remarks & Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare size={13} />
              <span>Internal Comments / Remarks</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setIsCustomRemarks(true);
              }}
              placeholder="e.g. Approved after physical validation. / Resubmit with voter ID copy..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 text-xs font-semibold focus:border-[#005c3a] dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Workflow Status Actions */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Workflow Status Actions
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Approve */}
              <button
                type="button"
                onClick={() => handleStatusClick("Approved")}
                disabled={ticket.status === "Approved"}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/10 disabled:text-emerald-500/40 text-white shadow-sm active:scale-[0.98]`}
              >
                <Check size={13} />
                <span>Approve</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => handleStatusClick("Rejected")}
                disabled={ticket.status === "Rejected"}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/10 disabled:text-rose-500/40 text-white shadow-sm active:scale-[0.98]`}
              >
                <AlertOctagon size={13} />
                <span>Reject</span>
              </button>

              {/* Resubmit */}
              <button
                type="button"
                onClick={() => handleStatusClick("Resubmit")}
                disabled={ticket.status === "Resubmit"}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800/10 disabled:text-violet-500/40 text-white shadow-sm active:scale-[0.98]`}
              >
                <RefreshCw size={13} />
                <span>Resubmit</span>
              </button>

              {/* Process */}
              <button
                type="button"
                onClick={() => handleStatusClick("Processing")}
                disabled={ticket.status === "Processing"}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800/10 disabled:text-sky-500/40 text-white shadow-sm active:scale-[0.98]`}
              >
                <Loader size={13} />
                <span>Process</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
