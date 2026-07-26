"use client";

import { useState } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { ChassisToRc } from "./ChassisToRc";
import { EngineToRc } from "./EngineToRc";
import { DlToCell } from "./DlToCell";
import { ServiceCard } from "../ServiceCard";
import { GenericServiceForm } from "../form/GenericServiceForm";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface RtoService {
  id: string;
  name: string;
  logoUrl?: string;
}

export function RtoServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);

  const [rtoServicesList, setRtoServicesList] = useCategoryServices<RtoService>("rto-services", [
    { id: "chassis-to-rc", name: "Chassis Number To Rc Find" },
    { id: "engine-to-rc", name: "Engine Number To Rc Find" },
    { id: "dl-to-cell", name: "Driving License - Cell No Find" },
  ]);

  const handleAddService = () => {
    Swal.fire({
      title: "Add Service",
      input: "text",
      inputPlaceholder: "Enter service name",
      showCancelButton: true,
      confirmButtonColor: "#005C3A",
      confirmButtonText: "Add",
      inputValidator: (value) => {
        if (!value?.trim()) return "Service name is required";
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value?.trim()) {
        const name = result.value.trim();
        const id = `custom-${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-${Date.now().toString().slice(-5)}`;

        setRtoServicesList((prev) => [...prev, { id, name }]);
        Swal.fire({
          title: "Service Added",
          text: `"${name}" has been added.`,
          icon: "success",
          confirmButtonColor: "#005C3A",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleCardClick = (service: RtoService) => {
    setActiveForm(service.id);
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
        if (activeForm === id) setActiveForm(null);
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

  const activeService = rtoServicesList.find((s) => s.id === activeForm);

  const getBreadcrumbLabel = () => {
    if (activeForm === "chassis-to-rc") return "Chassis Number To Rc Find";
    if (activeForm === "engine-to-rc") return "Engine Number To Rc Find";
    if (activeForm === "dl-to-cell") return "Driving License - Cell No Find";
    return activeService?.name || "";
  };

  const renderActiveForm = () => {
    if (!activeForm) return null;
    const onCancel = () => setActiveForm(null);
    if (activeForm === "chassis-to-rc") return <ChassisToRc onCancel={onCancel} />;
    if (activeForm === "engine-to-rc") return <EngineToRc onCancel={onCancel} />;
    if (activeForm === "dl-to-cell") return <DlToCell onCancel={onCancel} />;
    return (
      <GenericServiceForm
        title={activeService?.name || "New Service"}
        onCancel={onCancel}
      />
    );
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
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
            {isAdmin && !activeForm && (
              <button
                type="button"
                onClick={handleAddService}
                className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-transparent bg-[#005c3a] hover:bg-[#004d30] text-white"
              >
                <Plus size={12} />
                <span>Add Service</span>
              </button>
            )}
            <button
              onClick={() => {
                if (activeForm) {
                  setActiveForm(null);
                } else {
                  router.push(PATHS.SERVICES);
                }
              }}
              className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {!activeForm ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
                  Apply Service
                </h3>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleAddService}
                  className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-transparent bg-[#005c3a] hover:bg-[#004d30] text-white"
                >
                  <Plus size={12} />
                  <span>Add Service</span>
                </button>
              )}
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
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setRtoServicesList((prev) =>
                      prev.map((s) =>
                        s.id === service.id ? { ...s, ...data } : s,
                      ),
                    )
                  }
                  onDeleteClick={() => handleDeleteCard(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {renderActiveForm()}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
