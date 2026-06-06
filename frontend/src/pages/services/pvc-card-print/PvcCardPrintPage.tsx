"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PvcCardPrintForm } from "./PvcCardPrintForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { ServiceCard } from "../ServiceCard";
import { PATHS } from "../../../routes/paths";

interface PvcService {
  id: string;
  name: string;
}

export function PvcCardPrintPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read pricing matrix from localStorage
  const [pricingConfig] = useLocalStorage<Record<string, any[]>>(
    "thuruvan_service_pricing_matrix_v2",
    {},
  );

  const servicesList: PvcService[] = [
    { id: "pvc-card-print", name: "PVC CARD PRINT(ALL TYPE)" },
  ];

  // Helper to resolve dynamic price from admin pricing matrix
  const getServicePrice = () => {
    const list = pricingConfig["pvc-card-print"];
    if (list && Array.isArray(list)) {
      const match = list.find((item) => item.id === "pvc-main");
      if (match && match.retailerPrice !== undefined) {
        return Number(match.retailerPrice);
      }
    }
    return 160.0; // Default price
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

  const renderServiceIcon = (id: string, className = "w-16 h-16") => {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pvcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="18"
          width="40"
          height="26"
          rx="3"
          fill="#FEF3C7"
          stroke="#B45309"
          strokeWidth="1"
          transform="rotate(-8 34 31)"
        />
        <rect
          x="10"
          y="22"
          width="40"
          height="26"
          rx="3"
          fill="white"
          stroke="#D97706"
          strokeWidth="1.2"
        />
        <rect x="11.2" y="23.2" width="37.6" height="3" fill="#F59E0B" />
        <rect x="14" y="29" width="8" height="10" rx="0.5" fill="#FEF3C7" />
        <rect x="25" y="29" width="20" height="1.5" rx="0.5" fill="#E5E7EB" />
        <rect x="25" y="32" width="16" height="1.5" rx="0.5" fill="#E5E7EB" />
        <rect x="25" y="35" width="22" height="1.5" rx="0.5" fill="#E5E7EB" />
        <text
          x="30"
          y="44"
          fill="#B45309"
          fontSize="4.5"
          fontWeight="black"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          PVC CARD
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
            <span
              onClick={() => {
                setActiveForm(null);
                router.push(PATHS.SERVICES);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span
              onClick={() => setActiveForm(null)}
              className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              PVC Card Print
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  {activeForm}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (activeForm) {
                  setActiveForm(null);
                } else {
                  router.push(PATHS.SERVICES);
                }
              }}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-750 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>
                {activeForm ? "Back to Sub-Services" : "Back to Services"}
              </span>
            </button>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => setActiveForm(service.name)}
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
                      Order Submitted Successfully!
                    </h5>
                    <p className="text-sm text-slate-450 dark:text-slate-550 mt-2 max-w-md leading-relaxed">
                      Your high-quality PVC Smart Card order has been placed
                      successfully.
                    </p>
                  </div>
                </div>
              ) : (
                <PvcCardPrintForm
                  cardType={activeForm}
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
