import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
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
    ackText?: string,
  ) => void | Promise<boolean | void>;
  isEditMode: boolean;
};

const FIELD_LABELS: Record<string, string> = {
  aadhaarNo: "Aadhaar Number",
  aadhaarNumber: "Aadhaar Number",
  mobileNo: "Mobile Number (Aadhaar link)",
  mobileNumber: "Mobile Number (Aadhaar link)",
  applicantName: "Applicant Name",
  doorNo: "Door Number",
  addressEnglish: "Address In English",
  addressTamil: "முகவரி தமிழில்",
  district: "District",
  taluk: "Taluk",
  postalArea: "Postal Area",
  pinCode: "Pin code",
  photo: "Photo",
  signature: "Signature",
  aadhaarCard: "Aadhaar Card",
};

const FILE_FIELD_KEYS = new Set([
  "photo",
  "signature",
  "aadhaarcard",
  "aadhaar_card",
  "aadhaarCard",
]);

const TEXTAREA_KEYS = new Set([
  "addressenglish",
  "addresstamil",
  "address",
  "remarks",
]);

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Resubmit", label: "Resubmit" },
  { value: "Process", label: "Processing" },
  { value: "Rejected", label: "Rejected" },
  { value: "Approved", label: "Approved" },
];

function formatLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function isFileLikeKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    FILE_FIELD_KEYS.has(key) ||
    FILE_FIELD_KEYS.has(lower) ||
    lower.includes("photo") ||
    lower.includes("signature") ||
    lower.includes("aadhaarcard") ||
    lower.includes("aadhaar_card") ||
    lower.includes("document") ||
    lower.includes("upload") ||
    lower.includes("file")
  );
}

function isTextareaKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    TEXTAREA_KEYS.has(lower) ||
    lower.includes("address") ||
    lower.includes("remark")
  );
}

function getFileName(path: string): string {
  return path.split("/").pop() || "Document";
}

function isImageFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
}

function resolveDocUrl(
  value: string,
  documents: string[],
  baseUrl: string,
): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads/") || value.startsWith("/api/")) {
    return value.startsWith("/api")
      ? `${baseUrl}${value}`
      : `${baseUrl}/api${value}`;
  }
  const match = documents.find(
    (d) => d === value || d.endsWith(`/${value}`) || getFileName(d) === value,
  );
  if (match) {
    return `${baseUrl}/api${match}`;
  }
  return null;
}

