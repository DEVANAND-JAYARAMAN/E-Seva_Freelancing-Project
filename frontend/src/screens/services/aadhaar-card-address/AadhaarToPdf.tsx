import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";

interface AadhaarToPdfProps {
  onCancel: () => void;
}

export const AadhaarToPdf: React.FC<AadhaarToPdfProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: "",
    aadhaarNo: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "aadhaar-main",
    serviceName: "Adhaar Number to Adhaar PDF Apply",
    pricingCategoryId: "aadhaar-card-address",
    retailerCharge: 80,
    formData,
    
    onDone: onCancel,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "aadhaarNo") {
          rule = {
            required: true,
            requiredMessage: "Aadhaar Number is required",
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a valid 12-digit Aadhaar number",
          };
        } else if (name === "fullName") {
          rule = { required: true, requiredMessage: "Name is required" };
        }

        const errorMsg = validateField(name, value, rule, updated);
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          if (errorMsg) {
            next[name] = errorMsg;
          } else {
            delete next[name];
          }
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
      "fullName",
      formData.fullName,
      { required: true, requiredMessage: "Name is required" },
      formData,
    );
    if (nameErr) newErrors.fullName = nameErr;

    const aadhaarErr = validateField(
      "aadhaarNo",
      formData.aadhaarNo,
      {
        required: true,
        requiredMessage: "Aadhaar Number is required",
        pattern: PATTERNS.AADHAAR,
        patternMessage: "Must be exactly 12 digits",
      },
      formData,
    );
    if (aadhaarErr) newErrors.aadhaarNo = aadhaarErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startPayment();
  };

    if (!isForm) return paymentView;


    return (


      <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Adhaar Number to Adhaar PDF Apply
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Locate and download your Aadhaar Card PDF using your 12-digit
            Aadhaar Number
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="aadhaar-card-address"
          serviceId="aadhaar-main"
          serviceName="Adhaar Number to Adhaar PDF Apply"
          fallback={80}
        />
      </div>

      <div className="space-y-5">
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <InputField
              name="fullName"
              label="ENTER NAME"
              type="text"
              placeholder="Name As Per Aadhaar"
              value={formData.fullName}
              error={errors.fullName}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("fullName", val, file)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarNo"
              label="ENTER AADHAAR NUMBER"
              type="text"
              placeholder="Enter 12 Digit Aadhar"
              value={formData.aadhaarNo}
              error={errors.aadhaarNo}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange(
                  "aadhaarNo",
                  val.replace(/\D/g, "").slice(0, 12),
                )
              }
            />
          </div>
        </div>
      </div>

      
      {/* Added Extra Fields */}
      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {overrides.addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={(field.type as any) || "text"}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors && errors[field.name]}
              disabled={isSubmitting}
              onChange={(val, file) => {
                handleFieldChange(field.name, val, file);
              }}
            />
          ))}
        </div>
      )}
<div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton
          text="Apply"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
