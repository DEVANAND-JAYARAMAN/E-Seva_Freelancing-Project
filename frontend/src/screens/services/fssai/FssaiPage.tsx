"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { NewFssaiRegistration } from "./NewFssaiRegistration";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface FssaiService {
  id: string;
  name: string;
}

export function FssaiPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fssaiServicesList, setFssaiServicesList] = useState<FssaiService[]>([
    {
      id: "new-registration",
      name: "New FSSAI Registration (Food service)",
    },
  ]);

  const handleCardClick = (service: FssaiService) => {
    setSubmissionSuccess(false);
    if (service.id === "new-registration") {
      setActiveForm("new-registration");
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
        setFssaiServicesList((prev) =>
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
        setFssaiServicesList((prev) => prev.filter((s) => s.id !== id));
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
      case "new-registration":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="fssaiCardBg"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFDF6" />
                <stop offset="100%" stopColor="#FFF9E6" />
              </linearGradient>
            </defs>
            {/* Soft yellow/cream rounded card background */}
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="10"
              fill="url(#fssaiCardBg)"
              stroke="#fef08a"
              strokeWidth="1"
            />

            {/* Stylized FSSAI vector lettering */}
            {/* f */}
            <path
              d="M14 26C14 21 16 19 19 19H20.5V23.5H19C17.5 23.5 17.5 24.5 17.5 26V29H20.5V33H17.5V45H13.5V33H11.5V29H13.5V26Z"
              fill="#1b4d3e"
            />

            {/* s */}
            <path
              d="M22.5 37.5C22.5 35 24.5 34.5 26.5 34C28.5 33.5 29.5 33 29.5 31.5C29.5 30 28.5 29.5 27 29.5C25 29.5 24 30.5 23.5 32H20C20.5 28.5 23.5 26 27.5 26C31.5 26 33.5 28 33.5 31C33.5 33.5 31.5 34.5 29.5 35C27.5 35.5 26.5 36 26.5 37.5C26.5 39 27.5 39.5 29.5 39.5C31.5 39.5 32.5 38.5 33 37H36.5C36 40.5 33 43 29 43C25 43 22.5 40.5 22.5 37.5Z"
              fill="#1b4d3e"
            />

            {/* a */}
            <path
              d="M38.5 37C38.5 33.5 40.5 32 44.5 31.5L46.5 31.2V30.5C46.5 29.5 45.5 29 44 29C42.5 29 42 29.5 41.5 31H38C38.5 28 41 26 44.5 26C48.5 26 50.5 28 50.5 31V43H47V40.5C46.5 42 44.5 43.5 42.5 43.5C39.5 43.5 38.5 40.5 38.5 37ZM46.5 35.5V34L44.5 34.2C42.5 34.5 42 35.5 42 37C42 38.5 42.5 39.5 44 39.5C45.5 39.5 46.5 38.5 46.5 35.5Z"
              fill="#1b4d3e"
            />

            {/* i */}
            <path d="M53.5 28.5H57.5V43H53.5V28.5Z" fill="#ea580c" />
            {/* Leaf on 'i' */}
            <path
              d="M57.5 25C57.5 25 58.5 21.5 56.5 19.5C54.5 17.5 51 18.5 51 18.5C51 18.5 53 21 55 22C57 23 57.5 25 57.5 25Z"
              fill="#166534"
            />

            {/* Bottom green bar */}
            <rect x="11.5" y="46" width="46" height="2" fill="#166534" />

            {/* "REGISTRATION" */}
            <text
              x="32"
              y="53"
              fill="#1e293b"
              fontSize="4.8"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="Arial Black, Impact, sans-serif"
              letterSpacing="0.4"
            >
              REGISTRATION
            </text>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    if (activeForm === "new-registration") return "New FSSAI Registration";
    return "";
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="FSSAI"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={getBreadcrumbLabel()}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fssaiServicesList.map((service) => (
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
            <div className="w-full bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {activeForm === "new-registration" && (
                <NewFssaiRegistration onCancel={() => setActiveForm(null)} />
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
