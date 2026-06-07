"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { RationToAdhaar } from "./RationToAdhaar";
import { AdhaarToRation } from "./AdhaarToRation";
import { ServiceCard } from "../ServiceCard";

interface RationCardService {
  id: string;
  name: string;
}

export function RationCardPage() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const rationCardServicesList: RationCardService[] = [
    {
      id: "ration-to-adhaar",
      name: "Ration Number To Adhaar Number Find",
    },
    {
      id: "adhaar-to-ration",
      name: "Adhaar To Ration Number Find",
    },
  ];

  const handleCardClick = (service: RationCardService) => {
    if (service.id === "ration-to-adhaar") {
      setActiveForm("ration-to-adhaar");
    } else if (service.id === "adhaar-to-ration") {
      setActiveForm("adhaar-to-ration");
    }
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;

    switch (id) {
      case "ration-to-adhaar":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id={`rationGrad1-${uniqueId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="8"
              fill={`url(#rationGrad1-${uniqueId})`}
              stroke="#06b6d4"
              strokeWidth="1.5"
            />
            <rect
              x="8"
              y="8"
              width="48"
              height="48"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeDasharray="3 1"
            />
            <rect x="14" y="14" width="36" height="18" rx="2" fill="white" />
            <text
              x="32"
              y="26"
              fill="#0891b2"
              fontSize="7"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              RATION
            </text>
            <circle cx="32" cy="42" r="6" fill="#FBBF24" />
            <path
              d="M28 42L31 45L36 39"
              stroke="#0891b2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "adhaar-to-ration":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id={`rationGrad2-${uniqueId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="8"
              fill={`url(#rationGrad2-${uniqueId})`}
              stroke="#a855f7"
              strokeWidth="1.5"
            />
            <rect
              x="8"
              y="8"
              width="48"
              height="48"
              fill="none"
              stroke="#d8b4fe"
              strokeWidth="1"
              strokeDasharray="3 1"
            />
            <rect x="14" y="14" width="36" height="18" rx="2" fill="white" />
            <text
              x="32"
              y="26"
              fill="#7c3aed"
              fontSize="7"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              ADHAAR
            </text>
            <circle cx="32" cy="42" r="6" fill="#FBBF24" />
            <path
              d="M28 42L31 45L36 39"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "ration-to-adhaar")
      return "Ration Number To Adhaar Number Find";
    if (activeForm === "adhaar-to-ration")
      return "Adhaar To Ration Number Find";
    return "";
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="Ration Card"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "Ration Card" : undefined}
        />

        {/* CONDITIONALLY RENDER CARDS DIRECTORY OR THE DETAILED INLINE FORM */}
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
              {rationCardServicesList.map((service) => (
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
          /* INLINE FORM SECTION */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {activeForm === "ration-to-adhaar" ? (
                <RationToAdhaar onCancel={() => setActiveForm(null)} />
              ) : (
                <AdhaarToRation onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
