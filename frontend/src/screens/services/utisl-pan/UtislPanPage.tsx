"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PanToAdhaarNumberFind } from "./PanToAdhaarNumberFind";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface UtislPanService {
  id: string;
  name: string;
}

export function UtislPanPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [utislPanServicesList, setUtislPanServicesList] = useState<
    UtislPanService[]
  >([{ id: "pan-to-adhaar", name: "Pan To Adhaar Number Find" }]);

  const handleCardClick = (service: UtislPanService) => {
    setSubmissionSuccess(false);
    if (service.id === "pan-to-adhaar") {
      setActiveForm("pan-to-adhaar");
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
        setUtislPanServicesList((prev) =>
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
        setUtislPanServicesList((prev) => prev.filter((s) => s.id !== id));
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

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    switch (id) {
      case "pan-to-adhaar":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="panToAdhaarBgGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8fa9b8" />
                <stop offset="100%" stopColor="#4f6b7c" />
              </linearGradient>
            </defs>
            {/* Outer Rounded Container */}
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="10"
              fill="url(#panToAdhaarBgGrad)"
            />
            {/* White Rounded Inner Card */}
            <rect
              x="14"
              y="14"
              width="36"
              height="36"
              rx="6"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Document Lines */}
            <rect
              x="22"
              y="20"
              width="20"
              height="2.5"
              rx="0.5"
              fill="#1e293b"
            />
            <line
              x1="22"
              y1="26"
              x2="36"
              y2="26"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="31"
              x2="32"
              y2="31"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="36"
              x2="30"
              y2="36"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Gear / Cog Icon on Bottom Right of Document */}
            <circle
              cx="38"
              cy="36"
              r="5"
              fill="#f1f5f9"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <circle
              cx="38"
              cy="36"
              r="2.5"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            {/* Gear teeth */}
            <path
              d="M38 29.5V31.5M38 40.5V42.5M31.5 36H33.5M40.5 36H42.5"
              stroke="#1e293b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M33.4 31.4L34.8 32.8M41.2 39.2L42.6 40.6M33.4 40.6L34.8 39.2M41.2 32.8L42.6 31.4"
              stroke="#1e293b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* "SERVICE" Text */}
            <text
              x="32"
              y="46"
              fill="#475569"
              fontSize="4.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="0.2"
            >
              SERVICE
            </text>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "pan-to-adhaar") return "Pan To Adhaar Number Find";
    return "";
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="Utisl Pan"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "Utisl Pan" : undefined}
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
              {utislPanServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  onEditClick={() => handleEditCard(service.id, service.name)}
                  onDeleteClick={() => handleDeleteCard(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ELEGANT & PROFESSIONAL ENTERPRISE DESIGN FOR INLINE FORM */
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {activeForm === "pan-to-adhaar" && (
                <PanToAdhaarNumberFind onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
