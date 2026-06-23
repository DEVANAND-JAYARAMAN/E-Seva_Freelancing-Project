import { useState, useEffect } from "react";
import { X, Check, AlertOctagon, RefreshCw, Loader, Download, Eye, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";
import type { StatusTicket, TicketStatus } from "./types";
import { useAuth } from "../store/context/AuthContext";

type StatusDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ticket: StatusTicket | null;
  onUpdateStatus: (
    id: string,
    newStatus: TicketStatus,
    remarks: string,
  ) => void;
  isEditMode: boolean;
};

export function StatusDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdateStatus,
  isEditMode,
}: StatusDetailModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const showEditControls = isAdmin;
  const [remarks, setRemarks] = useState("");
  const [isCustomRemarks, setIsCustomRemarks] = useState(false);

  useEffect(() => {
    if (ticket) {
      setRemarks(ticket.remarks || "");
    }
    setIsCustomRemarks(false);
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "");

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

  // Completed is handled via the same API but we cast it
  const handleCompleted = () => {
    let finalRemarks = remarks.trim();
    if (!finalRemarks || !isCustomRemarks) {
      finalRemarks = "Service request has been completed successfully.";
    }
    onUpdateStatus(ticket.id, "Completed" as TicketStatus, finalRemarks);
    onClose();
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) {
      return <ImageIcon size={14} className="text-blue-500" />;
    }
    return <FileText size={14} className="text-orange-500" />;
  };

  const getFileName = (path: string) => {
    return path.split("/").pop() || `Document`;
  };

  const isImageFile = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn">
      {/* Modal Container - scrollable */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-slideUp flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-900/40 shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Service Request Details
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
              ID: {ticket.transactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Core Details Grid */}
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
                Retailer / Distributor
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                {ticket.retailerName}
              </span>
            </div>

            {/* Role */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                User Role
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                {ticket.userRole || "Retailer"}
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

            {/* Current Status */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Current Status
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 mt-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase ${
                ticket.status === "Approved" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                ticket.status === "Pending" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" :
                ticket.status === "Processing" ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400" :
                ticket.status === "Rejected" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" :
                ticket.status === "Resubmit" ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" :
                "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              }`}>
                {ticket.status}
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

          {/* Form Data - Customer Details */}
          {!isEditMode && ticket.formData && Object.keys(ticket.formData).length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                📋 Customer Application Data
              </span>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0a0f18]/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                {Object.entries(ticket.formData).map(([key, value]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
                      {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs break-words">
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents & Files - With Preview and Download */}
          {!isEditMode && ticket.documents && ticket.documents.length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                📎 Attached Documents ({ticket.documents.length})
              </span>
              <div className="space-y-3">
                {ticket.documents.map((doc, idx) => {
                  const fullUrl = `${baseUrl}/api${doc}`;
                  const fileName = getFileName(doc);
                  const isImage = isImageFile(doc);

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-[#0a0f18]/30 rounded-xl border border-slate-100 dark:border-slate-800/50 overflow-hidden"
                    >
                      {/* Image Preview */}
                      {isImage && (
                        <div className="w-full max-h-52 overflow-hidden bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center">
                          <img
                            src={fullUrl}
                            alt={fileName}
                            className="w-full h-full object-contain max-h-52"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* File Info Bar */}
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getFileIcon(doc)}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {fileName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* View in new tab */}
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                            title="View document"
                          >
                            <Eye size={14} />
                          </a>

                          {/* Download */}
                          <a
                            href={fullUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Download document"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remarks Section */}
          {ticket.remarks && (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Admin Remarks
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0f18]/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                {ticket.remarks}
              </p>
            </div>
          )}

          {/* Admin: Custom Remarks Input */}
          {showEditControls && isEditMode && (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Update Remarks (Optional)
              </span>
              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setIsCustomRemarks(true);
                }}
                rows={2}
                placeholder="Enter custom remarks before updating status..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18] text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 dark:focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>
          )}

          {/* Workflow Status Actions */}
          {showEditControls && isEditMode && (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Workflow Status Actions
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* Approve */}
                <button
                  type="button"
                  onClick={() => handleStatusClick("Approved")}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-[0.98]`}
                >
                  <Check size={13} />
                  <span>Approve</span>
                </button>

                {/* Reject */}
                <button
                  type="button"
                  onClick={() => handleStatusClick("Rejected")}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:scale-[0.98]`}
                >
                  <AlertOctagon size={13} />
                  <span>Reject</span>
                </button>

                {/* Resubmit */}
                <button
                  type="button"
                  onClick={() => handleStatusClick("Resubmit")}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-violet-600 hover:bg-violet-500 text-white shadow-sm active:scale-[0.98]`}
                >
                  <RefreshCw size={13} />
                  <span>Resubmit</span>
                </button>

                {/* Process */}
                <button
                  type="button"
                  onClick={() => handleStatusClick("Processing")}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-sky-600 hover:bg-sky-500 text-white shadow-sm active:scale-[0.98]`}
                >
                  <Loader size={13} />
                  <span>Process</span>
                </button>

                {/* Complete - Full Width */}
                <button
                  type="button"
                  onClick={handleCompleted}
                  className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all duration-200 bg-gradient-to-r from-[#005c3a] to-emerald-600 hover:from-emerald-600 hover:to-[#005c3a] text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                >
                  <CheckCircle size={16} />
                  <span>Mark as Completed</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
