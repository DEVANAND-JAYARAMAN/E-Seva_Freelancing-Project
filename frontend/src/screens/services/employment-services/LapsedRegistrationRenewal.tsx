import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface LapsedRegistrationRenewalProps {
  onCancel: () => void;
}

export const LapsedRegistrationRenewal: React.FC<
  LapsedRegistrationRenewalProps
> = ({ onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    username: "",
    aadhaarNo: "",
    nameAsPerReg: "",
    employmentDocs: "",
    password: "",
    employmentRegNo: "",
    dob: "",
    oldCertificate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "username") {
          rule = { required: true, requiredMessage: "Username is required" };
        } else if (name === "aadhaarNo") {
          rule = {
            required: true,
            requiredMessage: "Aadhaar Number is required",
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a valid 12-digit Aadhaar",
          };
        } else if (name === "nameAsPerReg") {
          rule = {
            required: true,
            requiredMessage: "Name as per Registration is required",
          };
        } else if (name === "employmentDocs") {
          rule = {
            required: true,
            requiredMessage: "Employment Documents upload is required",
          };
        } else if (name === "password") {
          rule = { required: true, requiredMessage: "Password is required" };
        } else if (name === "employmentRegNo") {
          rule = {
            required: true,
            requiredMessage: "Registration Number is required",
          };
        } else if (name === "dob") {
          rule = {
            required: true,
            requiredMessage: "Date of Birth is required",
          };
        } else if (name === "oldCertificate") {
          rule = {
            required: true,
            requiredMessage: "Old Certificate upload is required",
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

    // Validate each field
    const fieldsToValidate = [
      { name: "username", label: "Username" },
      {
        name: "aadhaarNo",
        label: "Aadhaar Number",
        rule: {
          pattern: PATTERNS.AADHAAR,
          patternMessage: "Must be a valid 12-digit Aadhaar number",
        },
      },
      { name: "nameAsPerReg", label: "Name As Per Registration" },
      { name: "employmentDocs", label: "Employment Documents" },
      { name: "password", label: "Password" },
      { name: "employmentRegNo", label: "Employment Registration Number" },
      { name: "dob", label: "Date of Birth" },
      { name: "oldCertificate", label: "Employment Old Certificate" },
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name],
        {
          required: true,
          requiredMessage: `${f.label} is required`,
          ...f.rule,
        },
        formData,
      );
      if (err) newErrors[f.name] = err;
    });

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
            Application Placed Successfully!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your renewal request for **Lapsed Registration Renewal** has been
            registered. The status will update soon.
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
            Lapsed Registration Renewal
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Please enter your registration and demographic details to initiate
            the renewal process
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <InputField
              name="username"
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              error={errors.username}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("username", val, file)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarNo"
              label="Aadhaar Number"
              type="text"
              placeholder="Enter 12-digit Aadhaar Number"
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

          <div>
            <InputField
              name="nameAsPerReg"
              label="Name As Per Registration"
              type="text"
              placeholder="Enter candidate name exactly as in registration"
              value={formData.nameAsPerReg}
              error={errors.nameAsPerReg}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("nameAsPerReg", val, file)}
            />
          </div>

          <div>
            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              error={errors.password}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("password", val, file)}
            />
          </div>

          <div>
            <InputField
              name="employmentRegNo"
              label="Employment Registration Number"
              type="text"
              placeholder="Enter registration number"
              value={formData.employmentRegNo}
              error={errors.employmentRegNo}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("employmentRegNo", val, file)}
            />
          </div>

          {/* Date Picker styled perfectly matching FormFields design */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Date of Birth (DOB)
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              disabled={isSubmitting}
              onChange={(e) => handleFieldChange("dob", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                errors.dob
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
              }`}
            />
            {errors.dob && (
              <span className="text-[10px] font-bold text-red-500">
                {errors.dob}
              </span>
            )}
          </div>

          <div>
            <InputField
              name="employmentDocs"
              label="Employment Documents"
              type="file"
              value={formData.employmentDocs}
              error={errors.employmentDocs}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("employmentDocs", val, file)}
            />
          </div>

          <div>
            <InputField
              name="oldCertificate"
              label="Employment Old Certificate"
              type="file"
              value={formData.oldCertificate}
              error={errors.oldCertificate}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("oldCertificate", val, file)}
            />
          </div>
        </div>
      </div>

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
        <SubmitButton
          text="Renew"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
