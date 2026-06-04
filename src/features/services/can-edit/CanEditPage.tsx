"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { CanEditForms } from "./CanEditForms";
import { ServiceCard } from "../ServiceCard";

interface CanEditService {
  id: string;
  name: string;
}

export function CanEditPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null); // service ID or null
  const [activeFormName, setActiveFormName] = useState<string>("");

  const canEditServicesList: CanEditService[] = [
    { id: "new-can-reg", name: "New Can Registration" },
    { id: "name-correction", name: "Name Correction" },
    { id: "dob-correction", name: "DOB Correction" },
    { id: "mobile-number", name: "Can Number" },
    { id: "certificate-find", name: "Certificate Find" },
    { id: "legal-heir-cert-no", name: "Legal Heir Certificate Number" },
    { id: "find-can-number", name: "Find Can Number" },
    { id: "name-cell-number", name: "Name + Cell Number" },
    { id: "name-dob", name: "Name + Date of Birth" },
    { id: "cell-number-dob", name: "Cell Number + Date of Birth" },
    { id: "name-cell-number-dob", name: "Name + Cell Number + DOB" },
    { id: "saved-app-removed", name: "Saved Application Removed" },
    { id: "return-app-removed", name: "Return Application Removed" },
    { id: "father-name-correction", name: "Father Name Correction" },
    { id: "address-correction", name: "Adress Correction" },
  ];

  const handleCardClick = (service: CanEditService) => {
    setActiveForm(service.id);
    setActiveFormName(service.name);
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    // Generate beautiful custom icons based on the requested screenshot
    switch (id) {
      case "new-can-reg":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="10" width="36" height="44" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
            <circle cx="32" cy="22" r="4.5" fill="#334155" />
            <path d="M25 34C25 30 28 29 32 29C36 29 39 30 39 34V35H25V34Z" fill="#334155" />
            <line x1="22" y1="41" x2="42" y2="41" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="46" x2="36" y2="46" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            {/* Tiny Pen */}
            <path d="M44 40L49 35L53 39L48 44L44 40Z" fill="#f59e0b" />
            <path d="M43 43L44 40L48 44L43 43Z" fill="#334155" />
          </svg>
        );
      case "name-correction":
      case "father-name-correction":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="22" r="9" fill="black" />
            <path d="M16 46C16 36 22 34 32 34C42 34 48 36 48 46V52H16V46Z" fill="black" />
          </svg>
        );
      case "dob-correction":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="14" width="40" height="38" rx="4" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
            <rect x="12" y="14" width="40" height="9" fill="#d97706" />
            <text x="32" y="40" fill="#d97706" fontSize="12" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">DOB</text>
            <circle cx="44" cy="44" r="7.5" fill="#f59e0b" />
            <circle cx="44" cy="44" r="4.5" fill="white" />
            <path d="M20 10V16M44 10V16" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case "mobile-number":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="10" width="28" height="44" rx="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
            <rect x="22" y="16" width="20" height="28" rx="1" fill="white" />
            <circle cx="32" cy="49" r="2" fill="white" />
            {/* Phone receiver icon inside phone */}
            <path d="M26 24C26 24 26 30 32 36C38 42 38 42 38 42" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case "certificate-find":
      case "legal-heir-cert-no":
      case "find-can-number":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="12" width="40" height="40" rx="3" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
            <circle cx="44" cy="44" r="9" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <line x1="50" y1="50" x2="57" y2="57" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="22" x2="36" y2="22" stroke="#b45309" strokeWidth="2.5" />
            <line x1="20" y1="28" x2="36" y2="28" stroke="#b45309" strokeWidth="2.5" />
            <line x1="20" y1="34" x2="28" y2="34" stroke="#b45309" strokeWidth="2.5" />
          </svg>
        );
      case "name-cell-number":
      case "name-dob":
      case "cell-number-dob":
      case "name-cell-number-dob":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="12" width="40" height="40" rx="4" fill="white" stroke="black" strokeWidth="3" />
            <text x="32" y="32" fill="black" fontSize="9" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">8</text>
            <path d="M12 22H52" stroke="black" strokeWidth="3" />
            <path d="M20 8V14M44 8V14" stroke="black" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case "saved-app-removed":
      case "return-app-removed":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18H48V54C48 56.2091 46.2091 58 44 58H20C17.7909 58 16 56.2091 16 54V18Z" fill="white" stroke="black" strokeWidth="4" />
            <path d="M12 18H52" stroke="black" strokeWidth="4" strokeLinecap="round" />
            <rect x="24" y="8" width="16" height="6" rx="1" fill="white" stroke="black" strokeWidth="3" />
            <line x1="26" y1="26" x2="26" y2="46" stroke="black" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="26" x2="32" y2="46" stroke="black" strokeWidth="3" strokeLinecap="round" />
            <line x1="38" y1="26" x2="38" y2="46" stroke="black" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case "address-correction":
        return (
          <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="white" stroke="black" strokeWidth="2.5" />
            {/* House outline */}
            <path d="M20 36V48H44V36M16 36L32 20L48 36" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="29" y="38" width="6" height="10" fill="none" stroke="black" strokeWidth="2.5" />
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
              CAN EDIT
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  {activeFormName}
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
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-705 transition-colors"
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {canEditServicesList.map((service) => (
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
              
              <CanEditForms 
                serviceId={activeForm} 
                serviceName={activeFormName} 
                onCancel={() => setActiveForm(null)} 
              />
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
