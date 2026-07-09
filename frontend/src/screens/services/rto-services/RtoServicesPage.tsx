"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { ChassisToRc } from "./ChassisToRc";
import { EngineToRc } from "./EngineToRc";
import { DlToCell } from "./DlToCell";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface RtoService {
  id: string;
  name: string;
}

export function RtoServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rtoServicesList, setRtoServicesList] = useState<RtoService[]>([
    { id: "chassis-to-rc", name: "Chassis Number To Rc Find" },
    { id: "engine-to-rc", name: "Engine Number To Rc Find" },
    { id: "dl-to-cell", name: "Driving License - Cell No Find" },
  ]);

  const handleCardClick = (service: RtoService) => {
    setSubmissionSuccess(false);
    if (service.id === "chassis-to-rc") {
      setActiveForm("chassis-to-rc");
    } else if (service.id === "engine-to-rc") {
      setActiveForm("engine-to-rc");
    } else if (service.id === "dl-to-cell") {
      setActiveForm("dl-to-cell");
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
        setRtoServicesList((prev) =>
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
        setRtoServicesList((prev) => prev.filter((s) => s.id !== id));
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
      case "chassis-to-rc":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="chassisBg"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Circular background */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="url(#chassisBg)"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Red Car Vector */}
            <path
              d="M16 38C16 34 20 33 32 33C44 33 48 34 48 38L45 44H19L16 38Z"
              fill="#ef4444"
            />
            <path d="M20 33L22 28H42L44 33H20Z" fill="#fca5a5" opacity="0.8" />
            {/* Wheels */}
            <circle cx="23" cy="44" r="3.5" fill="black" />
            <circle cx="41" cy="44" r="3.5" fill="black" />

            {/* Magnifying Glass representing find */}
            <circle
              cx="28"
              cy="27"
              r="6.5"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
            />
            <line
              x1="33"
              y1="32"
              x2="39"
              y2="38"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Banner details */}
            <rect x="12" y="47" width="40" height="4.5" rx="1" fill="#1e3a8a" />
            <text
              x="32"
              y="50.5"
              fill="white"
              fontSize="3.2"
              fontWeight="extrabold"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="0.2"
            >
              CHASSIS
            </text>
          </svg>
        );
      case "engine-to-rc":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="engineBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Circular background */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="url(#engineBg)"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Blue Car Vector */}
            <path
              d="M16 38C16 34 20 33 32 33C44 33 48 34 48 38L45 44H19L16 38Z"
              fill="#3b82f6"
            />
            <path d="M20 33L22 28H42L44 33H20Z" fill="#93c5fd" opacity="0.8" />
            {/* Wheels */}
            <circle cx="23" cy="44" r="3.5" fill="black" />
            <circle cx="41" cy="44" r="3.5" fill="black" />

            {/* Magnifying Glass */}
            <circle
              cx="28"
              cy="27"
              r="6.5"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
            />
            <line
              x1="33"
              y1="32"
              x2="39"
              y2="38"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Banner details */}
            <rect x="12" y="47" width="40" height="4.5" rx="1" fill="#1e3a8a" />
            <text
              x="32"
              y="50.5"
              fill="white"
              fontSize="3.2"
              fontWeight="extrabold"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="0.2"
            >
              ENGINE
            </text>
          </svg>
        );
      case "dl-to-cell":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="dlBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Circular background */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="url(#dlBg)"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Driving License card representation */}
            <rect
              x="12"
              y="22"
              width="22"
              height="15"
              rx="1"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <circle cx="16.5" cy="27" r="2" fill="#3b82f6" />
            <line
              x1="21.5"
              y1="25"
              x2="30.5"
              y2="25"
              stroke="#475569"
              strokeWidth="1"
            />
            <line
              x1="21.5"
              y1="28"
              x2="28.5"
              y2="28"
              stroke="#475569"
              strokeWidth="1"
            />
            <line
              x1="15"
              y1="32"
              x2="30"
              y2="32"
              stroke="#475569"
              strokeWidth="0.8"
            />
            <line
              x1="15"
              y1="34"
              x2="26"
              y2="34"
              stroke="#475569"
              strokeWidth="0.8"
            />

            {/* Mobile smartphone link representing find */}
            <rect
              x="38"
              y="20"
              width="13"
              height="23"
              rx="2"
              fill="#1e293b"
              stroke="white"
              strokeWidth="1"
            />
            <circle cx="44.5" cy="40.5" r="1" fill="white" />
            <path d="M41 23H48V38H41V23Z" fill="#15803d" />
            {/* Link arrows */}
            <path
              d="M34 27.5C36 27.5 37 28.5 38 29.5"
              stroke="#60a5fa"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M38 31.5C37 32.5 36 33.5 34 33.5"
              stroke="#60a5fa"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Banner details */}
            <rect x="12" y="47" width="40" height="4.5" rx="1" fill="#1e3a8a" />
            <text
              x="32"
              y="50.5"
              fill="white"
              fontSize="3.2"
              fontWeight="extrabold"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="0.2"
            >
              LICENCE
            </text>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "chassis-to-rc") return "Chassis Number To Rc Find";
    if (activeForm === "engine-to-rc") return "Engine Number To Rc Find";
    if (activeForm === "dl-to-cell") return "Driving License - Cell No Find";
    return "";
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-2xl p-4 shadow-sm">
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
              RTO Services
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
              <span>Back</span>
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
              {rtoServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-20 h-20")}
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
            <div className="w-full bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {activeForm === "chassis-to-rc" ? (
                <ChassisToRc onCancel={() => setActiveForm(null)} />
              ) : activeForm === "engine-to-rc" ? (
                <EngineToRc onCancel={() => setActiveForm(null)} />
              ) : (
                <DlToCell onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
