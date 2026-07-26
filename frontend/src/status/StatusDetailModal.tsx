import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ArrowLeft, User, Phone, IndianRupee, CalendarDays, BadgeCheck, Briefcase } from "lucide-react";
import Swal from "sweetalert2";
import type { StatusTicket, TicketStatus } from "./types";
import { useAuth } from "../store/context/AuthContext";
import { getApiBaseUrl, authFetch, apiUrl } from "../utils/apiBase";

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
  onResubmit?: (
    id: string,
    formData: Record<string, string>,
    documents: string[],
  ) => Promise<boolean | void>;
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

/** Match submit-form order so Details is not alphabetical JSON key order. */
const FIELD_DISPLAY_ORDER = [
  "aadhaarNo",
  "aadhaarNumber",
  "mobileNo",
  "mobileNumber",
  "applicantName",
  "doorNo",
  "addressEnglish",
  "addressTamil",
  "district",
  "taluk",
  "postalArea",
  "pinCode",
  "photo",
  "signature",
  "aadhaarCard",
  "aadhaarcard",
  "aadhaar_card",
];

const TEXTAREA_KEYS = new Set([
  "addressenglish",
  "addresstamil",
  "address",
  "remarks",
]);

function fieldSortIndex(key: string): number {
  const exact = FIELD_DISPLAY_ORDER.indexOf(key);
  if (exact >= 0) return exact;
  const lower = key.toLowerCase();
  const loose = FIELD_DISPLAY_ORDER.findIndex((k) => k.toLowerCase() === lower);
  if (loose >= 0) return loose;
  return FIELD_DISPLAY_ORDER.length + 100;
}

function sortFormEntries<T extends [string, unknown]>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const di = fieldSortIndex(a[0]) - fieldSortIndex(b[0]);
    if (di !== 0) return di;
    return a[0].localeCompare(b[0]);
  });
}

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

