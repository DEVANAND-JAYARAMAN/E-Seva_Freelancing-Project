"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { Plus } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { RationToAdhaar } from "./RationToAdhaar";
import { AdhaarToRation } from "./AdhaarToRation";
import { ServiceCard } from "../ServiceCard";
import { GenericServiceForm } from "../form/GenericServiceForm";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface RationCardService {
  id: string;
  name: string;
  logoUrl?: string;
}

export function RationCardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const [rationCardServicesList, setRationCardServicesList] = useCategoryServices<RationCardService>(
    "ration-card",
    [
    { id: "ration-to-adhaar", name: "Ration Number To Adhaar Number Find" },
    { id: "adhaar-to-ration", name: "Adhaar To Ration Number Find" },
  ]
  );

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

        setRationCardServicesList((prev) => [...prev, { id, name }]);
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

  const handleCardClick = (service: RationCardService) => {
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
        setRationCardServicesList((prev) => prev.filter((s) => s.id !== id));
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

  const activeService = rationCardServicesList.find((s) => s.id === activeForm);

  const getBreadcrumbLabel = () => {
    if (activeForm === "ration-to-adhaar")
      return "Ration Number To Adhaar Number Find";
    if (activeForm === "adhaar-to-ration")
      return "Adhaar To Ration Number Find";
    return activeService?.name || "";
  };

  const renderActiveForm = () => {
    if (!activeForm) return null;
    const onCancel = () => setActiveForm(null);
    if (activeForm === "ration-to-adhaar")
      return <RationToAdhaar onCancel={onCancel} />;
    if (activeForm === "adhaar-to-ration")
      return <AdhaarToRation onCancel={onCancel} />;
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
        <ServiceNavigation
          pageName="Ration Card"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? getBreadcrumbLabel() : undefined}
        >
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
        </ServiceNavigation>

        {!activeForm ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {rationCardServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setRationCardServicesList((prev) =>
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
