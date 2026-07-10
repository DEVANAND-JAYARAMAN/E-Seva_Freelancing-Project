import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { Download } from "lucide-react";
import {
  InputField,
  SelectField,
  PhoneField,
  SubmitButton,
} from "../form/FormFields";

interface CmHealthCardFormProps {
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const CmHealthCardForm: React.FC<CmHealthCardFormProps> = ({
  price = 200,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    smartcardNo: "",
    aadhaarNo: "",
    cellNo: "",
    pincode: "",
    familyRelationName: "",
    maritalStatus: "",
    vaoCertificateFile: "",
    smartcardFile: "",
    aadhaarCardFile: "",
    livePhotoFile: "",
    passportPhotoFile: "",
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

    if (!formData.smartcardNo.trim())
      newErrors.smartcardNo = "Smartcard Number is required";
    if (!formData.aadhaarNo.trim()) {
      newErrors.aadhaarNo = "Aadhaar Number is required";
    } else if (formData.aadhaarNo.replace(/\D/g, "").length !== 12) {
      newErrors.aadhaarNo = "Must be a valid 12-digit Aadhaar number";
    }
    if (!formData.cellNo.trim()) {
      newErrors.cellNo = "Cell Number is required";
    } else if (formData.cellNo.replace(/\D/g, "").length !== 10) {
      newErrors.cellNo = "Must be a valid 10-digit mobile number";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pin Code is required";
    } else if (formData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Must be a valid 6-digit pincode";
    }
    if (!formData.familyRelationName)
      newErrors.familyRelationName = "Relation Name is required";
    if (!formData.maritalStatus)
      newErrors.maritalStatus = "Marital Status is required";

    if (!formData.vaoCertificateFile)
      newErrors.vaoCertificateFile = "VAO Certificate is required";
    if (!formData.smartcardFile)
      newErrors.smartcardFile = "Smart card upload is required";
    if (!formData.aadhaarCardFile)
      newErrors.aadhaarCardFile = "Aadhaar card upload is required";
    if (!formData.livePhotoFile)
      newErrors.livePhotoFile = "Live Photo is required";
    if (!formData.passportPhotoFile)
      newErrors.passportPhotoFile = "Passport Photo is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 w-full text-slate-800 dark:text-slate-200"
    >
      {/* Form Header matching MSME Registration layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
            CM Health Card
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit your profile details to verify and apply for Chief Minister
            Comprehensive Health Insurance Scheme
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ {price.toFixed(2)}
        </div>
      </div>

      {/* Section 1: Basic Details */}
      <div className="space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-900/60 pb-2 text-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
            Basic Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* VAO Certificate Template Download */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              VAO Certificate Template
            </label>
            <div>
              <a
                href="/assets/vao_certificate_template.pdf"
                download
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-550 hover:bg-red-650 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 select-none"
              >
                <Download size={14} />
                <span>Download Template PDF</span>
              </a>
            </div>
          </div>

          <InputField
            name="smartcardNo"
            label="Smartcard Number"
            type="text"
            placeholder="Enter Smartcard Number"
            value={formData.smartcardNo}
            error={errors.smartcardNo}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("smartcardNo", val, file)}
          />

          <InputField
            name="aadhaarNo"
            label="Aadhaar Number"
            type="text"
            placeholder="Enter 12-digit Aadhaar Number"
            value={formData.aadhaarNo}
            error={errors.aadhaarNo}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange(
                "aadhaarNo",
                val.replace(/\D/g, "").substring(0, 12),
              )
            }
          />

          <PhoneField
            name="cellNo"
            label="Cell Number"
            placeholder="Enter contact mobile number"
            value={formData.cellNo}
            error={errors.cellNo}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("cellNo", val, file)}
          />

          <InputField
            name="pincode"
            label="Pin Code"
            type="text"
            placeholder="Enter 6-digit pin code"
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

          <SelectField
            name="familyRelationName"
            label="குடும்ப உறுப்பினரின் தந்தை அல்லது கணவர் பெயர்"
            options={[
              { label: "Father", value: "Father" },
              { label: "Husband", value: "Husband" },
            ]}
            value={formData.familyRelationName}
            error={errors.familyRelationName}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("familyRelationName", val, file)}
          />

          <SelectField
            name="maritalStatus"
            label="Marital Status"
            options={[
              { label: "Single", value: "Single" },
              { label: "Married", value: "Married" },
              { label: "Divorced", value: "Divorced" },
              { label: "Widowed", value: "Widowed" },
            ]}
            value={formData.maritalStatus}
            error={errors.maritalStatus}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("maritalStatus", val, file)}
          />
        </div>
      </div>

      {/* Section 2: Document Uploads */}
      <div className="space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-900/60 pb-2 text-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
            Document Uploads
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            name="vaoCertificateFile"
            label="VAO Certificate / Income Certificate (1,20,000)"
            type="file"
            value={formData.vaoCertificateFile}
            error={errors.vaoCertificateFile}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("vaoCertificateFile", val, file)}
          />

          <InputField
            name="smartcardFile"
            label="Smart card"
            type="file"
            value={formData.smartcardFile}
            error={errors.smartcardFile}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("smartcardFile", val, file)}
          />

          <InputField
            name="aadhaarCardFile"
            label="Aadhaar Card (Front & Back)"
            type="file"
            value={formData.aadhaarCardFile}
            error={errors.aadhaarCardFile}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("aadhaarCardFile", val, file)}
          />

          <InputField
            name="livePhotoFile"
            label="Live Photo (Family Members)"
            type="file"
            value={formData.livePhotoFile}
            error={errors.livePhotoFile}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("livePhotoFile", val, file)}
          />

          <InputField
            name="passportPhotoFile"
            label="Passport Size Photo"
            type="file"
            value={formData.passportPhotoFile}
            error={errors.passportPhotoFile}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("passportPhotoFile", val, file)}
          />
        </div>
      </div>

      {/* Button Footer matching MSME dynamic form styling exactly */}
      
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
              disabled={isLoading}
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton text="Apply" loading={isLoading} disabled={isLoading} />
      </div>
    </form>
  );
};
