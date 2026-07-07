"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { CanEditForms } from "./CanEditForms";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface CanEditService {
  id: string;
  name: string;
}

export function CanEditPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [activeFormName, setActiveFormName] = useState<string>("");

  const [canEditServicesList, setCanEditServicesList] = useState<
    CanEditService[]
  >([
    { id: "new-can-reg", name: "New Can Registration" },
    { id: "name-correction", name: "Name Correction" },
    { id: "dob-correction", name: "DOB Correction" },
    { id: "mobile-number", name: "Mobile Number" },
    { id: "can-delete", name: "Can Delete" },
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
  ]);

  const handleCardClick = (service: CanEditService) => {
    setActiveForm(service.id);
    setActiveFormName(service.name);
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
        setCanEditServicesList((prev) =>
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
        setCanEditServicesList((prev) => prev.filter((s) => s.id !== id));
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
    // Generate beautiful custom icons based on the requested screenshot
    switch (id) {
      case "new-can-reg":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="14"
              y="10"
              width="36"
              height="44"
              rx="4"
              fill="white"
              stroke="#334155"
              strokeWidth="2"
            />
            <circle cx="32" cy="22" r="4.5" fill="#334155" />
            <path
              d="M25 34C25 30 28 29 32 29C36 29 39 30 39 34V35H25V34Z"
              fill="#334155"
            />
            <line
              x1="22"
              y1="41"
              x2="42"
              y2="41"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="46"
              x2="36"
              y2="46"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Tiny Pen */}
            <path d="M44 40L49 35L53 39L48 44L44 40Z" fill="#f59e0b" />
            <path d="M43 43L44 40L48 44L43 43Z" fill="#334155" />
          </svg>
        );
      case "name-correction":
      case "father-name-correction":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="22" r="9" fill="black" />
            <path
              d="M16 46C16 36 22 34 32 34C42 34 48 36 48 46V52H16V46Z"
              fill="black"
            />
          </svg>
        );
      case "dob-correction":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="12"
              y="14"
              width="40"
              height="38"
              rx="4"
              fill="#fffbeb"
              stroke="#d97706"
              strokeWidth="2"
            />
            <rect x="12" y="14" width="40" height="9" fill="#d97706" />
            <text
              x="32"
              y="40"
              fill="#d97706"
              fontSize="12"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              DOB
            </text>
            <circle cx="44" cy="44" r="7.5" fill="#f59e0b" />
            <circle cx="44" cy="44" r="4.5" fill="white" />
            <path
              d="M20 10V16M44 10V16"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
      case "mobile-number":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="mobileNumberBgGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="12"
              fill="url(#mobileNumberBgGrad)"
            />
            <rect
              x="20"
              y="12"
              width="24"
              height="40"
              rx="4"
              fill="#3b82f6"
              stroke="#1d4ed8"
              strokeWidth="2"
            />
            <rect x="23" y="17" width="18" height="26" fill="white" />
            <circle cx="32" cy="47" r="1.5" fill="white" />
            <path
              d="M27 24C27 24 27 29 32 34C37 39 37 39 37 39"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="42"
              cy="36"
              r="8"
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <path
              d="M39 36C39 34.3431 40.3431 33 42 33C43.6569 33 45 34.3431 45 36C45 37.6569 43.6569 39 42 39"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M44 37.5L45 39L46.5 38"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "can-delete":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="canDeleteBgGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fee2e2" />
                <stop offset="100%" stopColor="#fca5a5" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="12"
              fill="url(#canDeleteBgGrad)"
            />
            <path
              d="M22 24H42M25 24V44C25 45.1046 25.8954 46 27 46H37C38.1046 46 39 45.1046 39 44V24M29 20H35"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="30"
              y1="30"
              x2="30"
              y2="40"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="34"
              y1="30"
              x2="34"
              y2="40"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case "certificate-find":
      case "legal-heir-cert-no":
      case "find-can-number":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              rx="3"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="2"
            />
            <circle
              cx="44"
              cy="44"
              r="9"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="50"
              x2="57"
              y2="57"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="22"
              x2="36"
              y2="22"
              stroke="#b45309"
              strokeWidth="2.5"
            />
            <line
              x1="20"
              y1="28"
              x2="36"
              y2="28"
              stroke="#b45309"
              strokeWidth="2.5"
            />
            <line
              x1="20"
              y1="34"
              x2="28"
              y2="34"
              stroke="#b45309"
              strokeWidth="2.5"
            />
          </svg>
        );
      case "name-cell-number":
      case "name-dob":
      case "cell-number-dob":
      case "name-cell-number-dob":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              rx="4"
              fill="white"
              stroke="black"
              strokeWidth="3"
            />
            <text
              x="32"
              y="32"
              fill="black"
              fontSize="9"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              8
            </text>
            <path d="M12 22H52" stroke="black" strokeWidth="3" />
            <path
              d="M20 8V14M44 8V14"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case "saved-app-removed":
      case "return-app-removed":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 18H48V54C48 56.2091 46.2091 58 44 58H20C17.7909 58 16 56.2091 16 54V18Z"
              fill="white"
              stroke="black"
              strokeWidth="4"
            />
            <path
              d="M12 18H52"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect
              x="24"
              y="8"
              width="16"
              height="6"
              rx="1"
              fill="white"
              stroke="black"
              strokeWidth="3"
            />
            <line
              x1="26"
              y1="26"
              x2="26"
              y2="46"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="32"
              y1="26"
              x2="32"
              y2="46"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="38"
              y1="26"
              x2="38"
              y2="46"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case "address-correction":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="white"
              stroke="black"
              strokeWidth="2.5"
            />
            {/* House outline */}
            <path
              d="M20 36V48H44V36M16 36L32 20L48 36"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <rect
              x="29"
              y="38"
              width="6"
              height="10"
              fill="none"
              stroke="black"
              strokeWidth="2.5"
            />
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
          pageName="CAN EDIT"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeFormName}
        />

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
            <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
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
