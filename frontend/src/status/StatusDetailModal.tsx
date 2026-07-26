import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ArrowLeft } from "lucide-react";
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

  const statusBadge =
    ticket.status === "Approved"
      ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30"
      : ticket.status === "Process"
        ? "bg-sky-500/15 text-sky-700 ring-sky-500/30"
        : ticket.status === "Pending"
          ? "bg-amber-500/15 text-amber-800 ring-amber-500/30"
          : ticket.status === "Resubmit"
            ? "bg-teal-500/15 text-teal-800 ring-teal-500/30"
            : ticket.status === "Rejected"
              ? "bg-rose-500/15 text-rose-700 ring-rose-500/30"
              : "bg-slate-500/15 text-slate-700 ring-slate-500/30";

  const fieldShell = (editable: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm tracking-tight focus:outline-none transition-shadow ${
      editable
        ? "border-slate-200 bg-white text-slate-900 shadow-sm focus:border-[#005c3a]/50 focus:ring-2 focus:ring-[#005c3a]/20"
        : "border-slate-200/80 bg-slate-50/80 text-slate-800"
    }`;

  const page = (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#f3f6f4] dark:bg-[#030712]">
      {/* Soft brand atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#005c3a]/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-emerald-400/[0.05] blur-3xl" />
      </div>

      <header className="relative shrink-0 border-b border-emerald-900/10 bg-gradient-to-r from-[#003d28] via-[#005c3a] to-[#0a7a4d] text-white shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-1.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/80">
                Services Status
              </p>
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate">
                File Details
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span
              className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset bg-white/15 text-white ring-white/25`}
            >
              {statusLabel}
            </span>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
              type="button"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Hero summary */}
          <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/90 dark:bg-[#090d16]/95 shadow-[0_20px_50px_-28px_rgba(0,60,40,0.45)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005c3a] via-emerald-400 to-teal-300" />
            <div className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Requested Service
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {ticket.serviceName}
                  </h2>
                </div>
                <span
                  className={`inline-flex self-start items-center px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ring-1 ring-inset ${statusBadge}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3.5 sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Retailer / Distributor
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white truncate">
                    {ticket.retailerName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {ticket.retailerMobile || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3.5 sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    User Role
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                    {ticket.userRole || "Retailer"}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-3.5 sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                    Processing Charge
                  </p>
                  <p className="mt-1.5 text-lg font-black text-emerald-700 dark:text-emerald-400">
                    ₹{ticket.amount.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-3.5 sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Timeline
                  </p>
                  <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Submitted {ticket.createdDate}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Updated {ticket.lastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Application data */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#090d16] shadow-[0_16px_40px_-30px_rgba(15,23,42,0.45)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/40 dark:to-transparent">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Application Data
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  Submitted fields and attached documents
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {canReapply &&
                ticket.remarks &&
                ticket.remarks !== "No remarks." && (
                  <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5 text-sm text-teal-950">
                    <span className="font-bold">Admin asked to resubmit:</span>{" "}
                    {ticket.remarks}
                  </div>
                )}

              {textEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                  {textEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex flex-col gap-1.5 ${
                        isTextareaKey(key) ? "sm:col-span-2" : ""
                      }`}
                    >
                      <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
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
                          className={`${fieldShell(canReapply)} resize-y min-h-[88px]`}
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
                          className={fieldShell(canReapply)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500">
                  No application field data available for this request.
                </p>
              )}

              {(fileEntries.length > 0 || unmatchedDocs.length > 0) && (
                <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-4">
                    Documents
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div
                          key={key}
                          className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4"
                        >
                          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                            {label}
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDoc(url, label)}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#005c3a] hover:bg-[#004d30] text-white text-xs font-bold shadow-sm shadow-emerald-900/10 transition-colors"
                            >
                              View
                            </button>
                            {canReapply && (
                              <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors">
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
                        <div
                          key={doc}
                          className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4"
                        >
                          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                            {label}
                          </label>
                          <button
                            type="button"
                            onClick={() => openDoc(url, label)}
                            className="inline-flex items-center justify-center self-start px-4 py-2 rounded-lg bg-[#005c3a] hover:bg-[#004d30] text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {canReapply && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    disabled={resubmitting || !onResubmit}
                    onClick={handleReapply}
                    className="min-w-[160px] px-8 py-3 rounded-xl bg-[#005c3a] hover:bg-[#004d30] disabled:opacity-60 text-white text-sm font-extrabold shadow-lg shadow-emerald-900/15 transition-all"
                  >
                    {resubmitting ? "Reapplying..." : "Reapply"}
                  </button>
                </div>
              )}

              {!canEdit &&
                !canReapply &&
                ((ticket.ackFiles && ticket.ackFiles.length > 0) ||
                  ticket.ackText) && (
                  <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      Acknowledgement
                    </p>
                    {ticket.ackText && (
                      <input
                        type="text"
                        readOnly
                        value={ticket.ackText}
                        className={fieldShell(false)}
                      />
                    )}
                    <div className="flex flex-wrap gap-2">
                      {ticket.ackFiles?.map((doc) => (
                        <button
                          key={doc}
                          type="button"
                          onClick={() =>
                            openDoc(toPublicDocUrl(doc), getFileName(doc))
                          }
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#005c3a] hover:bg-[#004d30] text-white text-xs font-bold transition-colors"
                        >
                          View {getFileName(doc)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {canEdit && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-4">
                    Update Status
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                        Service Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as TicketStatus)
                        }
                        className={fieldShell(true)}
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

                    {showRemarks && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Remarks"
                          className={fieldShell(true)}
                        />
                      </div>
                    )}

                    {showAckSelect && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          Select
                        </label>
                        <select
                          value={ackType}
                          onChange={(e) =>
                            setAckType(e.target.value as "text" | "file")
                          }
                          className={fieldShell(true)}
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                    )}

                    {showApplicationNo && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          Application No
                        </label>
                        <input
                          type="text"
                          value={applicationNo}
                          onChange={(e) => setApplicationNo(e.target.value)}
                          placeholder="Application No"
                          className={fieldShell(true)}
                        />
                      </div>
                    )}

                    {selectedStatus === "Approved" && ackType === "text" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          Acknowledgement Text
                        </label>
                        <input
                          type="text"
                          value={ackText}
                          onChange={(e) => setAckText(e.target.value)}
                          placeholder="Enter acknowledgement text"
                          className={fieldShell(true)}
                        />
                      </div>
                    )}

                    {showAckSelect && ackType === "file" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
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
                          className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
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

                  <div className="flex justify-center mt-8">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSubmit}
                      className="min-w-[160px] px-8 py-3 rounded-xl bg-[#005c3a] hover:bg-[#004d30] disabled:opacity-60 text-white text-sm font-extrabold shadow-lg shadow-emerald-900/15 transition-all"
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
                  <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      Remarks
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={ticket.remarks}
                      className={`mt-1.5 ${fieldShell(false)}`}
                    />
                  </div>
                )}
            </div>
          </section>
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            {isImageFile(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
            ) : (
              <iframe
                src={previewUrl}
                title="Document preview"
                className="w-full h-[85vh] bg-white rounded-2xl"
              />
            )}
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl"
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
