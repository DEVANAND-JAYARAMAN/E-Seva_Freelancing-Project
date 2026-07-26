import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface NameCorrectionFormProps {
  onCancel: () => void;
}

export const NameCorrectionForm: React.FC<NameCorrectionFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    canNumber: "",
    newNameEnglish: "",
    newNameTamil: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "name-correction",
    serviceName: "Name Correction",
    pricingCategoryId: "can-edit",
    retailerCharge: 50,
    formData,
    onDone: onCancel,
  });

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (errors[name]) {
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          delete next[name];
          return next;
        });
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const requiredFields = [
      { name: "canNumber", label: "Can Number" },
      { name: "newNameEnglish", label: "New Name English" },
      { name: "newNameTamil", label: "New Name Tamil" },
    ].filter((f) => !(overrides.deletedFields || []).includes(f.name));

    requiredFields.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name] || "",
        { required: true, requiredMessage: `${f.label} is required` },
        formData,
      );
      if (err) newErrors[f.name] = err;
    });

    // Also require any admin-added fields that are visible
    (overrides.addedFields || []).forEach((field) => {
      const err = validateField(
        field.name,
        formData[field.name] || "",
        { required: true, requiredMessage: `${field.label} is required` },
        formData,
      );
      if (err) newErrors[field.name] = err;
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
            Name Correction
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Name Correction services
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="can-edit"
          serviceId="name-correction"
          serviceName="Name Correction"
          fallback={50}
        />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            name="canNumber"
            label="Can Number"
            type="text"
            placeholder="Enter Can Number"
            value={formData.canNumber}
            error={errors.canNumber}
            onChange={(val) => handleFieldChange("canNumber", val)}
          />
          <InputField
            name="newNameEnglish"
            label="New Name English"
            type="text"
            placeholder="Enter new name in English"
            value={formData.newNameEnglish}
            error={errors.newNameEnglish}
            onChange={(val) => handleFieldChange("newNameEnglish", val)}
          />
          <InputField
            name="newNameTamil"
            label="New Name Tamil"
            type="text"
            placeholder="புதிய பெயர் தமிழில்"
            value={formData.newNameTamil}
            error={errors.newNameTamil}
            onChange={(val) => handleFieldChange("newNameTamil", val)}
          />
        </div>
      </div>

      {overrides.addedFields && overrides.addedFields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {overrides.addedFields.map((field) => (
            <InputField
              key={field.name}
              name={field.name}
              label={field.label}
              type={
                (field.type as "text" | "number" | "email" | "date" | "file") ||
                "text"
              }
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              error={errors[field.name]}
              onChange={(val) => handleFieldChange(field.name, val)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all select-none"
        >
          Cancel
        </button>
        <SubmitButton text="Apply" hideEditButton />
      </div>
    </form>
  );
};
