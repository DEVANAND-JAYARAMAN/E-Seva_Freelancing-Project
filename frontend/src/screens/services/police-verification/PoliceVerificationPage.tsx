"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PoliceVerificationForm } from "./PoliceVerificationForm";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface PoliceVerificationService {
  id: string;
  name: string;
  price: number;
}

export function PoliceVerificationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [selectedService, setSelectedService] =
    useState<PoliceVerificationService | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [servicesList, setServicesList] = useState<PoliceVerificationService[]>(
    [
      {
        id: "police-verification-request",
        name: "Police Verification Request",
        price: 500.0,
      },
    ],
  );

  const handleCardClick = (service: PoliceVerificationService) => {
    setSelectedService(service);
    setSubmissionSuccess(false);
    if (service.id === "police-verification-request") {
      setActiveForm("police-verification-request");
    }
  };

  const handleEditCard = (id: string, currentName: string) => {
    Swal.fire({
      title: "Rename Service",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonColor: "#005C3A",
      confirmButtonText: "Save",
    }).then((result) => {
      if (result.isConfirmed && result.value?.trim()) {
        setServicesList((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, name: result.value.trim() } : s,
          ),
        );
      }
    });
  };

  const handleDeleteCard = (id: string) => {
    Swal.fire({
      title: "Delete Service?",
      text: "This will remove the card from view.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setServicesList((prev) => prev.filter((s) => s.id !== id));
        Swal.fire({
          title: "Deleted!",
          icon: "success",
          confirmButtonColor: "#005C3A",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
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
        <ServiceNavigation
          pageName="Police Verification"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "Police Verification" : undefined}
        />

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
                  isAdmin={isAdmin}
                  onEditClick={() => handleEditCard(service.id, service.name)}
                  onDeleteClick={() => handleDeleteCard(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
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