/** Build a browser-openable URL for an uploaded document path. */
function toPublicDocUrl(pathOrUrl: string): string | null {
  const raw = (pathOrUrl || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  const base = getApiBaseUrl().replace(/\/+$/, ""); // .../api or /backend-api
  let path = raw;
  if (path.startsWith("/api/")) path = path.slice(4); // -> /uploads/...
  if (!path.startsWith("/")) path = `/${path}`;
  // Static files live at /api/uploads/...
  if (path.startsWith("/uploads/")) {
    return `${base}${path}`;
  }
  return `${base}${path}`;
}

function resolveDocUrl(
  value: string,
  documents: string[],
  fieldIndex?: number,
): string | null {
  if (value) {
    const trimmed = value.trim();
    if (
      trimmed.startsWith("http") ||
      trimmed.startsWith("/uploads/") ||
      trimmed.startsWith("/api/") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("data:")
    ) {
      return toPublicDocUrl(trimmed);
    }
    const match = documents.find(
      (d) =>
        d === trimmed ||
        d.endsWith(`/${trimmed}`) ||
        getFileName(d) === trimmed ||
        getFileName(d).endsWith(`_${trimmed}`) ||
        getFileName(d).includes(trimmed),
    );
    if (match) return toPublicDocUrl(match);
  }
  // Fallback: map Photo / Signature / Aadhaar by position when only documents[] exists
  if (
    typeof fieldIndex === "number" &&
    fieldIndex >= 0 &&
    fieldIndex < documents.length
  ) {
    return toPublicDocUrl(documents[fieldIndex]);
  }
  return null;
}

export function StatusDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpdateStatus,
  isEditMode,
  onResubmit,
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
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [resubmitting, setResubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canReapply =
    !isAdmin &&
    (user?.role === "retailer" || user?.role === "distributor") &&
    ticket?.status === "Resubmit";

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

  useEffect(() => {
    if (
      ticket &&
      isOpen &&
      !isAdmin &&
      (user?.role === "retailer" || user?.role === "distributor") &&
      ticket.status === "Resubmit"
    ) {
      setEditForm({ ...(ticket.formData || {}) });
      setPendingFiles({});
      setResubmitting(false);
    }
  }, [ticket, isOpen, isAdmin, user?.role]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const formData =
    canReapply && Object.keys(editForm).length > 0
      ? editForm
      : ticket.formData || {};
  const documents = ticket.documents || [];

  const textEntries = sortFormEntries(
    Object.entries(formData).filter(
      ([key, value]) =>
        !isFileLikeKey(key) && value !== undefined && value !== null,
    ),
  );
  const fileEntries = sortFormEntries(
    Object.entries(formData).filter(([key]) => isFileLikeKey(key)),
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

  const handleReapply = async () => {
    if (!canReapply || !onResubmit || resubmitting) return;

    setResubmitting(true);
    try {
      const updatedForm: Record<string, string> = { ...editForm };
      const uploadErrors: string[] = [];

      for (const [key, file] of Object.entries(pendingFiles)) {
        try {
          const uploadBody = new FormData();
          uploadBody.append("file", file);
          const upRes = await authFetch(apiUrl("uploads"), {
            method: "POST",
            body: uploadBody,
          });
          const upData = await upRes.json().catch(() => ({}));
          if (!upRes.ok || !upData.path) {
            uploadErrors.push(file.name);
            continue;
          }
          const path = String(upData.path);
          let mapped = false;
          for (const [k, val] of Object.entries(updatedForm)) {
            if (val === file.name) {
              updatedForm[k] = path;
              mapped = true;
            }
          }
          if (!mapped) {
            updatedForm[key] = path;
          }
        } catch {
          uploadErrors.push(file.name);
        }
      }

      if (uploadErrors.length > 0) {
        await Swal.fire({
          icon: "error",
          title: "Upload failed",
          text: `Could not upload: ${uploadErrors.join(", ")}. Check internet and try again.`,
        });
        return;
      }

      const docs: string[] = [];
      const seen = new Set<string>();
      const addDoc = (p: string) => {
        const t = (p || "").trim();
        if (!t || seen.has(t) || !t.startsWith("/uploads/")) return;
        seen.add(t);
        docs.push(t);
      };
      for (const v of Object.values(updatedForm)) {
        addDoc(v);
      }
      for (const doc of documents) {
        const referenced = Object.values(updatedForm).some((v) => {
          if (!v) return false;
          return (
            v === doc ||
            doc.endsWith(`/${v}`) ||
            getFileName(doc) === getFileName(v) ||
            getFileName(doc) === v
          );
        });
        if (referenced) addDoc(doc);
      }

      const ok = await onResubmit(ticket.id, updatedForm, docs);
      if (ok !== false) {
        onClose();
      }
    } finally {
      setResubmitting(false);
    }
  };

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

  const openDoc = async (url: string | null, label?: string) => {
    if (!url) {
      await Swal.fire({
        icon: "warning",
        title: "Document not available",
        text:
          (label ? `${label}: ` : "") +
          "File was not saved with this request. Ask the retailer to resubmit with documents attached.",
      });
      return;
    }
    // Prefer preview modal; also verify the file is reachable
    try {
      const head = await authFetch(url, { method: "GET", cache: "no-store" });
      if (!head.ok) {
        await Swal.fire({
          icon: "error",
          title: "Cannot open document",
          text: `Server returned ${head.status}. File may be missing on the server.`,
        });
        return;
      }
    } catch {
      // Still try preview — CORS HEAD may fail even when GET/img works
    }
    setPreviewUrl(url);
  };

  const statusLabel =
    ticket.status === "Process" ? "PROCESSING" : ticket.status.toUpperCase();

  const statusPill =
    ticket.status === "Approved"
      ? "bg-emerald-500 text-white shadow-emerald-200"
      : ticket.status === "Process"
        ? "bg-sky-500 text-white shadow-sky-200"
        : ticket.status === "Pending"
          ? "bg-amber-500 text-white shadow-amber-200"
          : ticket.status === "Resubmit"
            ? "bg-violet-500 text-white shadow-violet-200"
            : ticket.status === "Rejected"
              ? "bg-rose-500 text-white shadow-rose-200"
              : "bg-slate-500 text-white";

  const headerWash =
    ticket.status === "Approved"
      ? "from-emerald-700 via-teal-700 to-cyan-800"
      : ticket.status === "Process"
        ? "from-sky-700 via-blue-700 to-indigo-800"
        : ticket.status === "Pending"
          ? "from-amber-600 via-orange-600 to-rose-600"
          : ticket.status === "Resubmit"
            ? "from-violet-700 via-fuchsia-700 to-pink-800"
            : ticket.status === "Rejected"
              ? "from-rose-700 via-red-700 to-orange-800"
              : "from-slate-700 via-slate-800 to-slate-900";

  const page = (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-br from-teal-50 via-sky-50 to-amber-50 dark:from-[#030712] dark:via-[#071018] dark:to-[#0a1220]">
      {/* Page header - full cover, not a floating modal */}
      <header className={`shrink-0 bg-gradient-to-r ${headerWash} text-white shadow-lg`}>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center gap-1.5 px-3 rounded-lg border border-white/30 bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-white truncate drop-shadow-sm">
                File Details
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 truncate">
                {ticket.serviceName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${statusPill}`}
            >
              {statusLabel}
            </span>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
              type="button"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
            {/* Colorful summary tiles */}
            <div className="rounded-2xl border border-teal-200/80 dark:border-teal-900/50 bg-white/80 dark:bg-[#090d16]/90 backdrop-blur-sm shadow-md overflow-hidden">
              <div className="px-4 sm:px-5 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Briefcase size={18} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 block">
                      Requested Service
                    </span>
                    <span className="text-base sm:text-lg font-black text-white mt-0.5 block truncate">
                      {ticket.serviceName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
                <div className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User size={14} className="text-sky-600 dark:text-sky-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80 dark:text-sky-300/80">
                      Retailer / Distributor
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {ticket.retailerName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300 mt-1">
                    <Phone size={11} />
                    {ticket.retailerMobile || "—"}
                  </span>
                </div>

                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BadgeCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700/80 dark:text-indigo-300/80">
                      User Role
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {ticket.userRole || "Retailer"}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <IndianRupee size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80">
                      Processing Charge
                    </span>
                  </div>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 block">
                    ₹{ticket.amount.toFixed(2)}
                  </span>
                </div>

                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-300/80">
                      Current Status
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide shadow-sm ${statusPill}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/40 dark:to-teal-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CalendarDays size={14} className="text-cyan-600 dark:text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700/80 dark:text-cyan-300/80">
                      Submission Date
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {ticket.createdDate}
                  </span>
                </div>

                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CalendarDays size={14} className="text-rose-600 dark:text-rose-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/80 dark:text-rose-300/80">
                      Last Status Update
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {ticket.lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            {/* Main form — same fields, colorful frame */}
            <div className="bg-white dark:bg-[#090d16] rounded-2xl border-2 border-teal-300 dark:border-teal-800 p-5 sm:p-6 shadow-md overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-teal-100 dark:border-teal-900/40">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {ticket.serviceName}
                </h2>
                <span
                  className={`sm:hidden inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusPill}`}
                >
                  {statusLabel}
                </span>
              </div>

              {canReapply &&
                ticket.remarks &&
                ticket.remarks !== "No remarks." && (
                  <div className="mb-5 rounded-md border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                    <span className="font-semibold">Admin asked to resubmit:</span>{" "}
                    {ticket.remarks}
                  </div>
                )}

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
                          readOnly={!canReapply}
                          rows={3}
                          value={value || ""}
                          onChange={
                            canReapply
                              ? (e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                              : undefined
                          }
                          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 resize-y focus:outline-none ${
                            canReapply
                              ? "bg-white focus:ring-2 focus:ring-sky-400"
                              : "bg-[#e9ecef] cursor-default"
                          }`}
                        />
                      ) : (
                        <input
                          type="text"
                          readOnly={!canReapply}
                          value={value || ""}
                          onChange={
                            canReapply
                              ? (e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                              : undefined
                          }
                          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none ${
                            canReapply
                              ? "bg-white focus:ring-2 focus:ring-sky-400"
                              : "bg-[#e9ecef] cursor-default"
                          }`}
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
                  {fileEntries.map(([key, value], idx) => {
                    const orderKeys = ["photo", "signature", "aadhaarcard"];
                    const orderIdx = orderKeys.indexOf(key.toLowerCase());
                    const viewSource = canReapply
                      ? ticket.formData?.[key] || ""
                      : value || "";
                    const url = resolveDocUrl(
                      viewSource,
                      documents,
                      orderIdx >= 0 ? orderIdx : idx,
                    );
                    const label = formatLabel(key);
                    const pendingName = pendingFiles[key]?.name;
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#7a1f1f]">
                          {label}
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDoc(url, label)}
                            className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold"
                          >
                            View
                          </button>
                          {canReapply && (
                            <label className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#1e88e5] hover:bg-[#1565c0] text-white text-sm font-semibold cursor-pointer">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setPendingFiles((prev) => ({
                                    ...prev,
                                    [key]: file,
                                  }));
                                  setEditForm((prev) => ({
                                    ...prev,
                                    [key]: file.name,
                                  }));
                                }}
                              />
                            </label>
                          )}
                        </div>
                        {canReapply && pendingName && (
                          <p className="text-[11px] text-slate-500 truncate">
                            New file: {pendingName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {unmatchedDocs.map((doc, idx) => {
                    const url = toPublicDocUrl(doc);
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
                            onClick={() => openDoc(url, label)}
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

              {canReapply && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    disabled={resubmitting || !onResubmit}
                    onClick={handleReapply}
                    className="min-w-[140px] px-8 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white text-sm font-black shadow-md shadow-teal-200/50"
                  >
                    {resubmitting ? "Reapplying..." : "Reapply"}
                  </button>
                </div>
              )}

              {/* Existing acknowledgement (view) */}
              {!canEdit &&
                !canReapply &&
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
                        onClick={() =>
                          openDoc(toPublicDocUrl(doc), getFileName(doc))
                        }
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold mr-2"
                      >
                        View {getFileName(doc)}
                      </button>
                    ))}
                  </div>
                )}

              {/* Admin workflow controls */}
              {canEdit && (
                <div className="mt-6 pt-5 border-t-2 border-teal-100 dark:border-teal-900/50 rounded-xl bg-gradient-to-br from-teal-50/80 to-sky-50/80 dark:from-teal-950/20 dark:to-sky-950/20 px-4 py-4 -mx-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-3">Admin actions</p>
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
                      className="min-w-[140px] px-8 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white text-sm font-black shadow-md shadow-teal-200/50"
                    >
                      {saving ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {!canEdit &&
                !canReapply &&
                ticket.remarks &&
                ticket.remarks !== "No remarks." && (
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
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

      {/* Preview overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4">
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

  if (typeof document === "undefined") return page;
  return createPortal(page, document.body);
}
