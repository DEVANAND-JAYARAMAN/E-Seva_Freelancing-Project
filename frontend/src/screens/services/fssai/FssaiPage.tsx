"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState, useEffect } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { Plus } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { NewFssaiRegistration } from "./NewFssaiRegistration";
import { ServiceCard } from "../ServiceCard";
import {
  InputField,
  SubmitButton,
  EditableFormHeader,
} from "../form/FormFields";
import { useAuth } from "../../../store/context/AuthContext";
import { useFormEdit } from "../../../store/context/FormEditContext";
import Swal from "sweetalert2";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";

interface FssaiService {
  id: string;
  name: string;
  logoUrl?: string;
}

function GenericFssaiServiceForm({
  title,
  serviceId,
  onCancel,
}: {
  title: string;
  serviceId: string;
  onCancel: () => void;
}) {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    shopName: "",
    mobileNo: "",
    applicantName: "",
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = "Applicant name is required";
    }
    if (!formData.mobileNo.trim() || formData.mobileNo.length !== 10) {
      newErrors.mobileNo = "Valid 10-digit mobile number is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Swal.fire({
        title: "Request Submitted",
        text: `${title} request registered successfully.`,
        icon: "success",
        confirmButtonColor: "#005c3a",
        timer: 1800,
        showConfirmButton: false,
      });
      onCancel();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <EditableFormHeader
        defaultTitle={title}
        defaultSubtitle={`Submit details to apply for ${title}`}
        rightContent={
          <ServicePaymentBadge
            pricingCategoryId="fssai"
            serviceId={serviceId}
            serviceName={title}
            fallback={150}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        <InputField
          name="applicantName"
          label="Applicant Name"
          type="text"
          placeholder="Enter full name"
          value={formData.applicantName}
          error={errors.applicantName}
          disabled={isSubmitting}
          onChange={(val) => {
            setFormData((p) => ({ ...p, applicantName: val }));
            if (errors.applicantName) {
              setErrors((p) => {
                const n = { ...p };
                delete n.applicantName;
                return n;
              });
            }
          }}
        />
        <InputField
          name="mobileNo"
          label="Mobile Number"
          type="text"
          placeholder="10-digit mobile number"
          value={formData.mobileNo}
          error={errors.mobileNo}
          disabled={isSubmitting}
          onChange={(val) => {
            const num = val.replace(/\D/g, "").substring(0, 10);
            setFormData((p) => ({ ...p, mobileNo: num }));
            if (errors.mobileNo) {
              setErrors((p) => {
                const n = { ...p };
                delete n.mobileNo;
                return n;
              });
            }
          }}
        />
        <InputField
          name="shopName"
          label="Shop / Business Name"
          type="text"
          placeholder="Enter shop name"
          value={formData.shopName}
          disabled={isSubmitting}
          onChange={(val) => setFormData((p) => ({ ...p, shopName: val }))}
        />
        {overrides.addedFields?.map((field) => (
          <InputField
            key={field.name}
            name={field.name}
            label={field.label}
            type={(field.type as "text" | "number" | "file") || "text"}
            placeholder={field.placeholder}
            value={customValues[field.name] || ""}
            disabled={isSubmitting}
            onChange={(val) =>
              setCustomValues((prev) => ({ ...prev, [field.name]: val }))
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-900/60 mt-2">
        <SubmitButton
          text={isSubmitting ? "Processing..." : "Submit"}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function FssaiPage() {
  const { user } = useAuth();
  const { setFormScope } = useFormEdit();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    setFormScope(activeForm);
    return () => setFormScope(null);
  }, [activeForm, setFormScope]);

  const [fssaiServicesList, setFssaiServicesList] =
    useCategoryServices<FssaiService>("fssai", [
      {
        id: "new-registration",
        name: "New FSSAI Registration (Food service)",
      },
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

        setFssaiServicesList((prev) => [...prev, { id, name }]);
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

  const handleCardClick = (service: FssaiService) => {
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
        setFssaiServicesList((prev) => prev.filter((s) => s.id !== id));
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
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`fssaiCardBg-${id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFFDF6" />
            <stop offset="100%" stopColor="#FFF9E6" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="10"
          fill={`url(#fssaiCardBg-${id})`}
          stroke="#fef08a"
          strokeWidth="1"
        />
        <path
          d="M14 26C14 21 16 19 19 19H20.5V23.5H19C17.5 23.5 17.5 24.5 17.5 26V29H20.5V33H17.5V45H13.5V33H11.5V29H13.5V26Z"
          fill="#1b4d3e"
        />
        <path
          d="M22.5 37.5C22.5 35 24.5 34.5 26.5 34C28.5 33.5 29.5 33 29.5 31.5C29.5 30 28.5 29.5 27 29.5C25 29.5 24 30.5 23.5 32H20C20.5 28.5 23.5 26 27.5 26C31.5 26 33.5 28 33.5 31C33.5 33.5 31.5 34.5 29.5 35C27.5 35.5 26.5 36 26.5 37.5C26.5 39 27.5 39.5 29.5 39.5C31.5 39.5 32.5 38.5 33 37H36.5C36 40.5 33 43 29 43C25 43 22.5 40.5 22.5 37.5Z"
          fill="#1b4d3e"
        />
        <path
          d="M38.5 37C38.5 33.5 40.5 32 44.5 31.5L46.5 31.2V30.5C46.5 29.5 45.5 29 44 29C42.5 29 42 29.5 41.5 31H38C38.5 28 41 26 44.5 26C48.5 26 50.5 28 50.5 31V43H47V40.5C46.5 42 44.5 43.5 42.5 43.5C39.5 43.5 38.5 40.5 38.5 37ZM46.5 35.5V34L44.5 34.2C42.5 34.5 42 35.5 42 37C42 38.5 42.5 39.5 44 39.5C45.5 39.5 46.5 38.5 46.5 35.5Z"
          fill="#1b4d3e"
        />
        <path d="M53.5 28.5H57.5V43H53.5V28.5Z" fill="#ea580c" />
        <path
          d="M57.5 25C57.5 25 58.5 21.5 56.5 19.5C54.5 17.5 51 18.5 51 18.5C51 18.5 53 21 55 22C57 23 57.5 25 57.5 25Z"
          fill="#166534"
        />
        <rect x="11.5" y="46" width="46" height="2" fill="#166534" />
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
          {id === "new-registration" ? "REGISTRATION" : "SERVICE"}
        </text>
      </svg>
    );
  };

  const activeService = fssaiServicesList.find((s) => s.id === activeForm);

  const renderActiveForm = () => {
    if (!activeForm) return null;
    const onCancel = () => setActiveForm(null);

    if (activeForm === "new-registration") {
      return <NewFssaiRegistration onCancel={onCancel} />;
    }

    return (
      <GenericFssaiServiceForm
        title={activeService?.name || "New Service"}
        serviceId={activeForm}
        onCancel={onCancel}
      />
    );
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        <ServiceNavigation
          pageName="FSSAI"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeService?.name}
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
              {fssaiServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setFssaiServicesList((prev) =>
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
            <div className="w-full bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden animate-in fade-in duration-200">
              {renderActiveForm()}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
