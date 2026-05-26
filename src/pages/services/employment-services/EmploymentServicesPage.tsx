"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { LapsedRegistrationRenewal } from "./LapsedRegistrationRenewal";
import { ServiceCard } from "../ServiceCard";

interface EmploymentService {
  id: string;
  name: string;
}

export function EmploymentServicesPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null); // "lapsed-renewal" | null
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employmentServicesList: EmploymentService[] = [
    {
      id: "lapsed-renewal",
      name: "Lapsed Registration Renewal",
    },
  ];

  const handleCardClick = (service: EmploymentService) => {
    setSubmissionSuccess(false);
    if (service.id === "lapsed-renewal") {
      setActiveForm("lapsed-renewal");
    }
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    switch (id) {
      case "lapsed-renewal":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lapsedBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>
            {/* White Rounded Card background */}
            <rect x="4" y="4" width="56" height="56" rx="10" fill="url(#lapsedBgGrad)" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Calendar Icon body */}
            <rect x="16" y="14" width="32" height="32" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
            {/* Calendar ring binders */}
            <rect x="22" y="10" width="4" height="8" rx="2" fill="#334155" />
            <rect x="38" y="10" width="4" height="8" rx="2" fill="#334155" />
            {/* Calendar grid representation */}
            <line x1="16" y1="24" x2="48" y2="24" stroke="#334155" strokeWidth="2" />
            
            {/* Tiny grid squares inside calendar */}
            <rect x="21" y="28" width="4" height="3" rx="0.5" fill="#64748b" />
            <rect x="29" y="28" width="4" height="3" rx="0.5" fill="#64748b" />
            <rect x="37" y="28" width="4" height="3" rx="0.5" fill="#64748b" />
            <rect x="21" y="35" width="4" height="3" rx="0.5" fill="#64748b" />
            <rect x="29" y="35" width="4" height="3" rx="0.5" fill="#64748b" />
            <rect x="37" y="35" width="4" height="3" rx="0.5" fill="#64748b" />

            {/* Big Red 'X' for Lapsed */}
            <line x1="24" y1="22" x2="40" y2="38" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="40" y1="22" x2="24" y2="38" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" />

            {/* "RENEWAL LAPSED" Text labels */}
            <text x="32" y="52" fill="#334155" fontSize="4.2" fontWeight="black" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.2">RENEWAL</text>
            <text x="32" y="57" fill="#334155" fontSize="4.2" fontWeight="black" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.2">LAPSED</text>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "lapsed-renewal") return "Lapsed Registration Renewal";
    return "";
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
              className="text-slate-400 dark:text-slate-550 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span 
              onClick={() => setActiveForm(null)}
              className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Employment Services
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  {getBreadcrumbLabel()}
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
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>{activeForm ? "Back to Sub-Services" : "Back to Services"}</span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER CARDS DIRECTORY OR THE DETAILED DYNAMIC INLINE FORM */}
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
              {employmentServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ELEGANT & PROFESSIONAL ENTERPRISE DESIGN FOR INLINE FORM */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              
              {activeForm === "lapsed-renewal" && (
                <LapsedRegistrationRenewal onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
