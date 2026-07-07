import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { validateField } from "../form/validators";

interface NameCorrectionFormProps {
  onCancel: () => void;
}

export const NameCorrectionForm: React.FC<NameCorrectionFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    district: "",
    candidateName: "",
    panNumber: "",
    aadhaarFront: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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
      { name: "district", label: "District" },
      { name: "candidateName", label: "Name" },
      { name: "panNumber", label: "PAN Number" },
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

  if (submissionSuccess) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
          <CheckCircle2 size={44} className="stroke-[2.5]" />
        </span>
        <div>
          <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Request Placed Successfully!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your request for **Name Correction** has been registered. The
            updates will be processed shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Name Correction
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for Name Correction services
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <SelectField
              name="district"
              label="District"
              options={[
                         { label: "Ariyalur", value: "Ariyalur" },
                         { label: "Chengalpattu", value: "Chengalpattu" },
                         { label: "Chennai", value: "Chennai" },
                         { label: "Coimbatore", value: "Coimbatore" },
                         { label: "Cuddalore", value: "Cuddalore" },
                         { label: "Dharmapuri", value: "Dharmapuri" },
                         { label: "Dindigul", value: "Dindigul" },
                         { label: "Erode", value: "Erode" },
                         { label: "Kallakurichi", value: "Kallakurichi" },
                         { label: "Kanchipuram", value: "Kanchipuram" },
                         { label: "Kanyakumari", value: "Kanyakumari" },
                         { label: "Karur", value: "Karur" },
                         { label: "Krishnagiri", value: "Krishnagiri" },
                         { label: "Madurai", value: "Madurai" },
                         { label: "Mayiladuthurai", value: "Mayiladuthurai" },
                         { label: "Nagapattinam", value: "Nagapattinam" },
                         { label: "Namakkal", value: "Namakkal" },
                         { label: "Nilgiris", value: "Nilgiris" },
                         { label: "Perambalur", value: "Perambalur" },
                         { label: "Pudukkottai", value: "Pudukkottai" },
                         { label: "Ramanathapuram", value: "Ramanathapuram" },
                         { label: "Ranipet", value: "Ranipet" },
                         { label: "Salem", value: "Salem" },
                         { label: "Sivaganga", value: "Sivaganga" },
                         { label: "Tenkasi", value: "Tenkasi" },
                         { label: "Thanjavur", value: "Thanjavur" },
                         { label: "Theni", value: "Theni" },
                         { label: "Thoothukudi", value: "Thoothukudi" },
                         { label: "Tiruchirappalli (Trichy)", value: "Tiruchirappalli" },
                         { label: "Tirunelveli", value: "Tirunelveli" },
                         { label: "Tirupathur", value: "Tirupathur" },
                         { label: "Tiruppur", value: "Tiruppur" },
                         { label: "Tiruvallur", value: "Tiruvallur" },
                         { label: "Tiruvannamalai", value: "Tiruvannamalai" },
                         { label: "Tiruvarur", value: "Tiruvarur" },
                         { label: "Vellore", value: "Vellore" },
                         { label: "Viluppuram", value: "Viluppuram" },
                         { label: "Virudhunagar", value: "Virudhunagar" }
                       ]}
              value={formData.district}
              error={errors.district}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("district", val, file)}
            />
          </div>

          <div>
            <SelectField
              name="candidateName"
              label="Name"
              options={[]}
              value={formData.candidateName}
              error={errors.candidateName}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("candidateName", val, file)}
            />
          </div>

          <div>
            <InputField
              name="panNumber"
              label="PAN Number"
              type="text"
              placeholder="Enter PAN Number"
              value={formData.panNumber}
              error={errors.panNumber}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("panNumber", val, file)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarFront"
              label="Aadhaar Card (Front)"
              type="file"
              value={formData.aadhaarFront}
              error={errors.aadhaarFront}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("aadhaarFront", val, file)}
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
    </form>
  );
};
