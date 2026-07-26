import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface ReturnAppRemovedFormProps {
  onCancel: () => void;
}

export const ReturnAppRemovedForm: React.FC<ReturnAppRemovedFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    tamilName: "",
    aadhaarCard: "",
    nameEnglish: "",
    smartCard: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "return-app-removed",
    serviceName: "Return Application Removed",
    pricingCategoryId: "can-edit",
    retailerCharge: 50,
    formData,
    
    onDone: onCancel,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (errors[name]) {
        const err = validateField(
          name,
          value,
          { required: true, requiredMessage: "This field is required" },
          updated,
        );
        setErrors((prevErrors) => {
          const next = { ...prevErrors };
          if (err) {
            next[name] = err;
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

    const requiredFields = [
      { name: "tamilName", label: "பெயர் தமிழில்" },
      { name: "aadhaarCard", label: "Aadhaar Card" },
      { name: "nameEnglish", label: "Name English" },
      { name: "smartCard", label: "Smart Card" },
    ];

    requiredFields.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name] || "",
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
            Return Application Removed
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Return Application Removed
            services
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="can-edit"
          serviceId="return-app-removed"
          serviceName="Return Application Removed"
          fallback={50}
        />
      </div>

      
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <InputField
                  name="tamilName"
                  label="பெயர் தமிழில்"
                  type="text"
                  placeholder="பெயர் தமிழில்"
                  value={formData.tamilName}
                  error={errors.tamilName}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("tamilName", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="nameEnglish"
                  label="Name English"
                  type="text"
                  placeholder="Name English"
                  value={formData.nameEnglish}
                  error={errors.nameEnglish}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("nameEnglish", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="aadhaarCard"
                  label="Aadhaar Card"
                  type="file"
                  value={formData.aadhaarCard}
                  error={errors.aadhaarCard}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("aadhaarCard", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="smartCard"
                  label="Smart Card"
                  type="file"
                  value={formData.smartCard}
                  error={errors.smartCard}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("smartCard", val, file)}
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
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
            >
              Cancel
            </button>
            <SubmitButton
              text="Apply"
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </>
      
    </form>
  );
};
