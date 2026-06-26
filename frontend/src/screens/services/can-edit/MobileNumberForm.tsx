import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface MobileNumberFormProps {
  onCancel: () => void;
}

export const MobileNumberForm: React.FC<MobileNumberFormProps> = ({
  onCancel,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    canNumber: "",
    newMobile: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (errors[name]) {
        let rule = {};
        if (name === "newMobile") {
          rule = {
            required: true,
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a 10-digit number",
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
        name: "canNumber",
        label: "Can Number",
        rule: { required: true, requiredMessage: "Can Number is required" },
      },
      {
        name: "newMobile",
        label: "New mobile Number",
        rule: {
          required: true,
          pattern: PATTERNS.PHONE,
          patternMessage: "Must be a 10-digit number",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Mobile Number
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Mobile Number services
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {submissionSuccess ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </span>
          <div>
            <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Request Placed Successfully!
            </h5>
            <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
              Your request for **Mobile Number** has been registered. The
              updates will be processed shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <InputField
                  name="canNumber"
                  label="Can Number"
                  type="text"
                  placeholder="Can Number"
                  value={formData.canNumber}
                  error={errors.canNumber}
                  disabled={isSubmitting}
                  onChange={(val, file) => handleFieldChange("canNumber", val, file)}
                />
              </div>

              <div>
                <InputField
                  name="newMobile"
                  label="New mobile Number"
                  type="text"
                  placeholder="New mobile Number"
                  value={formData.newMobile}
                  error={errors.newMobile}
                  disabled={isSubmitting}
                  onChange={(val) =>
                    handleFieldChange(
                      "newMobile",
                      val.replace(/\D/g, "").substring(0, 10),
                    )
                  }
                />
              </div>
            </div>
          </div>

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
              text="Apply"
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </>
      )}
    </form>
  );
};
