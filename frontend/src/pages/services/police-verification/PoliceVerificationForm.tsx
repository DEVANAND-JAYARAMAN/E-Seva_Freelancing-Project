import React, { useState } from "react";
import { InputField, TextAreaField, SubmitButton } from "../form/FormFields";
import { Upload, FileText } from "lucide-react";

interface PoliceVerificationFormProps {
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const PoliceVerificationForm: React.FC<PoliceVerificationFormProps> = ({
  price,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    fatherName: "",
    dob: "",
    mobileNumber: "",
    addressTamil: "",
    addressEnglish: "",
    email: "",
    pincode: "",
    aadhaarCard: "",
    photo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, value: string) => {
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

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.fatherName.trim())
      newErrors.fatherName = "Father Name is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of Birth is required";

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (formData.mobileNumber.replace(/\D/g, "").length !== 10) {
      newErrors.mobileNumber = "Must be a valid 10-digit number";
    }

    if (!formData.addressTamil.trim())
      newErrors.addressTamil = "Address Type In Tamil is required";
    if (!formData.addressEnglish.trim())
      newErrors.addressEnglish = "Address Type In English is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email ID is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Must be a valid email address";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (formData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Must be a valid 6-digit pincode";
    }

    if (!formData.aadhaarCard)
      newErrors.aadhaarCard = "Aadhaar Card upload is required";
    if (!formData.photo) newErrors.photo = "Photo upload is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Police Verification Registration
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit applicant details for Tamil Nadu Police background
            verification
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ {price}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
        {/* Left Column */}
        <div className="space-y-4">
          <InputField
            name="name"
            label="Name"
            type="text"
            placeholder="Name"
            value={formData.name}
            error={errors.name}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("name", val)}
          />

          <InputField
            name="dob"
            label="Date of Birth"
            type="date"
            placeholder=""
            value={formData.dob}
            error={errors.dob}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("dob", val)}
          />

          <TextAreaField
            name="addressTamil"
            label="Address Type In Tamil"
            placeholder="Address Type In Tamil"
            value={formData.addressTamil}
            error={errors.addressTamil}
            disabled={isLoading}
            rows={3}
            onChange={(val) => handleFieldChange("addressTamil", val)}
          />

          <InputField
            name="email"
            label="Email ID"
            type="text"
            placeholder="Email ID"
            value={formData.email}
            error={errors.email}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("email", val)}
          />

          {/* Aadhaar Card Upload (PDF Format Only, with Red Helper Text) */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Aadhaar Card
            </label>
            <div
              className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                errors.aadhaarCard
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80"
              }`}
            >
              <span className="text-xs text-slate-450 truncate flex items-center gap-1.5">
                {formData.aadhaarCard ? (
                  <FileText
                    size={14}
                    className="text-[#005c3a] dark:text-emerald-400"
                  />
                ) : (
                  <Upload size={14} />
                )}
                {formData.aadhaarCard || "No file chosen"}
              </span>
              <label className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 select-none">
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  disabled={isLoading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleFieldChange("aadhaarCard", file ? file.name : "");
                  }}
                />
              </label>
            </div>
            <span className="text-[10px] font-bold text-red-500">
              Aadhaar Card PDF Format Only Upload
            </span>
            {errors.aadhaarCard && (
              <span className="text-[10px] font-bold text-red-500">
                {errors.aadhaarCard}
              </span>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <InputField
            name="fatherName"
            label="Father Name"
            type="text"
            placeholder="Father Name"
            value={formData.fatherName}
            error={errors.fatherName}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("fatherName", val)}
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

          <TextAreaField
            name="addressEnglish"
            label="Address Type In English"
            placeholder="Address Type In English"
            value={formData.addressEnglish}
            error={errors.addressEnglish}
            disabled={isLoading}
            rows={3}
            onChange={(val) => handleFieldChange("addressEnglish", val)}
          />

          <InputField
            name="pincode"
            label="Pincode"
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            error={errors.pincode}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange(
                "pincode",
                val.replace(/\D/g, "").substring(0, 6),
              )
            }
          />

          {/* Photo File Upload */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Photo
            </label>
            <div
              className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                errors.photo
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80"
              }`}
            >
              <span className="text-xs text-slate-450 truncate flex items-center gap-1.5">
                {formData.photo ? (
                  <FileText
                    size={14}
                    className="text-[#005c3a] dark:text-emerald-400"
                  />
                ) : (
                  <Upload size={14} />
                )}
                {formData.photo || "No file chosen"}
              </span>
              <label className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 select-none">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  disabled={isLoading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleFieldChange("photo", file ? file.name : "");
                  }}
                />
              </label>
            </div>
            {errors.photo && (
              <span className="text-[10px] font-bold text-red-500">
                {errors.photo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-880 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton text="Submit" loading={isLoading} disabled={isLoading} />
      </div>
    </form>
  );
};
