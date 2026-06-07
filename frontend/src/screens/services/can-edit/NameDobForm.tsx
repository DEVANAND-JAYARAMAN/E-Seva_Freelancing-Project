import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface NameDobFormProps {
  onCancel: () => void;
}

export const NameDobForm: React.FC<NameDobFormProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    district: "",
    name: "",
    canNumber: "",
    dob: "",
    aadhaarFront: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleFieldChange = (name: string, value: string) => {
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
      { name: "district", label: "District" },
      { name: "name", label: "Name" },
      { name: "canNumber", label: "Can Number" },
      { name: "dob", label: "Date of Birth" },
      { name: "aadhaarFront", label: "Aadhaar Card (Front)" },
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
            Name + Date of Birth
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-505 mt-0.5">
            Submit required details to apply for Name + Date of Birth services
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
              Your request for **Name + Date of Birth** has been registered. The
              updates will be processed shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <SelectField
                  name="district"
                  label="District"
                  options={[
                    { label: "Chennai", value: "Chennai" },
                    { label: "Coimbatore", value: "Coimbatore" },
                    { label: "Madurai", value: "Madurai" },
                    { label: "Trichy", value: "Trichy" },
                  ]}
                  value={formData.district}
                  error={errors.district}
                  disabled={isSubmitting}
                  onChange={(val) => handleFieldChange("district", val)}
                />
              </div>

              <div>
                <InputField
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  error={errors.name}
                  disabled={isSubmitting}
                  onChange={(val) => handleFieldChange("name", val)}
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
                  onChange={(val) => handleFieldChange("canNumber", val)}
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                  Date Of Birth
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

              <div className="md:col-span-2">
                <InputField
                  name="aadhaarFront"
                  label="Aadhaar Card (Front)"
                  type="file"
                  value={formData.aadhaarFront}
                  error={errors.aadhaarFront}
                  disabled={isSubmitting}
                  onChange={(val) => handleFieldChange("aadhaarFront", val)}
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
