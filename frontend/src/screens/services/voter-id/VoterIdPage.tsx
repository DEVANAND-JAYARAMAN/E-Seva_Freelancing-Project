"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState, useEffect } from "react";
import { useCategoryServices } from "../../../hooks/useCategoryServices";
import { Plus } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { EpicVoterPdf } from "./EpicVoterPdf";
import { UpdateCellNumberWithOtp } from "./UpdateCellNumberWithOtp";
import { UpdateCellNumberWithoutOtp } from "./UpdateCellNumberWithoutOtp";
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
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";

interface VoterService {
  id: string;
  name: string;
}

function GenericVoterServiceForm({
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
    applicantName: "",
    mobileNo: "",
    remarks: "",
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = "Name is required";
    }
    if (!formData.mobileNo.trim() || formData.mobileNo.length !== 10) {
      newErrors.mobileNo = "Valid 10-digit mobile number is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setPaymentPhase("payment");
  };

  if (paymentPhase === "success") {
    return <ServiceSuccessScreen serviceName={title} />;
  }

  if (paymentPhase === "payment") {
    return (
      <div className="py-6">
        <ServicePaymentScreen
          serviceId={serviceId}
          serviceName={title}
          retailerCharge={40}
          pricingCategoryId="voter-id"
          formData={{ ...formData, ...customValues }}
          onBack={() => setPaymentPhase("form")}
          onSuccess={() => {
            setPaymentPhase("success");
            setTimeout(() => onCancel(), 2500);
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <EditableFormHeader
        defaultTitle={title}
        defaultSubtitle={`Submit details to apply for ${title}`}
        rightContent={
          <ServicePaymentBadge
            pricingCategoryId="voter-id"
            serviceId={serviceId}
            serviceName={title}
            fallback={40}
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
          name="remarks"
          label="Remarks"
          type="text"
          placeholder="Optional remarks"
          value={formData.remarks}
          disabled={isSubmitting}
          onChange={(val) => setFormData((p) => ({ ...p, remarks: val }))}
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

export function VoterIdPage() {
  const { user } = useAuth();
  const { setFormScope } = useFormEdit();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);

  useEffect(() => {
    setFormScope(activeForm);
    return () => setFormScope(null);
  }, [activeForm, setFormScope]);

  const [voterServicesList, setVoterServicesList] =
    useCategoryServices<VoterService>("voter-id", [
      { id: "epic-voter-pdf", name: "Epic Voter PDF (Without OTP)" },
      { id: "update-cell-one-otp", name: "Update Cell Number (With One OTP)" },
      { id: "update-cell-no-otp", name: "Update Cell Number (Without OTP)" },
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

        setVoterServicesList((prev) => [...prev, { id, name }]);
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

  const handleCardClick = (service: VoterService) => {
    setActiveForm(service.id);
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
        setVoterServicesList((prev) =>
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
        setVoterServicesList((prev) => prev.filter((s) => s.id !== id));
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
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="#13263e"
          stroke="#1f2937"
          strokeWidth="1"
        />
        <path d="M29 44H39V48H29V44Z" fill="white" />
        <path
          d="M24 38C24 38 24 34 26 33C28 32 30 35 30 38"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M26 33C26 31 28 30 29.5 31C31 32 31.5 35 31.5 38"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M29.5 31C29.5 29 31 28 32.5 29C34 30 34 33 34 38"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M34 38V26C34 23.5 37 23.5 37 26V35"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M34 35H37.5V44H29L24 38V44H39V35" fill="white" />
        <circle cx="35.5" cy="22" r="4.5" fill="#ef4444" />
        <circle
          cx="35.5"
          cy="22"
          r="8"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
        />
        <rect x="25" y="44.5" width="14" height="2" rx="0.5" fill="#15803d" />
        <path
          d="M19 43.5L21.5 46L26.5 41"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="34"
          y="45.5"
          fill="white"
          fontSize="6.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          oter
        </text>
      </svg>
    );
  };

  const activeService = voterServicesList.find((s) => s.id === activeForm);
  const getBreadcrumbLabel = () => activeService?.name || "";

  const renderActiveForm = () => {
    if (!activeForm) return null;
    const onCancel = () => setActiveForm(null);

    if (activeForm === "epic-voter-pdf") {
      return <EpicVoterPdf onCancel={onCancel} />;
    }
    if (activeForm === "update-cell-one-otp") {
      return <UpdateCellNumberWithOtp onCancel={onCancel} />;
    }
    if (activeForm === "update-cell-no-otp") {
      return <UpdateCellNumberWithoutOtp onCancel={onCancel} />;
    }

    return (
      <GenericVoterServiceForm
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
          pageName="Voter ID"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={activeForm ? getBreadcrumbLabel() : undefined}
        >
          {isAdmin && !activeForm && (
            <button
              type="button"
              onClick={handleAddService}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none border border-transparent bg-[#005c3a] hover:bg-[#004d30] text-white whitespace-nowrap"
            >
              <Plus size={14} />
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
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none border border-transparent bg-[#005c3a] hover:bg-[#004d30] text-white whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {voterServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-20 h-20")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  logoUrl={service.logoUrl}
                  onEditSave={(data) =>
                    setVoterServicesList((prev) =>
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
