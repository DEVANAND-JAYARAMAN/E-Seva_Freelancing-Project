"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { ServiceCard } from "../ServiceCard";
import { GstRegistrationForm } from "./GstRegistrationForm";

interface GstServiceItem {
  id: string;
  name: string;
  price: number;
}

export function GstPage() {
  const [activeForm, setActiveForm] = useState<string | null>(null); // "gst-reg" | "gst-filing" | "gst-correction" | null
  const [selectedService, setSelectedService] = useState<GstServiceItem | null>(
    null,
  );
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gstServicesList: GstServiceItem[] = [
    {
      id: "gst-reg",
      name: "GST Registration",
      price: 2000.0,
    },
  ];

  const handleCardClick = (service: GstServiceItem) => {
    setSelectedService(service);
    setSubmissionSuccess(false);
    if (service.id === "gst-reg") {
      setActiveForm("gst-reg");
    } else {
      // Setup simple active forms for filing and correction for completeness
      setActiveForm(service.id);
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
      }, 2500);
    }, 1500);
  };

  const renderServiceIcon = (id: string, className = "w-16 h-16") => {
    switch (id) {
      case "gst-reg":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="gstRegGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0a192f" />
                <stop offset="100%" stopColor="#0f3460" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="8" fill="url(#gstRegGrad)" />

            {/* Left side card */}
            <rect
              x="8"
              y="16"
              width="30"
              height="22"
              rx="2"
              fill="#f1f5f9"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <rect x="12" y="20" width="6" height="7" rx="0.5" fill="#cbd5e1" />
            <circle cx="15" cy="23" r="1.5" fill="#94a3b8" />
            <path
              d="M12 27C12 25.5 13.5 25 15 25C16.5 25 18 25.5 18 27H12Z"
              fill="#94a3b8"
            />
            <rect
              x="21"
              y="20"
              width="13"
              height="1.5"
              rx="0.5"
              fill="#475569"
            />
            <rect
              x="21"
              y="24"
              width="10"
              height="1.5"
              rx="0.5"
              fill="#475569"
            />
            <rect
              x="21"
              y="28"
              width="12"
              height="1.5"
              rx="0.5"
              fill="#475569"
            />
            <path
              d="M28 30C28 32 30 33 30 33C30 33 32 32 32 30V27L30 26L28 27V30Z"
              fill="#fbbf24"
            />

            {/* Right storefront */}
            <rect
              x="42"
              y="18"
              width="30"
              height="20"
              rx="1"
              fill="#f1f5f9"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <rect x="46" y="26" width="8" height="12" fill="#1e293b" />
            <rect x="58" y="26" width="10" height="7" fill="#1e293b" />

            {/* Awning stripes */}
            <path d="M42 18H72V22H42V18Z" fill="#ef4444" />
            <path d="M45 18H48V22H45V18Z" fill="white" />
            <path d="M51 18H54V22H51V18Z" fill="white" />
            <path d="M57 18H60V22H57V18Z" fill="white" />
            <path d="M63 18H66V22H63V18Z" fill="white" />
            <path d="M69 18H72V22H69V18Z" fill="white" />

            {/* Connection dashed arrows */}
            <path
              d="M24 10C36 6 46 8 52 12"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <path
              d="M56 42C44 46 34 44 28 40"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />

            {/* Oval badge */}
            <rect
              x="10"
              y="46"
              width="60"
              height="22"
              rx="4"
              fill="#1e3a8a"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <text
              x="40"
              y="55"
              fill="white"
              fontSize="8"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="Arial Black"
            >
              GST
            </text>
            <text
              x="40"
              y="62"
              fill="#fbbf24"
              fontSize="4.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              Registration
            </text>
          </svg>
        );

      case "gst-filing":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="gstFilingGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="8" fill="url(#gstFilingGrad)" />
            <rect
              x="15"
              y="15"
              width="50"
              height="50"
              rx="4"
              fill="white"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            <path
              d="M20 22H60M20 30H60M20 38H45M20 46H50"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="55" cy="50" r="10" fill="#10b981" />
            <path
              d="M51 50L54 53L60 47"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "gst-correction":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="gstCorrGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="8" fill="url(#gstCorrGrad)" />
            <rect
              x="18"
              y="18"
              width="44"
              height="44"
              rx="3"
              fill="white"
              stroke="#ca8a04"
              strokeWidth="1.5"
            />
            <path d="M24 28H44M24 36H52" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M24 44H38" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="52" cy="48" r="8" fill="#ef4444" />
            <path d="M48 48H56" stroke="white" strokeWidth="2" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="GST"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "GST" : undefined}
        />

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
              {gstServicesList.map((service) => (
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
          /* RENDER THE FORM INLINE */
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
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                      Your request for **{selectedService?.name}** has been
                      registered. You can monitor the progress inside Service
                      Status tab.
                    </p>
                  </div>
                </div>
              ) : activeForm === "gst-reg" && selectedService ? (
                <GstRegistrationForm
                  price={selectedService.price}
                  onCancel={() => setActiveForm(null)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              ) : (
                /* FALLBACK SIMPLE FORM FOR FILING/CORRECTION FOR COMPLETENESS */
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
                    Back to Sub-Services
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
