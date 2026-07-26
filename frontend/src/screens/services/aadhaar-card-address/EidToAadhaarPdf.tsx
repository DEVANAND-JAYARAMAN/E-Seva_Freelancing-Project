import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface EidToAadhaarPdfProps {
  onCancel: () => void;
}

export const EidToAadhaarPdf: React.FC<EidToAadhaarPdfProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: "",
    eidNo: "",
    date: "",
    time: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "eid-to-aadhaar-pdf",
    serviceName: "EID to Adhaar PDF Apply",
    pricingCategoryId: "aadhaar-card-address",
    retailerCharge: 1600,
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
        const rule = {
          required: true,
          requiredMessage: `${name === "eidNo" ? "EID NO" : name.toUpperCase()} is required`,
        };

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

    const fields = [
      { name: "fullName", label: "NAME" },
      { name: "eidNo", label: "EID NO" },
      { name: "date", label: "DATE" },
      { name: "time", label: "TIME" },
    ];

    fields.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name],
        { required: true, requiredMessage: `${f.label} is required` },
        formData,
      );
      if (err) newErrors[f.name] = err;
    });

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
            EID to Adhaar PDF Apply
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Locate and download your Aadhaar Card PDF using 14-digit Enrolment
            ID (EID)
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="aadhaar-card-address"
          serviceId="eid-to-aadhaar-pdf"
          serviceName="EID to Adhaar PDF Apply"
          fallback={1600}
        />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <InputField
              name="fullName"
              label="NAME"
              type="text"
              placeholder="Name As Per EID"
              value={formData.fullName}
              error={errors.fullName}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("fullName", val, file)}
            />
          </div>

          <div>
            <InputField
              name="eidNo"
              label="EID NO"
              type="text"
              placeholder="Enter 14 Digit EID No"
              value={formData.eidNo}
              error={errors.eidNo}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange("eidNo", val.replace(/\D/g, "").slice(0, 14))
              }
            />
          </div>

          <div>
            <InputField
              name="date"
              label="DATE"
              type="text"
              placeholder="DD/MM/YYYY"
              value={formData.date}
              error={errors.date}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("date", val, file)}
            />
          </div>

          <div>
            <InputField
              name="time"
              label="TIME"
              type="text"
              placeholder="00:00:00"
              value={formData.time}
              error={errors.time}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("time", val, file)}
            />
          </div>
        </div>
      </div>

      
      {/* Added Extra Fields */}
      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
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
