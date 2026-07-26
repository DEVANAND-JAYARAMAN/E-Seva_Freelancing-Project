import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import {
  InputField,
  SubmitButton,
  EditableFormHeader,
} from "../form/FormFields";
import { validateField } from "../form/validators";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";

interface EpicVoterPdfProps {
  onCancel: () => void;
}

const SERVICE_ID = "epic-voter-pdf";
const SERVICE_NAME = "Epic Voter PDF (Without OTP)";
const CATEGORY_ID = "voter-id";
const FALLBACK_PRICE = 40;

export const EpicVoterPdf: React.FC<EpicVoterPdfProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    nameAsPerAadhaar: "",
    epicNo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (errors[name]) {
        const rule = {
          required: true,
          requiredMessage: "This field is required",
        };
        const errorMsg = validateField(name, value, rule, updated);
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          if (errorMsg) next[name] = errorMsg;
          else delete next[name];
          return next;
        });
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const nameErr = validateField(
      "nameAsPerAadhaar",
      formData.nameAsPerAadhaar,
      { required: true, requiredMessage: "Name As Per Aadhaar is required" },
      formData,
    );
    if (nameErr) newErrors.nameAsPerAadhaar = nameErr;

    const epicErr = validateField(
      "epicNo",
      formData.epicNo,
      { required: true, requiredMessage: "Voter Id/EPIC Number is required" },
      formData,
    );
    if (epicErr) newErrors.epicNo = epicErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(false);
    setPaymentPhase("payment");
  };

  if (paymentPhase === "success") {
    return <ServiceSuccessScreen serviceName={SERVICE_NAME} />;
  }

  if (paymentPhase === "payment") {
    return (
      <div className="py-6">
        <ServicePaymentScreen
          serviceId={SERVICE_ID}
          serviceName={SERVICE_NAME}
          retailerCharge={FALLBACK_PRICE}
          pricingCategoryId={CATEGORY_ID}
          formData={formData}
          onBack={() => setPaymentPhase("form")}
          onSuccess={() => {
            setPaymentPhase("success");
            setTimeout(() => {
              setPaymentPhase("form");
              onCancel();
            }, 2500);
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <EditableFormHeader
        defaultTitle="Epic Voter PDF (Without OTP)"
        defaultSubtitle="Download your official Voter card PDF instantly using EPIC number"
        rightContent={
          <ServicePaymentBadge
            pricingCategoryId={CATEGORY_ID}
            serviceId={SERVICE_ID}
            serviceName={SERVICE_NAME}
            fallback={FALLBACK_PRICE}
          />
        }
      />

      <div className="space-y-5">
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <InputField
              name="nameAsPerAadhaar"
              label="Name As Per Aadhaar"
              type="text"
              placeholder="Enter name exactly as in Aadhaar"
              value={formData.nameAsPerAadhaar}
              error={errors.nameAsPerAadhaar}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("nameAsPerAadhaar", val)}
            />
          </div>

          <div>
            <InputField
              name="epicNo"
              label="Voter Id Number/Epic Number"
              type="text"
              placeholder="Enter Voter Id/Epic Number"
              value={formData.epicNo}
              error={errors.epicNo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("epicNo", val.toUpperCase())}
            />
          </div>
        </div>
      </div>

      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {overrides.addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={(field.type as "text" | "number" | "email" | "date" | "file" | "password") || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors && errors[field.name]}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange(field.name, val)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton
          text="Submit Request"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
