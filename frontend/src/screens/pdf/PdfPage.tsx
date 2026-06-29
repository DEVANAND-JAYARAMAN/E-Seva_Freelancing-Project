"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Search,
  Download,
  Plus,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  Pencil,
  Upload,
  Trash,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { InputField, SubmitButton } from "../services/form/FormFields";
import { validateField, PATTERNS } from "../services/form/validators";
import { ServiceNavigation } from "../../components/ServiceNavigation/ServiceNavigation";
import { useAuth } from "../../store/context/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Interface for PDF services definition
interface PdfService {
  id: string;
  name: string;
  amount: number;
  customImage?: string | null;
}

// Interface for previous PDF lookup requests
interface PdfRequestLog {
  id: string;
  serviceId: string;
  serviceName: string;
  details: string;
  amount: number;
  date: string;
  status: "In Process" | "Approved" | "Failed";
  pdfUrl?: string;
}

// List of all 8 PDF services with matching name, fee amounts as requested
const pdfServicesList: PdfService[] = [
  {
    id: "adhaar-to-pan",
    name: "Adhaar to Pan Number",
    amount: 12.0,
  },
  {
    id: "pan-to-details",
    name: "Pan to Pan Details",
    amount: 15.0,
  },
  {
    id: "dl-pdf",
    name: "Driving License PDF",
    amount: 10.0,
  },
  {
    id: "rc-pdf",
    name: "RC PDF",
    amount: 12.0,
  },
  {
    id: "adhaar-to-smartcard",
    name: "Adhaar to Smart Card Number Find",
    amount: 12.0,
  },
  {
    id: "adhaar-verification",
    name: "Adhaar Verification",
    amount: 20.0,
  },
  {
    id: "pan-to-gst",
    name: "Pan to GST Number Find",
    amount: 40.0,
  },
  {
    id: "eshram-pdf",
    name: "E-Shram PDF",
    amount: 40.0,
  },
];

