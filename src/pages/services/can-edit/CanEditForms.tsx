import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, SelectField, TextAreaField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import { NewCanRegistrationForm } from "./NewCanRegistrationForm";

interface CanEditFormsProps {
  serviceId: string;
  serviceName: string;
  onCancel: () => void;
}

export const CanEditForms: React.FC<CanEditFormsProps> = ({ serviceId, serviceName, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Define which fields are needed for each service ID
  const getFieldsForService = () => {
    switch (serviceId) {
      case "new-can-reg":
        return [
          { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter candidate full name" },
          { name: "dob", label: "Date of Birth", type: "date" },
          { name: "mobileNo", label: "Mobile Number", type: "phone" },
          { name: "aadhaarNo", label: "Aadhaar Number", type: "aadhaar" },
          { name: "fatherName", label: "Father Name", type: "text", placeholder: "Enter father name" },
          { name: "address", label: "Full Address", type: "textarea" },
        ];
      case "name-correction":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "candidateName", label: "Name", type: "select", options: [] },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
        ];
      case "dob-correction":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "dob", label: "DOB", type: "text", placeholder: "ddmmyyyy (e.g. 05041997)" },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
        ];
      case "mobile-number":
        return [
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "newMobile", label: "New mobile Number", type: "phone" },
        ];
      case "certificate-find":
        return [
          { name: "applicantName", label: "Applicant Name", type: "text", placeholder: "Enter applicant name" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "aadhaarNo", label: "Aadhaar Number", type: "aadhaar" },
          { name: "certificateName", label: "Certificate Name", type: "text", placeholder: "Enter certificate name" },
        ];
      case "legal-heir-cert-no":
        return [
          { name: "applicantName", label: "Applicant Name", type: "text", placeholder: "Enter applicant name" },
          { name: "aadhaarCard", label: "Aadhaar Card (Front & Back)", type: "file" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "legalHeirCertificateNumber", label: "Legal Heir Certificate Number", type: "text", placeholder: "Enter legal heir certificate number" },
        ];
      case "find-can-number":
        return [
          { name: "aadhaarNo", label: "Aadhaar Number", type: "aadhaar" },
        ];
      case "name-cell-number":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "name", label: "Name", type: "text", placeholder: "Enter name" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "mobileNo", label: "Mobile Number", type: "phone" },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
        ];
      case "name-dob":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "name", label: "Name", type: "text", placeholder: "Enter name" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "dob", label: "Date Of Birth", type: "date" },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
        ];
      case "cell-number-dob":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "dob", label: "Date Of Birth", type: "date" },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "mobileNo", label: "Mobile Number", type: "phone" },
        ];
      case "name-cell-number-dob":
        return [
          { name: "district", label: "District", type: "select", options: [
              { label: "Chennai", value: "Chennai" },
              { label: "Coimbatore", value: "Coimbatore" },
              { label: "Madurai", value: "Madurai" },
              { label: "Trichy", value: "Trichy" },
            ]
          },
          { name: "mobileNo", label: "Mobile Number", type: "phone" },
          { name: "name", label: "Name", type: "text", placeholder: "Enter name" },
          { name: "canNumber", label: "Can Number", type: "text", placeholder: "Enter Can Number" },
          { name: "dob", label: "Date Of Birth", type: "date" },
          { name: "aadhaarFront", label: "Aadhaar Card (Front)", type: "file" },
        ];
      case "saved-app-removed":
      case "return-app-removed":
        return [
          { name: "tamilName", label: "பெயர் தமிழில்", type: "text", placeholder: "பெயர் தமிழில்" },
          { name: "aadhaarCard", label: "Aadhaar Card", type: "file" },
          { name: "nameEnglish", label: "Name English", type: "text", placeholder: "Name English" },
          { name: "smartCard", label: "Smart Card", type: "file" },
        ];
      case "father-name-correction":
        return [
          { name: "relationship", label: "உறவுமுறை", type: "text", placeholder: "உறவுமுறை" },
          { name: "aadhaarCard", label: "Aadhaar Card", type: "file" },
          { name: "smartCard", label: "Smart Card", type: "file" },
        ];
      case "address-correction":
        return [
          { name: "tamilName", label: "பெயர் தமிழில்", type: "text", placeholder: "பெயர் தமிழில்" },
          { name: "dob", label: "DOB", type: "date", placeholder: "mm/dd/yyyy" },
          { name: "aadhaarCard", label: "Aadhaar Card", type: "file" },
          { name: "nameEnglish", label: "Name English", type: "text", placeholder: "Name English" },
          { name: "smartCard", label: "Smart Card", type: "file" },
        ];
      default:
        return [];
    }
  };

  const handleFieldChange = (name: string, value: string, type: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (type === "phone") {
          rule = { required: true, pattern: PATTERNS.PHONE, patternMessage: "Must be a 10-digit number" };
        } else if (type === "aadhaar") {
          rule = { required: true, pattern: PATTERNS.AADHAAR, patternMessage: "Must be a 12-digit number" };
        } else {
          rule = { required: true, requiredMessage: "This field is required" };
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
    const fields = getFieldsForService();

    fields.forEach((f) => {
      const value = formData[f.name] || "";
      let rule = {};
      
      if (f.type === "phone") {
        rule = { required: true, pattern: PATTERNS.PHONE, patternMessage: "Must be a 10-digit number" };
      } else if (f.type === "aadhaar") {
        rule = { required: true, pattern: PATTERNS.AADHAAR, patternMessage: "Must be a 12-digit number" };
      } else {
        rule = { required: true, requiredMessage: `${f.label} is required` };
      }

      const err = validateField(f.name, value, rule, formData);
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

  if (serviceId === "new-can-reg") {
    return <NewCanRegistrationForm onCancel={onCancel} />;
  }

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
            Your request for **{serviceName}** has been registered. The updates will be processed shortly.
          </p>
        </div>
      </div>
    );
  }

  const fields = getFieldsForService();

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {serviceName}
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit required details to apply for {serviceName} services
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((f) => {
            if (f.type === "textarea") {
              return (
                <div key={f.name} className="md:col-span-2">
                  <TextAreaField
                    name={f.name}
                    label={f.label}
                    placeholder={f.placeholder || f.label}
                    value={formData[f.name] || ""}
                    error={errors[f.name]}
                    disabled={isSubmitting}
                    onChange={(val) => handleFieldChange(f.name, val, f.type)}
                  />
                </div>
              );
            }

            if (f.type === "select") {
              return (
                <div key={f.name}>
                  <SelectField
                    name={f.name}
                    label={f.label}
                    options={f.options || []}
                    value={formData[f.name] || ""}
                    error={errors[f.name]}
                    disabled={isSubmitting}
                    onChange={(val) => handleFieldChange(f.name, val, f.type)}
                  />
                </div>
              );
            }

            if (f.type === "date") {
              return (
                <div key={f.name} className="flex flex-col gap-1.5 w-full">
                  <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                    {f.label}
                  </label>
                  <input
                    type="date"
                    name={f.name}
                    value={formData[f.name] || ""}
                    disabled={isSubmitting}
                    onChange={(e) => handleFieldChange(f.name, e.target.value, f.type)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                      errors[f.name]
                        ? "border-red-500"
                        : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                    }`}
                  />
                  {errors[f.name] && <span className="text-[10px] font-bold text-red-500">{errors[f.name]}</span>}
                </div>
              );
            }

            return (
              <div key={f.name}>
                <InputField
                  name={f.name}
                  label={f.label}
                  type={f.type === "file" ? "file" : f.type === "password" ? "password" : "text"}
                  placeholder={f.placeholder || f.label}
                  value={formData[f.name] || ""}
                  error={errors[f.name]}
                  disabled={isSubmitting}
                  onChange={(val) => {
                    let cleanedVal = val;
                    if (f.type === "phone") {
                      cleanedVal = val.replace(/\D/g, "").substring(0, 10);
                    } else if (f.type === "aadhaar") {
                      cleanedVal = val.replace(/\D/g, "").substring(0, 12);
                    }
                    handleFieldChange(f.name, cleanedVal, f.type);
                  }}
                />
              </div>
            );
          })}
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
          text="Submit Request"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
