"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { PoliceVerificationForm } from "./PoliceVerificationForm";
import { ServiceCard } from "../ServiceCard";

interface PoliceVerificationService {
  id: string;
  name: string;
  price: number;
}

export function PoliceVerificationPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [selectedService, setSelectedService] =
    useState<PoliceVerificationService | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const servicesList: PoliceVerificationService[] = [
    {
      id: "police-verification-request",
      name: "Police Verification Request",
      price: 500.0,
    },
  ];

  const handleCardClick = (service: PoliceVerificationService) => {
    setSelectedService(service);
    setSubmissionSuccess(false);
    if (service.id === "police-verification-request") {
      setActiveForm("police-verification-request");
    }
  };

  const handleFormSubmit = (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setActiveForm(null);
        setSubmissionSuccess(false);
      }, 3000);
    }, 1500);
  };

  const renderServiceIcon = (id: string, className = "w-16 h-16") => {
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`goldGrad-${uniqueId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Soft yellow square box matching user image */}
        <rect
          width="100"
          height="100"
          rx="12"
          fill="#FEFDF0"
          stroke="#FEF3C7"
          strokeWidth="1"
        />

        {/* Blue Circular Emblem frame */}
        <circle
          cx="50"
          cy="45"
          r="28"
          fill="#1E3A8A"
          stroke="#3B82F6"
          strokeWidth="1"
        />
        <circle cx="50" cy="45" r="25" fill="#FEFDF0" />

        {/* Srivilliputhur Temple Tower (Detailed Path Representation) */}
        <path d="M50 24L46 30H54L50 24Z" fill="#D97706" />
        <rect x="47" y="30" width="6" height="12" fill="#B45309" />
        <rect x="44" y="36" width="12" height="1" fill="#92400E" />
        <rect x="42" y="38" width="16" height="1" fill="#92400E" />
        <rect x="40" y="42" width="20" height="8" fill="#D97706" />
        {/* Door/gate arch of tower */}
        <path d="M48 50C48 46 52 46 52 50H48Z" fill="#FEFDF0" />

        {/* Flag Tricolor under Tower */}
        <rect x="34" y="50" width="32" height="1.5" fill="#FF9933" />
        <rect x="34" y="51.5" width="32" height="1.5" fill="#FFFFFF" />
        <rect x="34" y="53" width="32" height="1.5" fill="#138808" />

        {/* Outer text path representation (TAMIL NADU POLICE) */}
        <path
          id={`textPath-${uniqueId}`}
          d="M26 45C26 31.7 36.7 21 50 21C63.3 21 74 31.7 74 45"
          fill="none"
        />
        <text
          fontSize="5.5"
          fontWeight="bold"
          fill="#1E3A8A"
          letterSpacing="0.2"
        >
          <textPath
            href={`#textPath-${uniqueId}`}
            startOffset="50%"
            textAnchor="middle"
          >
            TAMIL NADU POLICE
          </textPath>
        </text>

        {/* Red Ribbon Banner reading "TRUTH ALONE TRIUMPHS" */}
        <path
          d="M22 68C32 75 68 75 78 68L74 58C64 64 36 64 26 58L22 68Z"
          fill="#DC2626"
        />
        <path d="M22 68L26 58H18L22 68Z" fill="#991B1B" />
        <path d="M78 68L74 58H82L78 68Z" fill="#991B1B" />

        <text
          x="50"
          y="65"
          fill="#FFFFFF"
          fontSize="4.2"
          fontWeight="black"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          TRUTH ALONE TRIUMPHS
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
              Police Verification
            </span>
            {activeForm && selectedService && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  {selectedService.name}
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
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-750 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>
                {activeForm ? "Back to Sub-Services" : "Back to Services"}
              </span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER CARDS DIRECTORY OR THE FORM */}
        {!activeForm ? (
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
                  icon={renderServiceIcon(service.id, "w-24 h-24")}
                  onClick={() => handleCardClick(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {submissionSuccess ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Application Submitted Successfully!
                    </h5>
                    <p className="text-sm text-slate-400 dark:text-slate-550 mt-2 max-w-md leading-relaxed">
                      Your request for **{selectedService?.name}** has been
                      registered. You can monitor the progress inside Service
                      Status tab.
                    </p>
                  </div>
                </div>
              ) : activeForm === "police-verification-request" &&
                selectedService ? (
                <PoliceVerificationForm
                  price={selectedService.price}
                  onCancel={() => setActiveForm(null)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <h4 className="text-lg font-bold">
                    {selectedService?.name} Form
                  </h4>
                  <p className="text-xs text-slate-400 mt-2">
                    Form integration under construction
                  </p>
                  <button
                    onClick={() => setActiveForm(null)}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
