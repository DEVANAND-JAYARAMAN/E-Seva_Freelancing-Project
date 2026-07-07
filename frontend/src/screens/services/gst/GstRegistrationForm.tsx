import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import {
  InputField,
  SelectField,
  TextAreaField,
  SubmitButton,
} from "../form/FormFields";

interface GstRegistrationFormProps {
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const GstRegistrationForm: React.FC<GstRegistrationFormProps> = ({
  price,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    tradeName: "",
    mobileNumber: "",
    aadhaarNumber: "",
    panNumber: "",
    businessDetails: "",
    photo: "",
    aadhaarCard: "",
    panCard: "",
    bankPassbook: "",
    businessAddress: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.tradeName.trim())
      newErrors.tradeName = "Trade Name is required";
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (formData.mobileNumber.replace(/\D/g, "").length !== 10) {
      newErrors.mobileNumber = "Must be a valid 10-digit number";
    }
    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = "Aadhaar Number is required";
    } else if (formData.aadhaarNumber.replace(/\D/g, "").length !== 12) {
      newErrors.aadhaarNumber = "Must be a valid 12-digit number";
    }
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = "PAN Number is required";
    } else if (formData.panNumber.length !== 10) {
      newErrors.panNumber = "Must be a valid 10-character PAN";
    }
    if (!formData.businessDetails)
      newErrors.businessDetails = "Business Details selection is required";
    if (!formData.photo) newErrors.photo = "Photo upload is required";
    if (!formData.aadhaarCard)
      newErrors.aadhaarCard = "Aadhaar Card upload is required";
    if (!formData.panCard) newErrors.panCard = "PAN Card upload is required";
    if (!formData.bankPassbook)
      newErrors.bankPassbook = "Bank Pass Book upload is required";
    if (!formData.businessAddress.trim())
      newErrors.businessAddress = "Business Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {/* Form Header matching target design exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            GST Registration
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Register your GST profile with business and identity details
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ {price}
        </div>
      </div>

      {/* 2-Column responsive form body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
        {/* Left Column */}
        <div className="space-y-4">
          <InputField
            name="tradeName"
            label="Trade Name"
            type="text"
            placeholder="Trade Name"
            value={formData.tradeName}
            error={errors.tradeName}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("tradeName", val, file)}
          />

          <InputField
            name="mobileNumber"
            label="Mobile Number"
            type="text"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            error={errors.mobileNumber}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange(
                "mobileNumber",
                val.replace(/\D/g, "").substring(0, 10),
              )
            }
          />

          <InputField
            name="aadhaarNumber"
            label="Aadhaar Number"
            type="text"
            placeholder="Aadhaar Number"
            value={formData.aadhaarNumber}
            error={errors.aadhaarNumber}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange(
                "aadhaarNumber",
                val.replace(/\D/g, "").substring(0, 12),
              )
            }
          />

          <InputField
            name="panNumber"
            label="PAN Number"
            type="text"
            placeholder="Pan Number"
            value={formData.panNumber}
            error={errors.panNumber}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange("panNumber", val.toUpperCase().substring(0, 10))
            }
          />

          <SelectField
            name="businessDetails"
            label="Business Details"
            options={[
              { label: "Proprietorship", value: "Proprietorship" },
              { label: "Partnership", value: "Partnership" },
              {
                label: "Private Limited Company",
                value: "Private Limited Company",
              },
              { label: "LLP / Other", value: "LLP / Other" },
            ]}
            value={formData.businessDetails}
            error={errors.businessDetails}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("businessDetails", val, file)}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <InputField
            name="photo"
            label="Photo"
            type="file"
            value={formData.photo}
            error={errors.photo}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("photo", val, file)}
          />

          <InputField
            name="aadhaarCard"
            label="Aadhaar Card"
            type="file"
            value={formData.aadhaarCard}
            error={errors.aadhaarCard}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("aadhaarCard", val, file)}
          />

          <InputField
            name="panCard"
            label="PAN Card"
            type="file"
            value={formData.panCard}
            error={errors.panCard}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("panCard", val, file)}
          />

          <InputField
            name="bankPassbook"
            label="Bank Pass Book Front Page"
            type="file"
            value={formData.bankPassbook}
            error={errors.bankPassbook}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("bankPassbook", val, file)}
          />

          <TextAreaField
            name="businessAddress"
            label="Business Address"
            placeholder="Business Address"
            value={formData.businessAddress}
            error={errors.businessAddress}
            disabled={isLoading}
            rows={3}
            onChange={(val, file) => handleFieldChange("businessAddress", val, file)}
          />
        </div>
      </div>

      {/* Button Footer matching the exact layout of the target design */}
      
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
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton text="Apply" loading={isLoading} disabled={isLoading} />
      </div>
    </form>
  );
};
