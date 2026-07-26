"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useEffect, useState } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { AppShell } from "../../../layouts/AppShell";
import { CmHealthCardForm } from "./CmHealthCardForm";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import { useFormEdit } from "../../../store/context/FormEditContext";
import Swal from "sweetalert2";

interface HealthService {
  id: string;
  name: string;
  logoUrl?: string;
}

export function CmHealthCardPage() {
  const { user } = useAuth();
  const { setFormScope } = useFormEdit();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    setFormScope(activeForm);
    return () => setFormScope(null);
  }, [activeForm, setFormScope]);

  const [servicesList, setServicesList] = useCategoryServices<HealthService>(
    "cm-health-card",
    [{ id: "cm-health-card", name: "CM Health Card" }],
  );

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

  const renderServiceIcon = (className = "w-16 h-16") => {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#4D7C0F" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="#F0FDF4"
          stroke="url(#healthGrad)"
          strokeWidth="2.5"
        />
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="#FEF08A"
          stroke="#CA8A04"
          strokeWidth="1"
          strokeDasharray="2 1"
        />
        <circle cx="27" cy="26" r="3.5" fill="#15803D" />
        <circle cx="37" cy="26" r="3.5" fill="#15803D" />
        <circle cx="32" cy="35" r="2.5" fill="#15803D" />
        <path
          d="M22 36C22 32 26 31 27 31C28 31 32 32 32 36H22Z"
          fill="#15803D"
        />
        <path
          d="M32 36C32 32 36 31 37 31C38 31 42 32 42 36H32Z"
          fill="#15803D"
        />
        <path
          d="M29 41C29 39 31 38.5 32 38.5C33 38.5 35 39 35 41H29Z"
          fill="#15803D"
        />
        <path d="M16 28C14 26 14 22 16 20C18 22 18 26 16 28Z" fill="#4D7C0F" />
        <path d="M48 28C50 26 50 22 48 20C46 22 46 26 48 28Z" fill="#4D7C0F" />
      </svg>
    );
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        <ServiceNavigation
          pageName="CM Health Card"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "CM Health Card" : undefined}
        />

        {!activeForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                Apply Service
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {servicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon("w-16 h-16")}
                  onClick={() => setActiveForm("cm-health-card")}
                  isAdmin={isAdmin}
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setServicesList((prev) =>
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
              <CmHealthCardForm onCancel={() => setActiveForm(null)} />
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
