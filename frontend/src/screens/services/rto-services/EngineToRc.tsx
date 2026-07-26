import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface EngineToRcProps {
  onCancel: () => void;
}

export const EngineToRc: React.FC<EngineToRcProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    engineNo: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "engine-to-rc",
    serviceName: "Engine Number To Rc Find",
    pricingCategoryId: "rto-services",
    retailerCharge: 120,
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
        let rule = {
          required: true,
          requiredMessage: "Engine Number is required",
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
    const err = validateField(
      "engineNo",
      formData.engineNo,
      { required: true, requiredMessage: "Engine Number is required" },
      formData,
    );
    if (err) newErrors.engineNo = err;

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
            Engine Number To Rc Find
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Locate registration certificate (RC) details using engine number
            verification
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="rto-services"
          serviceId="engine-to-rc"
          serviceName="Engine Number To Rc Find"
          fallback={120}
        />
      </div>

      <div className="space-y-5">
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputField
              name="engineNo"
              label="Engine Number"
              type="text"
              placeholder="Enter Engine Number"
              value={formData.engineNo}
              error={errors.engineNo}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange("engineNo", val.toUpperCase())
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton
          text="Submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
