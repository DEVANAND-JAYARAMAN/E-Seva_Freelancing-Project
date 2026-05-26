"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { EpicVoterPdf } from "./EpicVoterPdf";
import { UpdateCellNumberWithOtp } from "./UpdateCellNumberWithOtp";
import { UpdateCellNumberWithoutOtp } from "./UpdateCellNumberWithoutOtp";
import { ServiceCard } from "../ServiceCard";

interface VoterService {
  id: string;
  name: string;
}

export function VoterIdPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null); // "epic-voter-pdf" | "update-cell-one-otp" | "update-cell-no-otp" | null
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voterServicesList: VoterService[] = [
    {
      id: "epic-voter-pdf",
      name: "Epic Voter PDF (Without OTP)",
    },
    {
      id: "update-cell-one-otp",
      name: "Update Cell Number (With One OTP)",
    },
    {
      id: "update-cell-no-otp",
      name: "Update Cell Number (Without OTP)",
    },
  ];

  const handleCardClick = (service: VoterService) => {
    setSubmissionSuccess(false);
    if (service.id === "epic-voter-pdf") {
      setActiveForm("epic-voter-pdf");
    } else if (service.id === "update-cell-one-otp") {
      setActiveForm("update-cell-one-otp");
    } else if (service.id === "update-cell-no-otp") {
      setActiveForm("update-cell-no-otp");
    }
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dark Circle Background matching the logo in screenshot */}
        <circle cx="32" cy="32" r="28" fill="#13263e" stroke="#1f2937" strokeWidth="1" />
        
        {/* White Hand Vector */}
        {/* Wrist */}
        <path d="M29 44H39V48H29V44Z" fill="white" />
        {/* Palm & Fingers */}
        <path d="M24 38C24 38 24 34 26 33C28 32 30 35 30 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 33C26 31 28 30 29.5 31C31 32 31.5 35 31.5 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M29.5 31C29.5 29 31 28 32.5 29C34 30 34 33 34 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Pointing Index Finger */}
        <path d="M34 38V26C34 23.5 37 23.5 37 26V35" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M34 35H37.5V44H29L24 38V44H39V35" fill="white" />

        {/* Red Touch Button at Finger Tip */}
        <circle cx="35.5" cy="22" r="4.5" fill="#ef4444" />
        <circle cx="35.5" cy="22" r="8" fill="none" stroke="#ef4444" strokeWidth="1.5" />

        {/* Green bar support under hand */}
        <rect x="25" y="44.5" width="14" height="2" rx="0.5" fill="#15803d" />

        {/* Red Tick Symbol '✓' */}
        <path d="M19 43.5L21.5 46L26.5 41" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Text 'voter' with custom tick alignment */}
        <text x="34" y="45.5" fill="white" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">oter</text>
      </svg>
    );
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "epic-voter-pdf") return "Epic Voter PDF";
    if (activeForm === "update-cell-one-otp") return "Update Cell Number (With One OTP)";
    if (activeForm === "update-cell-no-otp") return "Update Cell Number (Without OTP)";
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
              Voter ID
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
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
                Apply Service
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {voterServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-20 h-20")}
                  onClick={() => handleCardClick(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ELEGANT & PROFESSIONAL ENTERPRISE DESIGN FOR INLINE FORM */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              
              {activeForm === "epic-voter-pdf" ? (
                <EpicVoterPdf onCancel={() => setActiveForm(null)} />
              ) : activeForm === "update-cell-one-otp" ? (
                <UpdateCellNumberWithOtp onCancel={() => setActiveForm(null)} />
              ) : (
                <UpdateCellNumberWithoutOtp onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
