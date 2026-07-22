import { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  AlertOctagon,
  RefreshCw,
  Loader,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Upload,
} from "lucide-react";
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
    ackFiles?: File[],
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
  const [ackFiles, setAckFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ticket) {
      setRemarks(ticket.remarks || "");
      setAckFiles([]);
    }
    setIsCustomRemarks(false);
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
    /(?:\/api|\/)+$/,
    "",
  );

  const handleStatusClick = (newStatus: TicketStatus) => {
    let finalRemarks = remarks.trim();
    if (!finalRemarks || !isCustomRemarks) {
      if (newStatus === "Approved")
        finalRemarks = "Request approved and processed successfully.";
      if (newStatus === "Rejected")
        finalRemarks = "Rejected due to invalid documents or mismatch.";
    }
    onUpdateStatus(ticket.id, newStatus, finalRemarks, ackFiles);
    onClose();
  };

  // Removed handleCompleted as per requirements

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

  let customerName = "Unknown";
  if (ticket && ticket.formData) {
    for (const [key, val] of Object.entries(ticket.formData)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes("name") &&
        !lowerKey.includes("father") &&
        !lowerKey.includes("mother")
      ) {
        customerName = val;
        break;
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-50 dark:bg-[#04080f] animate-fadeIn">
      {/* Full Page Container */}
      <div className="relative w-full h-full bg-slate-50 dark:bg-[#090d16] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-900/60 shrink-0 bg-slate-50 dark:bg-[#090d16] z-10">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Service Request Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Left Column: Details */}
            <div className="space-y-6 lg:col-span-2">
              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-[#0a0f18]/10 p-5 rounded-2xl border-2 border-black dark:border-white">
                {/* Service Name */}
                <div className="col-span-2 bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Requested Service
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">
                    {ticket.serviceName}
                  </span>
                </div>

                {/* Retailer */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Retailer / Distributor
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                    {ticket.retailerName}
                  </span>
                  {ticket.retailerMobile && (
                    <span className="text-xs font-mono text-slate-500 block mt-1">
                      {ticket.retailerMobile}
                    </span>
                  )}
                </div>

                {/* Role */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    User Role
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                    {ticket.userRole || "Retailer"}
                  </span>
                </div>

                {/* Charge */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Processing Charge
                  </span>
                  <span className="font-extrabold text-[#005c3a] dark:text-emerald-400 text-sm mt-0.5 block">
                    ₹{ticket.amount.toFixed(2)}
                  </span>
                </div>

                {/* Current Status */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 mt-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase ${
                      ticket.status === "Approved"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : ticket.status === "Process"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : ticket.status === "Pending"
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                        : ticket.status === "Resubmit"
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                          : ticket.status === "Rejected"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            : "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* Created At */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Submission Date
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                    {ticket.createdDate}
                  </span>
                </div>

                {/* Last Updated */}
                <div className="bg-slate-50 dark:bg-[#090d16] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Last Status Update
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                    {ticket.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Form Data - Customer Details */}
              {!isEditMode &&
                ticket.formData &&
                Object.keys(ticket.formData).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={14}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        Customer Application Data
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/50 dark:bg-[#0a0f18]/10 p-6 rounded-2xl border border-slate-100 dark:border-slate-900/40">
                      {Object.entries(ticket.formData).map(([key, value]) => (
                        <div key={key} className="space-y-1.5 flex flex-col">
                          <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block tracking-widest pl-1">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/_/g, " ")
                              .trim()}
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={value || ""}
                            className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none shadow-sm cursor-default"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Documents & Files - With Preview and Download */}
              {!isEditMode &&
                ticket.documents &&
                ticket.documents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={14}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        Attached Documents ({ticket.documents.length})
                      </span>
                    </div>
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
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={fullUrl}
                                  alt={fileName}
                                  className="w-full h-full object-contain max-h-52"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
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
                                {/* View */}
                                {isImage ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(fullUrl)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                                    title="Preview document"
                                  >
                                    <Eye size={14} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(fullUrl)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                                    title="View document"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}

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

              {/* Acknowledgement Documents - Rendered for all */}
              {!isEditMode && ticket.ackFiles && ticket.ackFiles.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block">
                    ✅ Acknowledgement Document(s)
                  </span>
                  <div className="space-y-3">
                    {ticket.ackFiles.map((doc, idx) => {
                      const fullUrl = `${baseUrl}/api${doc}`;
                      const fileName = getFileName(doc);
                      const isImage = isImageFile(doc);

                      return (
                        <div
                          key={idx}
                          className="bg-emerald-50/50 dark:bg-[#0a0f18]/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 overflow-hidden"
                        >
                          {/* Image Preview */}
                          {isImage && (
                            <div className="w-full max-h-52 overflow-hidden bg-emerald-100/50 dark:bg-emerald-900/50 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={fullUrl}
                                alt={fileName}
                                className="w-full h-full object-contain max-h-52"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
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
                              <button
                                type="button"
                                onClick={() => setPreviewImage(fullUrl)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/50 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 transition-colors"
                                title="View document"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Download */}
                              <a
                                href={fullUrl}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
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
            </div>

            {/* Right Column: Actions & Form Data */}
            <div className="space-y-6 lg:col-span-1">
              {/* Remarks Section */}
              {ticket.remarks && (
                <div className="bg-slate-50/50 dark:bg-[#0a0f18]/10 p-5 rounded-2xl border-2 border-black dark:border-white space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Admin Remarks
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#090d16] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {ticket.remarks}
                  </p>
                </div>
              )}

              {/* Admin: Custom Remarks Input */}
              {showEditControls && isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      rows={4}
                      placeholder="Enter custom remarks before updating status..."
                      className="w-full h-[142px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 dark:focus:ring-emerald-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-[#0a0f18]/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                          Customer Name
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          {customerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                          Requested Service
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                          {ticket.serviceName}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block">
                        Upload Acknowledgement
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            setAckFiles(Array.from(e.target.files));
                          }
                        }}
                        multiple
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Upload size={16} />
                        {ackFiles.length > 0
                          ? `${ackFiles.length} File(s) Selected`
                          : "Select Files"}
                      </button>
                      {ackFiles.length > 0 && (
                        <p className="text-[10px] text-emerald-600/70 font-semibold truncate">
                          {ackFiles.map((f) => f.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Workflow Status Actions */}
              {showEditControls && isEditMode && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-4">
                    Workflow Status Actions
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Approve */}
                    <button
                      type="button"
                      onClick={() => handleStatusClick("Approved")}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-[0.98] ${ticket.status === "Approved" ? "col-span-2 sm:col-span-4" : ""}`}
                    >
                      <Check size={13} />
                      <span>{ticket.status === "Approved" ? "Update Acknowledgement" : "Approve"}</span>
                    </button>

                    {ticket.status !== "Approved" && (
                      <>
                        {/* Process */}
                        <button
                          type="button"
                          onClick={() => handleStatusClick("Process")}
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-[0.98]`}
                        >
                          <Loader size={13} />
                          <span>Process</span>
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
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 bg-purple-600 hover:bg-purple-500 text-white shadow-sm active:scale-[0.98]`}
                        >
                          <RefreshCw size={13} />
                          <span>Resubmit</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 hover:bg-red-500 text-white backdrop-blur-md transition-colors shadow-2xl z-[110]"
              title="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
