import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { PhoneField, SubmitButton, InputField } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface MobileToMsmeUdhayamFindProps {
  onCancel: () => void;
}

export const MobileToMsmeUdhayamFind: React.FC<
  MobileToMsmeUdhayamFindProps
> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    mobileNo: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "msme-mobile",
    serviceName: "Mobile To Msme Udhayam Find",
    pricingCategoryId: "msme",
    retailerCharge: 200,
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
        if (name === "mobileNo") {
          rule = {
            required: true,
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit number",
          };
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

    // Mobile No validation
    const mobileErr = validateField(
      "mobileNo",
      formData.mobileNo,
      {
        required: true,
        requiredMessage: "Mobile Number is required",
        pattern: PATTERNS.PHONE,
        patternMessage: "Must be a valid 10-digit number",
      },
      formData,
    );
    if (mobileErr) newErrors.mobileNo = mobileErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startPayment();
  };

    if (!isForm) return paymentView;


    return (


      <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form Header matching PAN Finder layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Mobile To Msme Udhayam Find
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Locate your Udyam Registration records by verifying Mobile Number
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="msme"
          serviceId="msme-mobile"
          serviceName="Mobile To Msme Udhayam Find"
          fallback={200}
        />
      </div>

      {/* Form Sections */}
      <div className="space-y-5">
        <div data-form-fields-grid className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <PhoneField
              name="mobileNo"
              label="Mobile Number"
              placeholder="Enter registered mobile number"
              value={formData.mobileNo}
              error={errors.mobileNo}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("mobileNo", val, file)}
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
              onChange={(val: string, file?: File) => {
                handleFieldChange(field.name, val, file);
              }}
            />
          ))}
        </div>
      )}
{/* Button Footer */}
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
