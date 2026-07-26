import React, { useState } from "react";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface CertificateFindFormProps {
  onCancel: () => void;
}

export const CertificateFindForm: React.FC<CertificateFindFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    applicantName: "",
    canNumber: "",
    aadhaarNo: "",
    certificateName: "",
  });

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: "certificate-find",
    serviceName: "Certificate Find",
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
        let rule = {};
        if (name === "aadhaarNo") {
          rule = {
            required: true,
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a 12-digit number",
          };
        } else {
          rule = { required: true, requiredMessage: "This field is required" };
        }
        const err = validateField(name, value, rule, updated);
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
      {
        name: "applicantName",
        label: "Applicant Name",
        rule: { required: true, requiredMessage: "Applicant Name is required" },
      },
      {
        name: "canNumber",
        label: "Can Number",
        rule: { required: true, requiredMessage: "Can Number is required" },
      },
      {
        name: "aadhaarNo",
        label: "Aadhaar Card Number",
        rule: {
          required: true,
          pattern: PATTERNS.AADHAAR,
          patternMessage: "Must be a 12-digit number",
        },
      },
      {
        name: "certificateName",
        label: "Certificate Name",
        rule: {
          required: true,
          requiredMessage: "Certificate Name is required",
        },
      },
    ];

    requiredFields.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name] || "",
        f.rule,
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
            Certificate Find
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Certificate Find services
          </p>
        </div>
        <ServicePaymentBadge
          pricingCategoryId="can-edit"
          serviceId="certificate-find"
          serviceName="Certificate Find"
          fallback={50}
        />
      </div>

      
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <InputField
                  name="applicantName"
                  label="Applicant Name"
                  type="text"
                  placeholder="Enter applicant name"
                  value={formData.applicantName}
                  error={errors.applicantName}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("applicantName", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="canNumber"
                  label="Can Number"
                  type="text"
                  placeholder="Enter Can Number"
                  value={formData.canNumber}
                  error={errors.canNumber}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("canNumber", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="aadhaarNo"
                  label="Aadhaar Card Number"
                  type="text"
                  placeholder="Enter Aadhaar Number"
                  value={formData.aadhaarNo}
                  error={errors.aadhaarNo}
                  disabled={isSubmitting}
                  onChange={(val) =>
                    handleFieldChange(
                      "aadhaarNo",
                      val.replace(/\D/g, "").substring(0, 12),
                    )
                  }
                />
              </div>

              <div>
                <InputField
                  name="certificateName"
                  label="Certificate Name"
                  type="text"
                  placeholder="Enter certificate name"
                  value={formData.certificateName}
                  error={errors.certificateName}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("certificateName", val, file)}
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
