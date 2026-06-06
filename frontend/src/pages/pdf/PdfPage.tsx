"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { PATHS } from "../../routes/paths";
import { InputField, SubmitButton } from "../services/form/FormFields";
import { validateField, PATTERNS } from "../services/form/validators";

// Interface for PDF services definition
interface PdfService {
  id: string;
  name: string;
  amount: number;
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
    name: "adhaar to pan number",
    amount: 12.0,
  },
  {
    id: "pan-to-details",
    name: "pan to pan details",
    amount: 10.0,
  },
  {
    id: "dl-pdf",
    name: "driving license pdf",
    amount: 10.0,
  },
  {
    id: "rc-pdf",
    name: "rc pdf",
    amount: 12.0,
  },
  {
    id: "adhaar-to-smartcard",
    name: "adhaar to smart card number find",
    amount: 12.0,
  },
];

export function PdfPage() {
  const router = useRouter();

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
      serviceName: "adhaar to pan number",
      details: "Aadhaar: XXXXXXXX4012",
      amount: 12.0,
      date: "2026-05-26 12:45 PM",
      status: "Approved",
      pdfUrl: "#",
    },
    {
      id: "REQ-PDF-8903",
      serviceId: "dl-pdf",
      serviceName: "driving license pdf",
      details: "DL No: TN0520210087192",
      amount: 10.0,
      date: "2026-05-26 02:15 PM",
      status: "In Process",
    },
    {
      id: "REQ-PDF-8904",
      serviceId: "rc-pdf",
      serviceName: "rc pdf",
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

  const handleFormSubmit = (e: React.FormEvent, service: PdfService) => {
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
      const uErr = validateField(
        "uanNo",
        formData.uanNo,
        {
          required: true,
          requiredMessage: "UAN / E-Shram Card Number is required",
        },
        formData,
      );
      if (uErr) newErrors.uanNo = uErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
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
    }, 1500);
  };

  const getBreadcrumbLabel = () => {
    if (activeForm) {
      const s = pdfServicesList.find((item) => item.id === activeForm);
      return s ? s.name : "";
    }
    if (activeListView) {
      const s = pdfServicesList.find((item) => item.id === activeListView);
      return s ? `${s.name} (History)` : "";
    }
    return "";
  };

  const activeServiceObj = useMemo(() => {
    return pdfServicesList.find((item) => item.id === activeForm) || null;
  }, [activeForm]);

  // Filter transaction log ledger depending on list selection
  const filteredLogs = useMemo(() => {
    if (!activeListView) return requestLogs;
    return requestLogs.filter((log) => log.serviceId === activeListView);
  }, [activeListView, requestLogs]);

  return (
    <AppShell activePage="PDF Services">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Mock Address Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <span
              onClick={() => {
                setActiveForm(null);
                setActiveListView(null);
                router.push(PATHS.SERVICES);
              }}
              className="text-slate-400 dark:text-slate-550 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span
              onClick={() => {
                setActiveForm(null);
                setActiveListView(null);
              }}
              className="text-[#005c3a] dark:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              PDF Services
            </span>
            {(activeForm || activeListView) && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider max-w-[200px] truncate">
                  {getBreadcrumbLabel()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (activeForm || activeListView) {
                  setActiveForm(null);
                  setActiveListView(null);
                } else {
                  router.push(PATHS.SERVICES);
                }
              }}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>
                {activeForm || activeListView
                  ? "Back to Directory"
                  : "Back to Services"}
              </span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER: CARDS GRID, FORM SUBMISSION, OR HISTORY LIST LEDGER */}
        {!activeForm && !activeListView ? (
          /* RENDER DIRECTORY CARDS GRID */
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Print & Verification Service Directory
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pdfServicesList.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800/80 transition-all flex flex-col group"
                >
                  {/* Card realistic image preview */}
                  {renderDocumentPreview(service.id)}

                  {/* Card Title & Content */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-emerald-555 group-hover:text-emerald-650 transition-colors lowercase line-clamp-1 leading-snug">
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
                      <span className="text-[#005c3a] dark:text-emerald-400 font-extrabold lowercase">
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
                          <div>
                            <InputField
                              name="applicantName"
                              label="Applicant Name"
                              type="text"
                              placeholder="Name exactly as printed on Aadhaar"
                              value={formData.applicantName || ""}
                              onChange={(val) =>
                                handleFieldChange("applicantName", val)
                              }
                              error={errors.applicantName}
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
                          <div className="md:col-span-2">
                            <InputField
                              name="applicantName"
                              label="Holder Full Name"
                              type="text"
                              placeholder="Enter holder full name"
                              value={formData.applicantName || ""}
                              onChange={(val) =>
                                handleFieldChange("applicantName", val)
                              }
                              error={errors.applicantName}
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
                          <div>
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
                          <div>
                            <InputField
                              name="chassisNo"
                              label="Chassis Number"
                              type="text"
                              placeholder="Enter last 5 digits of Chassis No"
                              value={formData.chassisNo || ""}
                              onChange={(val) =>
                                handleFieldChange("chassisNo", val)
                              }
                              error={errors.chassisNo}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <InputField
                              name="engineNo"
                              label="Engine Number"
                              type="text"
                              placeholder="Enter last 5 digits of Engine No"
                              value={formData.engineNo || ""}
                              onChange={(val) =>
                                handleFieldChange("engineNo", val)
                              }
                              error={errors.engineNo}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* Aadhaar to Smart Card Find Form */}
                      {activeServiceObj.id === "adhaar-to-smartcard" && (
                        <>
                          <div>
                            <InputField
                              name="aadhaarNo"
                              label="Aadhaar Number (Head of Family)"
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
                          <div>
                            <InputField
                              name="mobileNo"
                              label="Registered Mobile Number"
                              type="text"
                              placeholder="Enter registered mobile number"
                              value={formData.mobileNo || ""}
                              onChange={(val) =>
                                handleFieldChange("mobileNo", val)
                              }
                              error={errors.mobileNo}
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
                        </>
                      )}

                      {/* PAN to GST Number Find Form */}
                      {activeServiceObj.id === "pan-to-gst" && (
                        <>
                          <div>
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
                          <div>
                            <InputField
                              name="tradeName"
                              label="Trade / Business Name (Optional)"
                              type="text"
                              placeholder="Enter trade name"
                              value={formData.tradeName || ""}
                              onChange={(val) =>
                                handleFieldChange("tradeName", val)
                              }
                              error={errors.tradeName}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* E-Shram PDF Form */}
                      {activeServiceObj.id === "eshram-pdf" && (
                        <>
                          <div>
                            <InputField
                              name="uanNo"
                              label="Universal Account Number (UAN)"
                              type="text"
                              placeholder="Enter UAN / E-Shram No"
                              value={formData.uanNo || ""}
                              onChange={(val) =>
                                handleFieldChange("uanNo", val)
                              }
                              error={errors.uanNo}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div>
                            <InputField
                              name="mobileNo"
                              label="Linked Mobile Number"
                              type="text"
                              placeholder="Enter mobile number"
                              value={formData.mobileNo || ""}
                              onChange={(val) =>
                                handleFieldChange("mobileNo", val)
                              }
                              error={errors.mobileNo}
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
                      text={`Pay & Find details`}
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
                  {pdfServicesList.find((x) => x.id === activeListView)?.name}{" "}
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
    </AppShell>
  );
}
