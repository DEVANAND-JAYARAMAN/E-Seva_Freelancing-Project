"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { CmHealthCardForm } from "./CmHealthCardForm";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { ServiceCard } from "../ServiceCard";
import { PATHS } from "../../../routes/paths";

interface HealthService {
  id: string;
  name: string;
}

export function CmHealthCardPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read pricing matrix from localStorage
  const [pricingConfig] = useLocalStorage<Record<string, any[]>>(
    "thuruvan_service_pricing_matrix_v2",
    {},
  );

  const servicesList: HealthService[] = [
    { id: "cm-health-card", name: "CM Health Card" },
  ];

  // Helper to resolve dynamic price from admin pricing matrix
  const getServicePrice = () => {
    const list = pricingConfig["cm-health-card"];
    if (list && Array.isArray(list)) {
      const match = list.find((item) => item.id === "cm-main");
      if (match && match.retailerPrice !== undefined) {
        return Number(match.retailerPrice);
      }
    }
    return 200.0; // Default price
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
          <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#4D7C0F" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="#F0FDF4"
          stroke="url(#healthGrad)"
          strokeWidth="2.5"
        />
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="#FEF08A"
          stroke="#CA8A04"
          strokeWidth="1"
          strokeDasharray="2 1"
        />
        <circle cx="27" cy="26" r="3.5" fill="#15803D" />
        <circle cx="37" cy="26" r="3.5" fill="#15803D" />
        <circle cx="32" cy="35" r="2.5" fill="#15803D" />
        <path
          d="M22 36C22 32 26 31 27 31C28 31 32 32 32 36H22Z"
          fill="#15803D"
        />
        <path
          d="M32 36C32 32 36 31 37 31C38 31 42 32 42 36H32Z"
          fill="#15803D"
        />
        <path
          d="M29 41C29 39 31 38.5 32 38.5C33 38.5 35 39 35 41H29Z"
          fill="#15803D"
        />
        <path d="M16 28C14 26 14 22 16 20C18 22 18 26 16 28Z" fill="#4D7C0F" />
        <path d="M48 28C50 26 50 22 48 20C46 22 46 26 48 28Z" fill="#4D7C0F" />
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
              className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span
              onClick={() => setActiveForm(null)}
              className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              CM Health Card
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  CM Health Card
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {servicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon("w-16 h-16")}
                  onClick={() => setActiveForm("cm-health-card")}
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
                      Your application for the **CM Health Card** has been
                      registered successfully.
                    </p>
                  </div>
                </div>
              ) : (
                <CmHealthCardForm
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
