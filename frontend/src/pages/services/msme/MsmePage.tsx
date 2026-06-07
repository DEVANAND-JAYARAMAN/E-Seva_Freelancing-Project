"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { DynamicForm } from "../form/DynamicForm";
import { msmeApplySchema } from "../form/formConfig";
import { FormSchema } from "../form/types";
import { PanToMsmeUdhayamFind } from "./PanToMsmeUdhayamFind";
import { MobileToMsmeUdhayamFind } from "./MobileToMsmeUdhayamFind";
import { ServiceCard } from "../ServiceCard";

interface MsmeService {
  id: string;
  name: string;
  schema?: FormSchema;
}

export function MsmePage() {
  const [activeForm, setActiveForm] = useState<string | null>(null); // "msme-main" | "msme-pan" | "msme-mobile" | null
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const msmeServicesList: MsmeService[] = [
    {
      id: "msme-main",
      name: "MSME",
      schema: msmeApplySchema,
    },
    {
      id: "msme-pan",
      name: "Pan To Msme Udhayam Find",
    },
    {
      id: "msme-mobile",
      name: "Mobile To Msme Udhayam Find",
    },
  ];

  const handleCardClick = (service: MsmeService) => {
    setSubmissionSuccess(false);
    if (service.id === "msme-main") {
      setActiveForm("msme-main");
    } else if (service.id === "msme-pan") {
      setActiveForm("msme-pan");
    } else if (service.id === "msme-mobile") {
      setActiveForm("msme-mobile");
    }
  };

  const handleFormSubmit = (data: Record<string, string>) => {
    setIsSubmitting(true);

    // Simulate API registration call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);

      // Auto close or reset state after submission
      setTimeout(() => {
        setActiveForm(null);
        setSubmissionSuccess(false);
      }, 2500);
    }, 1500);
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    switch (id) {
      case "msme-main":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="msmeGradMain"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#005c3a" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="8"
              fill="url(#msmeGradMain)"
              stroke="#10B981"
              strokeWidth="1.5"
            />
            <rect
              x="8"
              y="8"
              width="48"
              height="48"
              fill="none"
              stroke="#34D399"
              strokeWidth="1"
              strokeDasharray="3 1"
            />
            <rect x="14" y="14" width="36" height="18" rx="2" fill="white" />
            <text
              x="32"
              y="26"
              fill="#005c3a"
              fontSize="7"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              MSME
            </text>
            <circle cx="32" cy="42" r="6" fill="#FBBF24" />
            <path
              d="M28 42L31 45L36 39"
              stroke="#005c3a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "msme-pan":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="msmeGradPan"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="14"
              width="56"
              height="36"
              rx="4"
              fill="url(#msmeGradPan)"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            <rect x="8" y="20" width="11" height="13" rx="1.5" fill="#FEF3C7" />
            <circle cx="13.5" cy="25" r="2.5" fill="#D97706" />
            <path
              d="M9 31C9 28.5 12 28.5 13.5 29.5C15 28.5 18 28.5 18 31H9Z"
              fill="#D97706"
            />
            <rect x="23" y="20" width="8" height="6" rx="1" fill="#FBBF24" />
            <text
              x="44"
              y="38"
              fill="white"
              fontSize="9"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              PAN
            </text>
          </svg>
        );
      case "msme-mobile":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="msmeGradMob"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <rect
              x="16"
              y="6"
              width="32"
              height="52"
              rx="6"
              fill="url(#msmeGradMob)"
              stroke="#064E3B"
              strokeWidth="1.5"
            />
            <rect x="20" y="12" width="24" height="36" rx="2" fill="white" />
            <circle cx="32" cy="52" r="3" fill="white" />
            <circle cx="28" cy="26" r="1.5" fill="#047857" />
            <circle cx="32" cy="24" r="2" fill="#047857" />
            <circle cx="36" cy="26" r="1.5" fill="#047857" />
            <text
              x="32"
              y="36"
              fill="#047857"
              fontSize="5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              UDYAM
            </text>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "msme-main") return "Apply MSME";
    if (activeForm === "msme-pan") return "Pan To Msme Udhayam Find";
    if (activeForm === "msme-mobile") return "Mobile To Msme Udhayam Find";
    return "";
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="MSME"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "MSME" : undefined}
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
              {msmeServicesList.map((service) => (
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
              {activeForm === "msme-main" ? (
                submissionSuccess ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
                      <CheckCircle2 size={44} className="stroke-[2.5]" />
                    </span>
                    <div>
                      <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Application Placed Successfully!
                      </h5>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                        Your full registration for **MSME / Udyam Certificate**
                        has been registered. You can monitor the progress inside
                        Service Status tab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <DynamicForm
                    schema={msmeApplySchema}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setActiveForm(null)}
                    isLoading={isSubmitting}
                  />
                )
              ) : activeForm === "msme-pan" ? (
                <PanToMsmeUdhayamFind onCancel={() => setActiveForm(null)} />
              ) : (
                <MobileToMsmeUdhayamFind onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
