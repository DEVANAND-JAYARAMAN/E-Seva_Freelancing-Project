"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useEffect, useState } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { AppShell } from "../../../layouts/AppShell";
import { PvcCardPrintForm } from "./PvcCardPrintForm";
import { ServiceCard } from "../ServiceCard";
import { useAuth } from "../../../store/context/AuthContext";
import { useFormEdit } from "../../../store/context/FormEditContext";
import Swal from "sweetalert2";

interface PvcService {
  id: string;
  name: string;
  logoUrl?: string;
}

export function PvcCardPrintPage() {
  const { user } = useAuth();
  const { setFormScope } = useFormEdit();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    setFormScope(activeForm);
    return () => setFormScope(null);
  }, [activeForm, setFormScope]);

  const [servicesList, setServicesList] = useCategoryServices<PvcService>(
    "pvc-card-print",
    [{ id: "pvc-card-print", name: "PVC CARD PRINT(ALL TYPE)" }],
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
          <linearGradient id="pvcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="18"
          width="40"
          height="26"
          rx="3"
          fill="#FEF3C7"
          stroke="#B45309"
          strokeWidth="1"
          transform="rotate(-8 34 31)"
        />
        <rect
          x="10"
          y="22"
          width="40"
          height="26"
          rx="3"
          fill="white"
          stroke="#D97706"
          strokeWidth="1.2"
        />
        <rect x="11.2" y="23.2" width="37.6" height="3" fill="#F59E0B" />
        <rect x="14" y="29" width="8" height="10" rx="0.5" fill="#FEF3C7" />
        <rect x="25" y="29" width="20" height="1.5" rx="0.5" fill="#E5E7EB" />
        <rect x="25" y="32" width="16" height="1.5" rx="0.5" fill="#E5E7EB" />
        <rect x="25" y="35" width="22" height="1.5" rx="0.5" fill="#E5E7EB" />
        <text
          x="30"
          y="44"
          fill="#B45309"
          fontSize="4.5"
          fontWeight="black"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          PVC CARD
        </text>
      </svg>
    );
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        <ServiceNavigation
          pageName="PVC Card Print"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? "PVC Card Print" : undefined}
        />

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
                  icon={renderServiceIcon("w-16 h-16")}
                  onClick={() => setActiveForm(service.id)}
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
              <PvcCardPrintForm
                cardType={activeForm}
                onCancel={() => setActiveForm(null)}
              />
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
