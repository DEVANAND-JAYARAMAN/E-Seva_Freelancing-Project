"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { AgriStackPdfForm } from "./AgriStackPdfForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { ServiceCard } from "../ServiceCard";
import { PATHS } from "../../../routes/paths";

interface AgriService {
  id: string;
  name: string;
}

export function AgriStackPdfPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read pricing matrix from localStorage
  const [pricingConfig] = useLocalStorage<Record<string, any[]>>(
    "thuruvan_service_pricing_matrix_v2",
    {},
  );

  const servicesList: AgriService[] = [
    {
      id: "agri-stack-pdf",
      name: "Agri Stack PDF",
    },
  ];

  // Helper to resolve dynamic price from admin pricing matrix
  const getServicePrice = () => {
    const list = pricingConfig["agri-stack-pdf"];
    if (list && Array.isArray(list)) {
      const match = list.find((item) => item.id === "agri-main");
      if (match && match.retailerPrice !== undefined) {
        return Number(match.retailerPrice);
      }
    }
    return 35.0; // Default price
  };

  const handleFormSubmit = (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        setActiveForm(null);
        router.push(PATHS.SERVICES);
      }, 3000);
    }, 1500);
  };

  const renderServiceIcon = (className = "w-16 h-16") => {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="agriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="12"
          width="56"
          height="40"
          rx="4"
          fill="#F0FDF4"
          stroke="url(#agriGrad)"
          strokeWidth="1.5"
        />
        <rect x="4" y="12" width="56" height="6" fill="url(#agriGrad)" />
        <text
          x="32"
          y="16.5"
          fill="white"
          fontSize="4.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          Agri Stack
        </text>
        <rect
          x="8"
          y="22"
          width="12"
          height="15"
          rx="1"
          fill="#E8F5E9"
          stroke="#81C784"
          strokeWidth="0.5"
        />
        <circle cx="14" cy="27" r="2.5" fill="#2E7D32" />
        <path
          d="M9.5 35C9.5 32.5 12 32.5 14 33.5C16 32.5 18.5 32.5 18.5 35H9.5Z"
          fill="#2E7D32"
        />
        <rect x="24" y="22" width="22" height="2" rx="0.5" fill="#C8E6C9" />
        <rect x="24" y="26" width="18" height="2" rx="0.5" fill="#C8E6C9" />
        <rect x="24" y="30" width="30" height="2" rx="0.5" fill="#C8E6C9" />
        <rect x="24" y="34" width="26" height="2" rx="0.5" fill="#C8E6C9" />
        <rect x="4" y="44" width="56" height="8" rx="1" fill="#2E7D32" />
        <text
          x="32"
          y="50"
          fill="white"
          fontSize="4.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          FARMER ID
        </text>
      </svg>
    );
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <Link
              href={PATHS.SERVICES}
              onClick={() => setActiveForm(null)}
              className="text-slate-400 dark:text-slate-500 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </Link>
            <span className="text-slate-350 select-none">/</span>
            <span
              onClick={() => setActiveForm(null)}
              className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Agri Stack PDF
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  Agri Stack PDF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {activeForm ? (
              <button
                onClick={() => setActiveForm(null)}
                className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-750 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back to Sub-Services</span>
              </button>
            ) : (
              <Link
                href={PATHS.SERVICES}
                className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-750 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back to Services</span>
              </Link>
            )}
          </div>
        </div>

        {!activeForm ? (
          /* APPLY SERVICE SECTION WITH CARDS */
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                Apply Service
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {servicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon("w-16 h-16")}
                  onClick={() => setActiveForm("agri-stack-pdf")}
                />
              ))}
            </div>
          </div>
        ) : (
          /* FORM SECTION */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {submissionSuccess ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Registration Submitted Successfully!
                    </h5>
                    <p className="text-sm text-slate-450 dark:text-slate-550 mt-2 max-w-md leading-relaxed">
                      Your application for the **Agri Stack PDF / Farmer ID
                      Card** has been registered successfully.
                    </p>
                  </div>
                </div>
              ) : (
                <AgriStackPdfForm
                  price={getServicePrice()}
                  onCancel={() => setActiveForm(null)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
