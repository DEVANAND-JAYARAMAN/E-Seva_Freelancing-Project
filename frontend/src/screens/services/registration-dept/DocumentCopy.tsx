import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import { ServiceMessageManager } from "../../../components/ServiceMessageManager";

interface DocumentCopyProps {
  onCancel: () => void;
}

export const DocumentCopy: React.FC<DocumentCopyProps> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    district: "",
    sro: "",
    docNumber: "",
    year: "",
    aadhaarNo: "",
    cellNo: "",
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
        if (["district", "sro", "docNumber"].includes(name)) {
          rule = { required: true, requiredMessage: "This field is required" };
        } else if (name === "year") {
          rule = { required: true, requiredMessage: "Year is required" };
        } else if (name === "aadhaarNo") {
          rule = { required: true, requiredMessage: "Aadhaar Number is required", pattern: PATTERNS.AADHAAR, patternMessage: "Must be a valid 12-digit Aadhaar" };
        } else if (name === "cellNo") {
          rule = { required: true, requiredMessage: "Cell Number is required", pattern: PATTERNS.PHONE, patternMessage: "Must be a valid 10-digit mobile number" };
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
    const textFields = ["district", "sro", "docNumber"];
    textFields.forEach((field) => {
      const err = validateField(field, formData[field], { required: true, requiredMessage: "This field is required" }, formData);
      if (err) newErrors[field] = err;
    });

    const yearErr = validateField("year", formData.year, { required: true, requiredMessage: "Year is required" }, formData);
    if (yearErr) newErrors.year = yearErr;

    const aadhaarErr = validateField("aadhaarNo", formData.aadhaarNo, { required: true, requiredMessage: "Aadhaar number is required", pattern: PATTERNS.AADHAAR, patternMessage: "Must be exactly 12 digits" }, formData);
    if (aadhaarErr) newErrors.aadhaarNo = aadhaarErr;

    const cellErr = validateField("cellNo", formData.cellNo, { required: true, requiredMessage: "Cell number is required", pattern: PATTERNS.PHONE, patternMessage: "Must be exactly 10 digits" }, formData);
    if (cellErr) newErrors.cellNo = cellErr;

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
            Application Submitted!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your request for **பத்திர நகல் (Document Copy)** has been successfully registered. The document will be prepared and updated soon.
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
            பத்திர நகல் (Document Copy)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Apply online to download a certified copy of your registered land/property documents
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* Red Alert Banner requested in the screenshot / Admin manageable */}
      <ServiceMessageManager 
        serviceId="registration-dept-document-copy" 
        serviceName="Document Copy" 
      />

      {/* 2-Column Form Fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
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
              <InputField
                name="docNumber"
                label="Document Number"
                type="text"
                placeholder="Document No"
                value={formData.docNumber}
                error={errors.docNumber}
                disabled={isSubmitting}
                onChange={(val, file) => handleFieldChange("docNumber", val, file)}
              />
            </div>

            <div>
              <InputField
                name="aadhaarNo"
                label="Aadhaar Number"
                type="text"
                placeholder="Aadhaar Number"
                value={formData.aadhaarNo}
                error={errors.aadhaarNo}
                disabled={isSubmitting}
                onChange={(val) => handleFieldChange("aadhaarNo", val.replace(/\D/g, "").slice(0, 12))}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div>
              <InputField
                name="sro"
                label="Sub-Register Office(SRO)"
                type="text"
                placeholder="Sub-Register Office(SRO)"
                value={formData.sro}
                error={errors.sro}
                disabled={isSubmitting}
                onChange={(val, file) => handleFieldChange("sro", val, file)}
              />
            </div>

            <div>
              <InputField
                name="year"
                label="Year"
                type="text"
                placeholder="Year"
                value={formData.year}
                error={errors.year}
                disabled={isSubmitting}
                onChange={(val) => handleFieldChange("year", val.replace(/\D/g, "").substring(0, 4))}
              />
            </div>

            <div>
              <InputField
                name="cellNo"
                label="Cell Number"
                type="text"
                placeholder="Cell Number"
                value={formData.cellNo}
                error={errors.cellNo}
                disabled={isSubmitting}
                onChange={(val) => handleFieldChange("cellNo", val.replace(/\D/g, "").substring(0, 10))}
              />
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
        <SubmitButton
          text="Request Document"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
