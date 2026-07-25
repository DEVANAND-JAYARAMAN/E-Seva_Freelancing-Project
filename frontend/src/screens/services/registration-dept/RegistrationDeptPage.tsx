"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { Plus } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { DocumentCopy } from "./DocumentCopy";
import { ServiceCard } from "../ServiceCard";
import { GenericServiceForm } from "../form/GenericServiceForm";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface RegistrationService {
  id: string;
  name: string;
  logoUrl?: string;
}

export function RegistrationDeptPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registrationServicesList, setRegistrationServicesList] = useCategoryServices<RegistrationService>(
    "registration-dept",
    [{ id: "document-copy", name: "பத்திர நகல்" }]
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

        setRegistrationServicesList((prev) => [...prev, { id, name }]);
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

  const handleCardClick = (service: RegistrationService) => {
    setSubmissionSuccess(false);
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
        setRegistrationServicesList((prev) => prev.filter((s) => s.id !== id));
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
      case "document-copy":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stamp Paper 1: Rs.20 Blueish Stamp on Top half */}
            <g transform="translate(0, 2)">
              <rect
                x="6"
                y="6"
                width="52"
                height="23"
                rx="1.5"
                fill="#e2f5f7"
                stroke="#7ec4cf"
                strokeWidth="1"
              />
              <rect
                x="9"
                y="9"
                width="46"
                height="17"
                fill="none"
                stroke="#7ec4cf"
                strokeWidth="0.5"
                strokeDasharray="2 1"
              />
              {/* Ashoka pillar emblem sketch */}
              <circle cx="32" cy="17" r="3.5" fill="#7ec4cf" opacity="0.6" />
              <rect
                x="30"
                y="17"
                width="4"
                height="6"
                fill="#7ec4cf"
                opacity="0.6"
              />
              {/* Values */}
              <text
                x="13"
                y="16"
                fill="#0369a1"
                fontSize="4.5"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                Rs.20
              </text>
              <text
                x="51"
                y="16"
                fill="#0369a1"
                fontSize="4.5"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="end"
              >
                20
              </text>
              {/* Micro text lines */}
              <line
                x1="13"
                y1="21"
                x2="27"
                y2="21"
                stroke="#7ec4cf"
                strokeWidth="0.8"
              />
              <line
                x1="37"
                y1="21"
                x2="51"
                y2="21"
                stroke="#7ec4cf"
                strokeWidth="0.8"
              />
              <text
                x="32"
                y="24"
                fill="#0369a1"
                fontSize="2.8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
                letterSpacing="0.2"
              >
                INDIA NON JUDICIAL
              </text>
            </g>

            {/* Stamp Paper 2: Rs.100 Pinkish Stamp on Bottom half */}
            <g transform="translate(0, 29)">
              <rect
                x="6"
                y="6"
                width="52"
                height="23"
                rx="1.5"
                fill="#fdf2f8"
                stroke="#f472b6"
                strokeWidth="1"
              />
              <rect
                x="9"
                y="9"
                width="46"
                height="17"
                fill="none"
                stroke="#f472b6"
                strokeWidth="0.5"
                strokeDasharray="2 1"
              />
              {/* Ashoka pillar emblem sketch */}
              <circle cx="32" cy="17" r="3.5" fill="#f472b6" opacity="0.6" />
              <rect
                x="30"
                y="17"
                width="4"
                height="6"
                fill="#f472b6"
                opacity="0.6"
              />
              {/* Values */}
              <text
                x="13"
                y="16"
                fill="#be185d"
                fontSize="4.5"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                Rs.100
              </text>
              <text
                x="51"
                y="16"
                fill="#be185d"
                fontSize="4.5"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="end"
              >
                100
              </text>
              {/* Micro text lines */}
              <line
                x1="13"
                y1="21"
                x2="27"
                y2="21"
                stroke="#f472b6"
                strokeWidth="0.8"
              />
              <line
                x1="37"
                y1="21"
                x2="51"
                y2="21"
                stroke="#f472b6"
                strokeWidth="0.8"
              />
              <text
                x="32"
                y="24"
                fill="#be185d"
                fontSize="2.8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
                letterSpacing="0.2"
              >
                INDIA NON JUDICIAL
              </text>
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const activeService = registrationServicesList.find((s) => s.id === activeForm);

  const getBreadcrumbLabel = () => {
    if (activeForm === "document-copy") return "பத்திர நகல்";
    return activeService?.name || "";
  };

  const renderActiveForm = () => {
    if (!activeForm) return null;
    const onCancel = () => setActiveForm(null);
    if (activeForm === "document-copy")
      return <DocumentCopy onCancel={onCancel} />;
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
          pageName="Registration Dept"
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
              {registrationServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setRegistrationServicesList((prev) =>
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
