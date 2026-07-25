"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { EditableFormHeader, InputField, SubmitButton } from "./FormFields";

export function GenericServiceForm({
  title,
  onCancel,
}: {
  title: string;
  onCancel: () => void;
}) {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    applicantName: "",
    mobileNo: "",
    remarks: "",
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = "Name is required";
    }
    if (!formData.mobileNo.trim() || formData.mobileNo.length !== 10) {
      newErrors.mobileNo = "Valid 10-digit mobile number is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Swal.fire({
        title: "Request Submitted",
        text: `${title} request registered successfully.`,
        icon: "success",
        confirmButtonColor: "#005c3a",
        timer: 1800,
        showConfirmButton: false,
      });
      onCancel();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <EditableFormHeader
        defaultTitle={title}
        defaultSubtitle={`Submit details to apply for ${title}`}
        rightContent="Service Payment : ₹ 0"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        <InputField
          name="applicantName"
          label="Applicant Name"
          type="text"
          placeholder="Enter full name"
          value={formData.applicantName}
          error={errors.applicantName}
          disabled={isSubmitting}
          onChange={(val) => {
            setFormData((p) => ({ ...p, applicantName: val }));
            if (errors.applicantName) {
              setErrors((p) => {
                const n = { ...p };
                delete n.applicantName;
                return n;
              });
            }
          }}
        />
        <InputField
          name="mobileNo"
          label="Mobile Number"
          type="text"
          placeholder="10-digit mobile number"
          value={formData.mobileNo}
          error={errors.mobileNo}
          disabled={isSubmitting}
          onChange={(val) => {
            const num = val.replace(/\D/g, "").substring(0, 10);
            setFormData((p) => ({ ...p, mobileNo: num }));
            if (errors.mobileNo) {
              setErrors((p) => {
                const n = { ...p };
                delete n.mobileNo;
                return n;
              });
            }
          }}
        />
        <InputField
          name="remarks"
          label="Remarks"
          type="text"
          placeholder="Optional remarks"
          value={formData.remarks}
          disabled={isSubmitting}
          onChange={(val) => setFormData((p) => ({ ...p, remarks: val }))}
        />
        {overrides.addedFields?.map((field) => (
          <InputField
            key={field.name}
            name={field.name}
            label={field.label}
            type={(field.type as "text" | "number" | "file") || "text"}
            placeholder={field.placeholder}
            value={customValues[field.name] || ""}
            disabled={isSubmitting}
            onChange={(val) =>
              setCustomValues((prev) => ({ ...prev, [field.name]: val }))
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-900/60 mt-2">
        <SubmitButton
          text={isSubmitting ? "Processing..." : "Submit"}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
