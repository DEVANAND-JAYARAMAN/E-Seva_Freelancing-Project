import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SubmitButton, EditableFormHeader } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";

interface UpdateCellNumberWithoutOtpProps {
  onCancel: () => void;
}

export const UpdateCellNumberWithoutOtp: React.FC<UpdateCellNumberWithoutOtpProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    epicNo: "",
    nameAsPerAadhaar: "",
    mobileNo: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "update-cell-no-otp",
    serviceName: "Update Cell Number (Without OTP)",
    pricingCategoryId: "voter-id",
    retailerCharge: 40,
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
        if (name === "epicNo") {
          rule = { required: true, requiredMessage: "Voter Id/EPIC Number is required" };
        } else if (name === "nameAsPerAadhaar") {
          rule = { required: true, requiredMessage: "Name As Per Aadhaar is required" };
        } else if (name === "mobileNo") {
          rule = { required: true, requiredMessage: "Mobile number is required", pattern: PATTERNS.PHONE, patternMessage: "Must be a valid 10-digit number" };
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
    
    const epicErr = validateField("epicNo", formData.epicNo, { required: true, requiredMessage: "Voter Id/EPIC Number is required" }, formData);
    if (epicErr) newErrors.epicNo = epicErr;

    const nameErr = validateField("nameAsPerAadhaar", formData.nameAsPerAadhaar, { required: true, requiredMessage: "Name As Per Aadhaar is required" }, formData);
    if (nameErr) newErrors.nameAsPerAadhaar = nameErr;

    const mobileErr = validateField("mobileNo", formData.mobileNo, { required: true, requiredMessage: "Mobile number is required", pattern: PATTERNS.PHONE, patternMessage: "Must be 10 digits" }, formData);
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
      {/* Form Header matching layout exactly */}
      <EditableFormHeader
        defaultTitle="Update Cell Number (Without OTP)"
        defaultSubtitle="Link your mobile number with your EPIC card directly without OTP (background verification)"
        rightContent={
          <ServicePaymentBadge
            pricingCategoryId="voter-id"
            serviceId="update-cell-no-otp"
            serviceName="Update Cell Number (Without OTP)"
            fallback={40}
          />
        }
      />

      {/* Form Fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <InputField
              name="epicNo"
              label="Voter Id Number/Epic Number"
              type="text"
              placeholder="Voter Id Number/Epic Number"
              value={formData.epicNo}
              error={errors.epicNo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("epicNo", val.toUpperCase())}
            />
          </div>

          <div>
            <InputField
              name="nameAsPerAadhaar"
              label="Name As Per Aadhaar"
              type="text"
              placeholder="Enter name exactly as in Aadhaar"
              value={formData.nameAsPerAadhaar}
              error={errors.nameAsPerAadhaar}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("nameAsPerAadhaar", val, file)}
            />
          </div>

          <div>
            <InputField
              name="mobileNo"
              label="Mobile Number"
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobileNo}
              error={errors.mobileNo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("mobileNo", val.replace(/\D/g, "").substring(0, 10))}
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
          text="Update Number"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