export function PdfPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [servicesList, setServicesList] = useState<PdfService[]>(pdfServicesList);

  const [editingService, setEditingService] = useState<PdfService | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSaveService = (name: string, customImage: string | null, amount: number = 0) => {
    setServicesList((prev) =>
      prev.map((s) =>
        s.id === editingService?.id ? { ...s, name, customImage, amount: amount || s.amount } : s,
      ),
    );
    setEditModalOpen(false);
    setEditingService(null);
  };

  const handleAddService = (name: string, customImage: string | null, amount: number) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setServicesList((prev) => [
      ...prev,
      { id, name, customImage, amount },
    ]);
    setIsAddModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Are you sure you want to delete this PDF service?")) {
      setServicesList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Tab/Screen navigation states
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [activeListView, setActiveListView] = useState<string | null>(null); // To view the list for a specific service
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Initialize a mock request log tracking database
  const [requestLogs, setRequestLogs] = useState<PdfRequestLog[]>([
    {
      id: "REQ-PDF-8902",
      serviceId: "adhaar-to-pan",
      serviceName: "Adhaar to Pan Number",
      details: "Aadhaar: XXXXXXXX4012",
      amount: 12.0,
      date: "2026-05-26 12:45 PM",
      status: "Approved",
      pdfUrl: "#",
    },
    {
      id: "REQ-PDF-8903",
      serviceId: "dl-pdf",
      serviceName: "Driving License PDF",
      details: "DL No: TN0520210087192",
      amount: 10.0,
      date: "2026-05-26 02:15 PM",
      status: "In Process",
    },
    {
      id: "REQ-PDF-8904",
      serviceId: "rc-pdf",
      serviceName: "RC PDF",
      details: "Vehicle: TN-02-BZ-8821",
      amount: 12.0,
      date: "2026-05-25 09:30 AM",
      status: "Approved",
      pdfUrl: "#",
    },
  ]);

  // Helper render method for extremely crisp realistic graphic previews of the documents
  const renderDocumentPreview = (id: string) => {
    switch (id) {
      case "adhaar-to-pan":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            {/* Aadhaar representation */}
            <div className="absolute left-6 w-24 h-16 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rotate-[-6deg] shadow-md flex flex-col p-1.5 justify-between">
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-white to-green-500 rounded-sm" />
              <div className="flex gap-1 items-center">
                <div className="w-4 h-5 bg-slate-200 rounded-sm" />
                <div className="flex-1 space-y-1">
                  <div className="h-1 w-full bg-slate-350 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-3/4 bg-slate-350 dark:bg-slate-700 rounded-xs" />
                </div>
              </div>
              <div className="h-1 w-full bg-red-400/80 rounded-xs" />
            </div>
            {/* Transfer arrow */}
            <div className="absolute z-10 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#090d16] font-bold text-xs scale-105">
              →
            </div>
            {/* PAN representation */}
            <div className="absolute right-6 w-24 h-16 rounded-md bg-amber-600 border border-amber-700/50 rotate-[6deg] shadow-md flex flex-col p-1.5 justify-between text-[4px] text-white">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[5px]">
                  INCOME TAX DEPT
                </span>
                <div className="w-2 h-2 rounded-full bg-amber-400 opacity-80" />
              </div>
              <div className="w-3 h-3 bg-yellow-300 rounded-xs" />
              <div className="space-y-0.5 mt-1">
                <div className="h-1 w-full bg-amber-200/40 rounded-xs" />
                <div className="h-1 w-3/4 bg-amber-200/40 rounded-xs" />
              </div>
            </div>
          </div>
        );

      case "pan-to-details":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="w-36 h-22 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-650 shadow-lg flex flex-col p-2 justify-between">
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-1">
                <span className="text-[6px] font-black text-white uppercase tracking-wider">
                  PAN CARD DETAILS
                </span>
                <span className="text-[5px] text-amber-200">
                  Govt. of India
                </span>
              </div>
              <div className="flex gap-2 items-center my-1.5">
                <div className="w-7 h-9 rounded-sm bg-[#ffffffcc] border border-amber-700/20 p-0.5 flex flex-col items-center justify-between">
                  <div className="w-5 h-5 rounded-full bg-slate-350" />
                  <div className="h-1 w-5 bg-blue-900 rounded-xxs" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1 w-full bg-amber-100/60 rounded-xs" />
                  <div className="h-1 w-4/5 bg-amber-100/60 rounded-xs" />
                  <div className="h-1 w-3/4 bg-amber-100/60 rounded-xs" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-amber-900/40 rounded-xs" />
            </div>
          </div>
        );

      case "dl-pdf":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="w-36 h-22 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-900/30 shadow-lg flex flex-col p-2 justify-between">
              <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-900/40 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2 bg-blue-700 rounded-xxs" />
                  <span className="text-[5px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                    Driving Licence
                  </span>
                </div>
                <span className="text-[4px] text-slate-400">INDIA</span>
              </div>
              <div className="flex gap-2 items-center my-1">
                <div className="w-6 h-8 rounded-sm bg-slate-200 dark:bg-slate-800 p-0.5 flex flex-col items-center justify-between">
                  <div className="w-4 h-4 rounded-full bg-slate-350" />
                  <div className="h-1 w-4 bg-slate-400 rounded-xxs" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-1 w-full bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-2/3 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-sky-100 dark:bg-sky-900/20 rounded-xs" />
            </div>
          </div>
        );

      case "rc-pdf":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="w-36 h-22 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 shadow-lg flex flex-col p-2 justify-between">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-1">
                <span className="text-[5px] font-bold text-slate-600 dark:text-emerald-400 uppercase">
                  REGISTRATION CERTIFICATE
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-60" />
              </div>
              <div className="flex gap-1.5 items-center my-1">
                <div className="w-3.5 h-3.5 bg-yellow-400 rounded-sm flex items-center justify-center text-[5px] font-black text-emerald-950">
                  CHIP
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="h-1 w-full bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                </div>
              </div>
              <div className="h-2 w-full bg-emerald-600 text-[5px] font-extrabold text-white flex items-center justify-center rounded-xs select-none">
                RC NUMBER FIND
              </div>
            </div>
          </div>
        );

      case "adhaar-to-smartcard":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="absolute left-6 w-24 h-16 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-250 rotate-[-8deg] shadow-md flex flex-col p-1.5 justify-between">
              <div className="h-1 w-full bg-orange-400 rounded-xs" />
              <div className="h-1.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-xs" />
              <div className="h-1 w-full bg-green-500 rounded-xs" />
            </div>
            <div className="absolute z-10 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#090d16] font-bold text-xs scale-105">
              →
            </div>
            <div className="absolute right-6 w-24 h-16 rounded-md bg-emerald-600 border border-emerald-700/50 rotate-[8deg] shadow-md flex flex-col p-1.5 justify-between text-white text-[4px]">
              <div className="flex items-center justify-between border-b border-emerald-500 pb-0.5">
                <span className="font-extrabold">TAMIL NADU SMART CARD</span>
              </div>
              <div className="flex items-center gap-1 my-0.5">
                <div className="w-3 h-4 bg-slate-100 rounded-xs" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-0.5 w-full bg-emerald-200 rounded-xxs" />
                  <div className="h-0.5 w-3/4 bg-emerald-200 rounded-xxs" />
                </div>
              </div>
              <div className="h-1 w-full bg-emerald-800 rounded-xxs" />
            </div>
          </div>
        );

      case "adhaar-verification":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="relative w-36 h-22 rounded-lg bg-white dark:bg-[#0a0f18]/30 border border-slate-250 dark:border-slate-800 shadow-lg flex flex-col p-2 justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/40 pb-1">
                <span className="text-[5px] font-black text-slate-500 uppercase tracking-wider">
                  Aadhaar Validation
                </span>
                <ShieldCheck size={10} className="text-emerald-500" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1 py-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-550 mb-0.5 animate-pulse">
                  <CheckCircle2 size={16} className="stroke-[2.5]" />
                </span>
                <span className="text-[5px] font-black text-emerald-500 uppercase select-none">
                  Verify Active Status
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-xs" />
            </div>
          </div>
        );

      case "pan-to-gst":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="absolute left-6 w-24 h-16 rounded-md bg-amber-600 rotate-[-8deg] shadow-md flex flex-col p-1.5 justify-between">
              <div className="h-1 w-full bg-amber-900/30 rounded-xs" />
              <div className="h-2 w-3 text-white font-extrabold text-[4px]">
                PAN
              </div>
              <div className="h-1 w-full bg-amber-400 rounded-xs" />
            </div>
            <div className="absolute z-10 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-[#090d16] font-bold text-xs scale-105">
              →
            </div>
            <div className="absolute right-6 w-24 h-16 rounded-md bg-blue-900 border border-blue-950 rotate-[8deg] shadow-md flex flex-col p-1.5 justify-between text-white text-[4px]">
              <div className="flex items-center justify-between border-b border-blue-800 pb-0.5">
                <span className="font-extrabold">GSTIN REGISTER</span>
              </div>
              <div className="h-1 w-full bg-blue-850 rounded-xxs" />
              <span className="font-bold text-[5px] text-blue-300">
                TAX PAYER
              </span>
              <div className="h-1 w-full bg-blue-800 rounded-xxs" />
            </div>
          </div>
        );

      case "eshram-pdf":
        return (
          <div className="relative w-full h-36 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center overflow-hidden">
            <div className="w-36 h-22 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/20 dark:to-amber-900/10 border border-yellow-250/60 shadow-lg flex flex-col p-2 justify-between">
              <div className="flex items-center justify-between border-b border-yellow-200 dark:border-yellow-900/40 pb-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-[5px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                    E-SHRAM CARD
                  </span>
                </div>
                <span className="text-[4px] text-amber-700">
                  NATIONAL DATABASE
                </span>
              </div>
              <div className="flex gap-2 items-center my-1">
                <div className="w-6 h-8 rounded-sm bg-amber-50 dark:bg-amber-900/20 p-0.5 flex flex-col items-center justify-between border border-yellow-300/30">
                  <div className="w-4 h-4 rounded-full bg-slate-350" />
                  <div className="h-1 w-4 bg-amber-800/40 rounded-xxs" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="h-1 w-full bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                  <div className="h-1 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-xs" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-white to-green-500 rounded-xs" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "aadhaarNo") {
          rule = {
            required: true,
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a valid 12-digit Aadhaar",
          };
        } else if (name === "panNo") {
          rule = {
            required: true,
            pattern: PATTERNS.PAN,
            patternMessage: "Must be a valid 10-char PAN",
          };
        } else if (name === "dlNo") {
          rule = {
            required: true,
            minLength: 10,
            patternMessage: "Must be a valid DL number",
          };
        } else if (name === "mobileNo") {
          rule = {
            required: true,
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit mobile",
          };
        }

        const errorMsg = validateField(name, value, rule, updated);
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          if (errorMsg) {
            next[name] = errorMsg;
          } else {
            delete next[name];
          }
          return next;
        });
      }
      return updated;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent, service: PdfService) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Custom form validations depending on which service is active
    if (service.id === "adhaar-to-pan") {
      const aErr = validateField(
        "aadhaarNo",
        formData.aadhaarNo,
        {
          required: true,
          requiredMessage: "Aadhaar number is required",
          pattern: PATTERNS.AADHAAR,
          patternMessage: "Must be a valid 12-digit Aadhaar number",
        },
        formData,
      );
      if (aErr) newErrors.aadhaarNo = aErr;
    } else if (service.id === "pan-to-details") {
      const pErr = validateField(
        "panNo",
        formData.panNo,
        {
          required: true,
          requiredMessage: "PAN number is required",
          pattern: PATTERNS.PAN,
          patternMessage: "Must be a valid 10-character PAN number",
        },
        formData,
      );
      if (pErr) newErrors.panNo = pErr;
    } else if (service.id === "dl-pdf") {
      const dErr = validateField(
        "dlNo",
        formData.dlNo,
        {
          required: true,
          requiredMessage: "DL number is required",
          minLength: 10,
          minLengthMessage: "Driving License number is too short",
        },
        formData,
      );
      if (dErr) newErrors.dlNo = dErr;
    } else if (service.id === "rc-pdf") {
      const rErr = validateField(
        "regNo",
        formData.regNo,
        {
          required: true,
          requiredMessage: "Vehicle registration number is required",
        },
        formData,
      );
      if (rErr) newErrors.regNo = rErr;
    } else if (service.id === "adhaar-to-smartcard") {
      const aErr = validateField(
        "aadhaarNo",
        formData.aadhaarNo,
        {
          required: true,
          requiredMessage: "Aadhaar number is required",
          pattern: PATTERNS.AADHAAR,
        },
        formData,
      );
      if (aErr) newErrors.aadhaarNo = aErr;
    } else if (service.id === "adhaar-verification") {
      const aErr = validateField(
        "aadhaarNo",
        formData.aadhaarNo,
        {
          required: true,
          requiredMessage: "Aadhaar number is required",
          pattern: PATTERNS.AADHAAR,
        },
        formData,
      );
      if (aErr) newErrors.aadhaarNo = aErr;

      const cErr = validateField(
        "captcha",
        formData.captcha,
        {
          required: true,
          requiredMessage: "Captcha is required",
        },
        formData,
      );
      if (cErr) newErrors.captcha = cErr;
    } else if (service.id === "pan-to-gst") {
      const pErr = validateField(
        "panNo",
        formData.panNo,
        {
          required: true,
          requiredMessage: "PAN number is required",
          pattern: PATTERNS.PAN,
        },
        formData,
      );
      if (pErr) newErrors.panNo = pErr;
    } else if (service.id === "eshram-pdf") {
      const aErr = validateField(
        "aadhaarNo",
        formData.aadhaarNo,
        {
          required: true,
          requiredMessage: "Aadhaar number is required",
          pattern: PATTERNS.AADHAAR,
          patternMessage: "Must be a valid 12-digit Aadhaar number",
        },
        formData,
      );
      if (aErr) newErrors.aadhaarNo = aErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    if (user && service) {
      try {
        const payload = new FormData();
        payload.append("retailerId", user.id);
        payload.append("retailerName", user.name || "Unknown");
        payload.append("retailerMobile", user.phone || "");
        payload.append("serviceId", service.id);
        payload.append("serviceName", service.name);
        payload.append("cost", String(service.amount || 0));
        payload.append("customerWhatsApp", formData.mobileNo || formData.mobile || "");
        payload.append("walletType", user.role === "distributor" ? "Distributor" : "Retailer");
        payload.append("formData", JSON.stringify(formData));

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
        const res = await fetch(`${apiUrl}/api/services/request`, {
          method: "POST",
          body: payload,
        });

        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           alert(errData.error || "Failed to submit request");
           setIsSubmitting(false);
           return;
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to backend");
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    setSubmissionSuccess(true);

    // Construct look up info summary
    let infoSummary = "";
    if (formData.aadhaarNo)
      infoSummary = `Aadhaar: XXXXXXXX${formData.aadhaarNo.slice(-4)}`;
    else if (formData.panNo)
      infoSummary = `PAN: XXXXX${formData.panNo.slice(-5)}`;
    else if (formData.dlNo) infoSummary = `DL No: ${formData.dlNo}`;
    else if (formData.regNo) infoSummary = `Vehicle: ${formData.regNo}`;
    else if (formData.uanNo)
      infoSummary = `UAN: XXXXXXXX${formData.uanNo.slice(-4)}`;

    // Save a new record in our mock requests log database
    const newRequest: PdfRequestLog = {
      id: `REQ-PDF-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id,
      serviceName: service.name,
      details: infoSummary || "Request registered",
      amount: service.amount,
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "In Process",
    };

    setRequestLogs((prev) => [newRequest, ...prev]);

    setTimeout(() => {
      setSubmissionSuccess(false);
      setActiveForm(null);
      setFormData({});
    }, 2500);
  };

  const getBreadcrumbLabel = () => {
    if (activeForm) {
      const s = servicesList.find((item) => item.id === activeForm);
      return s ? s.name : "";
    }
    if (activeListView) {
      const s = servicesList.find((item) => item.id === activeListView);
      return s ? `${s.name} (History)` : "";
    }
    return "";
  };

  const activeServiceObj = useMemo(() => {
    return servicesList.find((item) => item.id === activeForm) || null;
  }, [activeForm, servicesList]);

  // Filter transaction log ledger depending on list selection
  const filteredLogs = useMemo(() => {
    if (!activeListView) return requestLogs;
    return requestLogs.filter((log) => log.serviceId === activeListView);
  }, [activeListView, requestLogs]);

  return (
    <AppShell activePage="PDF Services">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Mock Address Bar */}
        <ServiceNavigation
          pageName="PDF Services"
          activeForm={activeForm || activeListView}
          setActiveForm={(val) => {
            setActiveForm(val);
            setActiveListView(val);
          }}
          activeFormLabel={getBreadcrumbLabel() || undefined}
          backButtonText="Back"
        />

        {/* CONDITIONALLY RENDER: CARDS GRID, FORM SUBMISSION, OR HISTORY LIST LEDGER */}
        {!activeForm && !activeListView ? (
          /* RENDER DIRECTORY CARDS GRID */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Print & Verification Service Directory
                </h3>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Plus size={14} />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicesList.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800/80 transition-all flex flex-col group relative"
                >
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingService(service);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-400 hover:text-[#005c3a] dark:hover:text-emerald-400 transition-all active:scale-[0.95]"
                        title="Edit card details"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service.id);
                        }}
                        className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-150 dark:border-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all active:scale-[0.95]"
                        title="Delete card"
                      >
                        <Trash size={11} />
                      </button>
                    </div>
                  )}

                  {/* Card realistic image preview */}
                  {service.customImage ? (
                    <div className="relative w-full h-36 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={service.customImage}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    renderDocumentPreview(service.id)
                  )}

                  {/* Card Title & Content */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-emerald-555 group-hover:text-emerald-650 transition-colors capitalize line-clamp-1 leading-snug">
                        {service.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                        <span>Amount:</span>
                        <span>₹ {service.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Bottom interactive buttons matching layout exactly */}
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                      <button
                        onClick={() => {
                          setFormData({});
                          setErrors({});
                          setSubmissionSuccess(false);
                          setActiveForm(service.id);
                        }}
                        className="flex items-center justify-center h-9 rounded-xl border border-slate-250 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.98] transition-all select-none"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setActiveListView(service.id)}
                        className="flex items-center justify-center h-9 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all select-none"
                      >
                        List
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeForm && activeServiceObj ? (
          /* RENDER CUSTOM APPLY FORM INLINE */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {submissionSuccess ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Search Request Submitted!
                    </h5>
                    <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
                      Your search request for{" "}
                      <span className="text-[#005c3a] dark:text-emerald-400 font-extrabold capitalize">
                        &quot;{activeServiceObj.name}&quot;
                      </span>{" "}
                      has been registered. The generated document will appear in
                      your ledger shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleFormSubmit(e, activeServiceObj)}
                  className="space-y-8 w-full"
                >
                  {/* Form Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                        {activeServiceObj.name}
                      </h2>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                        Submit candidate credentials to extract and print
                        verified PDF records.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none flex items-center gap-1.5">
                      <CreditCard size={13} className="text-emerald-500" />
                      <span>
                        Service Charge : ₹ {activeServiceObj.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Form Fields depend on service ID */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Aadhaar to PAN Form */}
                      {activeServiceObj.id === "adhaar-to-pan" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="aadhaarNo"
                              label="Aadhaar Card Number"
                              type="text"
                              placeholder="Enter 12-digit Aadhaar number"
                              value={formData.aadhaarNo || ""}
                              onChange={(val) =>
                                handleFieldChange("aadhaarNo", val)
                              }
                              error={errors.aadhaarNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* PAN to PAN Details Form */}
                      {activeServiceObj.id === "pan-to-details" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="panNo"
                              label="Permanent Account Number (PAN)"
                              type="text"
                              placeholder="Enter 10-char PAN number"
                              value={formData.panNo || ""}
                              onChange={(val) =>
                                handleFieldChange("panNo", val)
                              }
                              error={errors.panNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* Driving License PDF Form */}
                      {activeServiceObj.id === "dl-pdf" && (
                        <>
                          <div>
                            <InputField
                              name="dlNo"
                              label="Driving License Number"
                              type="text"
                              placeholder="Enter DL number (e.g. TN0520210087192)"
                              value={formData.dlNo || ""}
                              onChange={(val) => handleFieldChange("dlNo", val)}
                              error={errors.dlNo}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <InputField
                              name="dob"
                              label="Date of Birth"
                              type="text"
                              placeholder="DD-MM-YYYY"
                              value={formData.dob || ""}
                              onChange={(val) => handleFieldChange("dob", val)}
                              error={errors.dob}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* RC PDF Form */}
                      {activeServiceObj.id === "rc-pdf" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="regNo"
                              label="Vehicle Registration Number"
                              type="text"
                              placeholder="E.g. TN02BZ8821"
                              value={formData.regNo || ""}
                              onChange={(val) =>
                                handleFieldChange("regNo", val)
                              }
                              error={errors.regNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* Aadhaar to Smart Card Find Form */}
                      {activeServiceObj.id === "adhaar-to-smartcard" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="aadhaarNo"
                              label="Aadhaar Card Number"
                              type="text"
                              placeholder="Enter 12-digit Aadhaar number"
                              value={formData.aadhaarNo || ""}
                              onChange={(val) =>
                                handleFieldChange("aadhaarNo", val)
                              }
                              error={errors.aadhaarNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* Aadhaar Verification Form */}
                      {activeServiceObj.id === "adhaar-verification" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="aadhaarNo"
                              label="Aadhaar Number to Verify"
                              type="text"
                              placeholder="Enter 12-digit Aadhaar number"
                              value={formData.aadhaarNo || ""}
                              onChange={(val) =>
                                handleFieldChange("aadhaarNo", val)
                              }
                              error={errors.aadhaarNo}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="flex items-end gap-3 md:col-span-2">
                            <div className="flex-1">
                              <InputField
                                name="captcha"
                                label="Enter Captcha"
                                type="text"
                                placeholder="Enter captcha code"
                                value={formData.captcha || ""}
                                onChange={(val) =>
                                  handleFieldChange("captcha", val)
                                }
                                error={errors.captcha}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="flex items-center justify-center h-11 px-6 bg-slate-50 dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 rounded-xl font-black tracking-widest text-slate-600 dark:text-slate-400 select-none line-through decoration-double decoration-rose-500 text-base italic shadow-inner">
                              7Yd8w
                            </div>
                          </div>
                        </>
                      )}

                      {/* PAN to GST Number Find Form */}
                      {activeServiceObj.id === "pan-to-gst" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="panNo"
                              label="Business PAN Card Number"
                              type="text"
                              placeholder="Enter 10-char PAN"
                              value={formData.panNo || ""}
                              onChange={(val) =>
                                handleFieldChange("panNo", val)
                              }
                              error={errors.panNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* E-Shram PDF Form */}
                      {activeServiceObj.id === "eshram-pdf" && (
                        <>
                          <div className="md:col-span-2">
                            <InputField
                              name="aadhaarNo"
                              label="Aadhaar Card Number"
                              type="text"
                              placeholder="Enter 12-digit Aadhaar number"
                              value={formData.aadhaarNo || ""}
                              onChange={(val) =>
                                handleFieldChange("aadhaarNo", val)
                              }
                              error={errors.aadhaarNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
                    >
                      Cancel
                    </button>
                    <SubmitButton
                      text="Submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* RENDER DETAILED LIST/TRANSACTIONS LEDGER */
          <div className="space-y-6">
            {/* Header metadata summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                  {servicesList.find((x) => x.id === activeListView)?.name}{" "}
                  Search Logs
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                  Review generated documents and real-time validation lookup
                  statuses.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({});
                  setErrors({});
                  setSubmissionSuccess(false);
                  setActiveForm(activeListView);
                  setActiveListView(null);
                }}
                className="flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all self-start sm:self-auto select-none"
              >
                <Plus size={14} />
                <span>Place New Request</span>
              </button>
            </div>

            {/* Table ledger containing previous searches */}
            <div className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl overflow-hidden shadow-sm">
              {filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-900/60 bg-slate-50/50 dark:bg-slate-950/20">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Candidate Details
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Charge Paid
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Date Requested
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
                      {filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/20 dark:hover:bg-slate-950/10 transition-colors"
                        >
                          <td className="px-6 py-4 text-xs font-black text-slate-800 dark:text-white">
                            {log.id}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-350">
                            {log.details}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-650 dark:text-slate-350">
                            ₹ {log.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                            {log.date}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                log.status === "Approved"
                                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400"
                                  : log.status === "In Process"
                                    ? "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400"
                                    : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450"
                              }`}
                            >
                              <span
                                className={`h-1 w-1 rounded-full ${
                                  log.status === "Approved"
                                    ? "bg-[#005c3a]"
                                    : log.status === "In Process"
                                      ? "bg-sky-500"
                                      : "bg-rose-500"
                                }`}
                              />
                              <span>{log.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {log.status === "Approved" ? (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(
                                    `Downloading simulated PDF document for request: ${log.id}`,
                                  );
                                }}
                                className="inline-flex items-center gap-1 text-xs font-black text-emerald-555 hover:text-emerald-650 transition-colors"
                              >
                                <Download size={13} />
                                <span>Download PDF</span>
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400 dark:text-slate-600 italic select-none">
                                Under Verification
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <AlertCircle
                    size={28}
                    className="text-slate-300 dark:text-slate-700 mb-2"
                  />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-555">
                    No lookup records found.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* EDIT SERVICE DETAILS MODAL */}
      {editModalOpen && editingService && (
        <EditServiceModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingService(null);
          }}
          service={editingService}
          onSave={handleSaveService}
        />
      )}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddService}
      />
    </AppShell>
  );
}

type EditServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: PdfService;
  onSave: (name: string, customImage: string | null, amount: number) => void;
};

function EditServiceModal({
  isOpen,
  onClose,
  service,
  onSave,
}: EditServiceModalProps) {
  const [name, setName] = useState(service.name);
  const [amount, setAmount] = useState(service.amount || 0);
  const [customImage, setCustomImage] = useState<string | null>(
    service.customImage || null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    onSave(name, customImage, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Edit Card Details
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Service Image / Icon
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {customImage ? (
                  <img
                    src={customImage}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-[10px] font-bold text-slate-350">
                    Default
                  </div>
                )}
              </div>
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                <Upload size={16} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, customImage: string | null, amount: number) => void;
};

function AddServiceModal({
  isOpen,
  onClose,
  onSave,
}: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    if (!name.trim()) return;
    onSave(name, customImage, amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Add PDF Service
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
              placeholder="e.g. New PDF Extract"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Service Image / Icon
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {customImage ? (
                  <img
                    src={customImage}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="text-[10px] font-bold text-slate-350">
                    Default
                  </div>
                )}
              </div>
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                <Upload size={16} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
          >
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
}