export function StatusDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdateStatus,
  isEditMode,
}: StatusDetailModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin && isEditMode;

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("Pending");
  const [remarks, setRemarks] = useState("");
  const [applicationNo, setApplicationNo] = useState("");
  const [ackFiles, setAckFiles] = useState<File[]>([]);
  const [ackType, setAckType] = useState<"text" | "file">("text");
  const [ackText, setAckText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
      setRemarks(
        ticket.remarks && ticket.remarks !== "No remarks."
          ? ticket.remarks
          : "",
      );
      setAckFiles([]);
      setAckText(ticket.ackText || "");
      setApplicationNo(ticket.ackText || "");
      setAckType(ticket.ackText ? "text" : "file");
    }
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
    /(?:\/api|\/)+$/,
    "",
  );
  const formData = ticket.formData || {};
  const documents = ticket.documents || [];

  const textEntries = Object.entries(formData).filter(
    ([key, value]) => !isFileLikeKey(key) && value !== undefined && value !== null,
  );
  const fileEntries = Object.entries(formData).filter(([key]) =>
    isFileLikeKey(key),
  );

  const unmatchedDocs = documents.filter((doc) => {
    const name = getFileName(doc);
    return !fileEntries.some(([, val]) => {
      if (!val) return false;
      return (
        val === doc ||
        val === name ||
        doc.endsWith(`/${val}`) ||
        getFileName(val) === name
      );
    });
  });

  const showRemarks =
    selectedStatus === "Resubmit" || selectedStatus === "Rejected";
  const showAckSelect =
    selectedStatus === "Process" || selectedStatus === "Approved";
  const showApplicationNo = selectedStatus === "Process" && ackType === "text";

  const handleSubmit = async () => {
    if (!canEdit || saving) return;

    let finalRemarks = remarks.trim();
    if (!finalRemarks) {
      if (selectedStatus === "Approved") {
        finalRemarks = "Request approved and processed successfully.";
      } else if (selectedStatus === "Rejected") {
        finalRemarks = "Rejected due to invalid documents or mismatch.";
      } else if (selectedStatus === "Process") {
        finalRemarks = applicationNo.trim()
          ? `Processing. Application No: ${applicationNo.trim()}`
          : "Request is being processed.";
      } else if (selectedStatus === "Resubmit") {
        finalRemarks = "Please resubmit with corrected documents.";
      } else {
        finalRemarks = "Marked as pending.";
      }
    }

    let finalAckText = "";
    let finalAckFiles: File[] = [];

    if (selectedStatus === "Process") {
      if (ackType === "text") {
        finalAckText = applicationNo.trim() || ackText.trim();
      } else {
        finalAckFiles = ackFiles;
      }
    } else if (selectedStatus === "Approved") {
      if (ackType === "text") {
        finalAckText = ackText.trim();
      } else {
        finalAckFiles = ackFiles;
      }
    }

    setSaving(true);
    try {
      const ok = await onUpdateStatus(
        ticket.id,
        selectedStatus,
        finalRemarks,
        finalAckFiles,
        finalAckText,
      );
      if (ok !== false) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const openDoc = (url: string | null) => {
    if (!url) return;
    setPreviewUrl(url);
  };

  const statusColor =
    ticket.status === "Approved"
      ? "text-emerald-600"
      : ticket.status === "Process"
        ? "text-blue-600"
        : ticket.status === "Pending"
          ? "text-amber-600"
          : ticket.status === "Resubmit"
            ? "text-purple-600"
            : ticket.status === "Rejected"
              ? "text-rose-600"
              : "text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f0f4f8]/95 animate-fadeIn">
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white shrink-0">
          <h3 className="text-base font-bold text-slate-800">
            Pending File Details
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto w-full max-w-4xl space-y-5">
            {/* Summary card — reference model */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2 p-4 border-b border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Requested Service
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {ticket.serviceName}
                  </span>
                </div>
                <div className="p-4 border-b border-r border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Retailer / Distributor
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {ticket.retailerName}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {ticket.retailerMobile || "—"}
                  </span>
                </div>
                <div className="p-4 border-b border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    User Role
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {ticket.userRole || "Retailer"}
                  </span>
                </div>
                <div className="p-4 border-b border-r border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Processing Charge
                  </span>
                  <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                    ₹{ticket.amount.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 border-b border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Current Status
                  </span>
                  <span
                    className={`text-sm font-bold uppercase tracking-wide mt-0.5 block ${statusColor}`}
                  >
                    {ticket.status === "Process"
                      ? "PROCESSING"
                      : ticket.status.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 border-r border-slate-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Submission Date
                  </span>
                  <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                    {ticket.createdDate}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Last Status Update
                  </span>
                  <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                    {ticket.lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            {/* Main form — thuruvancommunication.in model */}
            <div className="bg-white rounded-xl border-2 border-sky-300 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                {ticket.serviceName}
              </h2>

              {/* Form fields 2-col */}
              {textEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {textEntries.map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#7a1f1f]">
                        {formatLabel(key)}
                      </label>
                      {isTextareaKey(key) ? (
                        <textarea
                          readOnly
                          rows={3}
                          value={value || ""}
                          className="w-full rounded-md border border-slate-300 bg-[#e9ecef] px-3 py-2 text-sm text-slate-800 resize-y cursor-default focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          readOnly
                          value={value || ""}
                          className="w-full rounded-md border border-slate-300 bg-[#e9ecef] px-3 py-2 text-sm text-slate-800 cursor-default focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-2">
                  No application field data available for this request.
                </p>
              )}

              {(fileEntries.length > 0 || unmatchedDocs.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                  {fileEntries.map(([key, value]) => {
                    const url = resolveDocUrl(value || "", documents, baseUrl);
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          {formatLabel(key)}
                        </label>
                        <div>
                          <button
                            type="button"
                            disabled={!url}
                            onClick={() => openDoc(url)}
                            className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#8B1A1A] hover:bg-[#6d1414] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {unmatchedDocs.map((doc, idx) => {
                    const url = `${baseUrl}/api${doc}`;
                    const label =
                      fileEntries.length > 0
                        ? `Document ${idx + 1}`
                        : idx === 0
                          ? "Photo"
                          : idx === 1
                            ? "Signature"
                            : idx === 2
                              ? "Aadhaar Card"
                              : `Document ${idx + 1}`;
                    return (
                      <div key={doc} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          {label}
                        </label>
                        <div>
                          <button
                            type="button"
                            onClick={() => openDoc(url)}
                            className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Existing acknowledgement (view) */}
              {!canEdit &&
                ((ticket.ackFiles && ticket.ackFiles.length > 0) ||
                  ticket.ackText) && (
                  <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
                    <label className="text-xs font-semibold text-[#7a1f1f]">
                      Acknowledgement
                    </label>
                    {ticket.ackText && (
                      <input
                        type="text"
                        readOnly
                        value={ticket.ackText}
                        className="w-full rounded-md border border-slate-300 bg-[#e9ecef] px-3 py-2 text-sm text-slate-800"
                      />
                    )}
                    {ticket.ackFiles?.map((doc) => (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => openDoc(`${baseUrl}/api${doc}`)}
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold mr-2"
                      >
                        View {getFileName(doc)}
                      </button>
                    ))}
                  </div>
                )}

              {/* Admin workflow controls */}
              {canEdit && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Service Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#7a1f1f]">
                        Service Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as TicketStatus)
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remarks — Resubmit / Rejected */}
                    {showRemarks && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Remarks"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </div>
                    )}

                    {/* Select Text / File — Process / Approved */}
                    {showAckSelect && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          Select
                        </label>
                        <select
                          value={ackType}
                          onChange={(e) =>
                            setAckType(e.target.value as "text" | "file")
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                    )}

                    {/* Application No — Processing + Text */}
                    {showApplicationNo && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          Application No
                        </label>
                        <input
                          type="text"
                          value={applicationNo}
                          onChange={(e) => setApplicationNo(e.target.value)}
                          placeholder="Application No"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </div>
                    )}

                    {/* Ack text — Approved + Text */}
                    {selectedStatus === "Approved" && ackType === "text" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          Acknowledgement Text
                        </label>
                        <input
                          type="text"
                          value={ackText}
                          onChange={(e) => setAckText(e.target.value)}
                          placeholder="Enter acknowledgement text"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </div>
                    )}

                    {/* File upload — Process/Approved + File */}
                    {showAckSelect && ackType === "file" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          Upload File
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files) {
                              setAckFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center justify-center gap-2 w-full rounded-md border border-dashed border-slate-400 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Upload size={14} />
                          {ackFiles.length > 0
                            ? `${ackFiles.length} file(s) selected`
                            : "Choose file"}
                        </button>
                        {ackFiles.length > 0 && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {ackFiles.map((f) => f.name).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-center mt-6">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSubmit}
                      className="min-w-[140px] px-8 py-2.5 rounded-md bg-[#1e88e5] hover:bg-[#1565c0] disabled:opacity-60 text-white text-sm font-bold shadow-sm"
                    >
                      {saving ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {/* View-only remarks */}
              {!canEdit &&
                ticket.remarks &&
                ticket.remarks !== "No remarks." && (
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <label className="text-xs font-semibold text-[#7a1f1f]">
                      Remarks
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={ticket.remarks}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-[#e9ecef] px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            {isImageFile(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <iframe
                src={previewUrl}
                title="Document preview"
                className="w-full h-[85vh] bg-white rounded-xl"
              />
            )}
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
