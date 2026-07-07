import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface UpdateCellNumberWithOtpProps {
  onCancel: () => void;
}

export const UpdateCellNumberWithOtp: React.FC<UpdateCellNumberWithOtpProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    epicNo: "",
    nameAsPerAadhaar: "",
    mobileNo: "",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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
        } else if (name === "otp") {
          rule = { required: true, requiredMessage: "OTP is required" };
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

  const handleSendOtp = () => {
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

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
    }, 1000);
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

    const otpErr = validateField("otp", formData.otp, { required: true, requiredMessage: "OTP is required" }, formData);
    if (otpErr) newErrors.otp = otpErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        onCancel();
      }, 2500);
    }, 1500);
  };

  if (submissionSuccess) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
          <CheckCircle2 size={44} className="stroke-[2.5]" />
        </span>
        <div>
          <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Mobile Number Updated!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your request to **Update Cell Number (With One OTP)** has been successfully processed and verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form Header matching layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Update Cell Number (With One OTP)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Link or change your registered mobile number with secure OTP verification
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <InputField
              name="epicNo"
              label="Voter Id Number/Epic Number"
              type="text"
              placeholder="Voter Id Number/Epic Number"
              value={formData.epicNo}
              error={errors.epicNo}
              disabled={isSubmitting || otpSent}
              onChange={(val) => handleFieldChange("epicNo", val.toUpperCase())}
            />
          </div>

          <div>
            <InputField
              name="nameAsPerAadhaar"
              label="Name As Per Aadhaar"
              type="text"
              placeholder="Name"
              value={formData.nameAsPerAadhaar}
              error={errors.nameAsPerAadhaar}
              disabled={isSubmitting || otpSent}
              onChange={(val, file) => handleFieldChange("nameAsPerAadhaar", val, file)}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <InputField
                  name="mobileNo"
                  label="Mobile Number"
                  type="text"
                  placeholder="Mobile Number"
                  value={formData.mobileNo}
                  error={errors.mobileNo}
                  disabled={isSubmitting || otpSent}
                  onChange={(val) => handleFieldChange("mobileNo", val.replace(/\D/g, "").substring(0, 10))}
                />
              </div>

              {otpSent && (
                <div>
                  <InputField
                    name="otp"
                    label="One Time Password (OTP)"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    error={errors.otp}
                    disabled={isSubmitting}
                    onChange={(val) => handleFieldChange("otp", val.replace(/\D/g, "").substring(0, 6))}
                  />
                </div>
              )}
            </div>

            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 leading-relaxed">
              வாக்காளர் அட்டையுடன் இணைக்க வேண்டிய செல் நம்பருக்கு வரும் OTP யை கொடுக்க வேண்டும். ஒத்துழைப்பு தரும் பட்சத்தில் உடனடியாக இணைத்து தரப்படும்.
            </div>
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 select-none"
          >
            Send OTP
          </button>
        ) : (
          <SubmitButton
            text="Verify & Update"
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        )}
      </div>
    </form>
  );
};
