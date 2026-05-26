import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface AdhaarToRationProps {
  onCancel: () => void;
}

export const AdhaarToRation: React.FC<AdhaarToRationProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    adhaarNo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "adhaarNo") {
          rule = { required: true, pattern: PATTERNS.AADHAAR, patternMessage: "Must be a valid 12-digit Adhaar" };
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
    
    // Adhaar No validation
    const adhaarErr = validateField("adhaarNo", formData.adhaarNo, {
      required: true,
      requiredMessage: "Adhaar Number is required",
      pattern: PATTERNS.AADHAAR,
      patternMessage: "Must be a valid 12-digit Adhaar",
    }, formData);
    if (adhaarErr) newErrors.adhaarNo = adhaarErr;

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
            Search Placed Successfully!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your search request for **Adhaar To Ration Number Find** has been registered. The results will be updated soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form Header matching Mobile Finder layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Adhaar To Ration Number Find
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Locate your Ration Card details by verifying Adhaar Number
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <InputField
              name="adhaarNo"
              label="Adhaar Number"
              type="text"
              placeholder="Enter 12-digit Adhaar number"
              value={formData.adhaarNo}
              onChange={(e) => handleFieldChange(e.target.name, e.target.value)}
              error={errors.adhaarNo}
              disabled={isSubmitting}
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
          text="Search Details"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
