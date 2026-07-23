"use client";

import React, { useState } from "react";
import { AppShell } from "../layouts/AppShell";
import { CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { InputField, SubmitButton, SelectField } from "./services/form/FormFields";
import { useAuth } from "../store/context/AuthContext";
import { useFormEdit } from "../store/context/FormEditContext";
import { useRouter } from "next/navigation";

export function PanCardServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    applicationType: "New PAN Card (Form 49A)",
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = 107.00;

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.applicationType) newErrors.applicationType = "Application Type is required";
    if (!formData.applicantName) newErrors.applicantName = "Applicant Name is required";
    if (!formData.fatherName) newErrors.fatherName = "Father's Name is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.mobile) newErrors.mobile = "Mobile Number is required";
    if (!formData.aadhaarNo) newErrors.aadhaarNo = "Aadhaar Number is required";

    // Enforce 10-digit mobile
    if (formData.mobile && formData.mobile.replace(/\D/g, "").length !== 10) {
      newErrors.mobile = "Must be a valid 10-digit number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("retailerId", user?.id || "");
      payload.append("retailerName", user?.name || "Unknown");
      payload.append("retailerMobile", user?.phone || "");
      payload.append("serviceId", "pancard");
      payload.append("serviceName", formData.applicationType);
      payload.append("cost", String(price));
      payload.append("walletType", user?.role === "distributor" ? "Distributor" : "Retailer");
      payload.append("formData", JSON.stringify(formData));

      Object.values(files).forEach((file: File) => {
        payload.append("documents", file);
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(/\/api$/, "");
      const res = await fetch(`${apiUrl}/api/services/request`, {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to submit request");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ applicationType: "New PAN Card (Form 49A)" });
        setFiles({});
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <AppShell activePage="PanCard Services">
        <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 dark:bg-[#030712] rounded-3xl border border-slate-200/80 dark:border-emerald-950/60 shadow-xl min-h-[500px]">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </span>
          <div>
            <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Application Submitted Successfully!
            </h5>
            <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
              Your PAN Card service application has been registered. The details will be verified and processed shortly.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePage="PanCard Services">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#090d16] rounded-3xl border-2 border-black dark:border-white shadow-sm relative overflow-hidden animate-in fade-in duration-200">
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/services")}
                className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shrink-0"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                  PAN Card Application
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                  Apply for a New PAN Card or submit correction requests.
                </p>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 flex items-center gap-1.5 select-none bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <CreditCard size={14} className="text-[#005c3a] dark:text-emerald-400" />
              <span>Service Charge : ₹ {price.toFixed(2)}</span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <SelectField
                  name="applicationType"
                  label="Application Type"
                  options={[
                    { label: "New PAN Card (Form 49A)", value: "New PAN Card (Form 49A)" },
                    { label: "PAN Correction / Update", value: "PAN Correction / Update" },
                    { label: "Duplicate PAN Card", value: "Duplicate PAN Card" },
                    { label: "Minor to Major PAN Update", value: "Minor to Major PAN Update" }
                  ]}
                  value={formData.applicationType || ""}
                  onChange={(val) => handleFieldChange("applicationType", val)}
                  error={errors.applicationType}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  name="applicantName"
                  label="Applicant Full Name"
                  type="text"
                  placeholder="Enter full name as per Aadhaar"
                  value={formData.applicantName || ""}
                  onChange={(val) => handleFieldChange("applicantName", val.toUpperCase())}
                  error={errors.applicantName}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  name="fatherName"
                  label="Father's Name"
                  type="text"
                  placeholder="Enter father's full name"
                  value={formData.fatherName || ""}
                  onChange={(val) => handleFieldChange("fatherName", val.toUpperCase())}
                  error={errors.fatherName}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob || ""}
                  onChange={(val) => handleFieldChange("dob", val)}
                  error={errors.dob}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <SelectField
                  name="gender"
                  label="Gender"
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Transgender", value: "Transgender" }
                  ]}
                  value={formData.gender || ""}
                  onChange={(val) => handleFieldChange("gender", val)}
                  error={errors.gender}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  name="aadhaarNo"
                  label="Aadhaar Number"
                  type="text"
                  placeholder="12-digit Aadhaar Number"
                  value={formData.aadhaarNo || ""}
                  onChange={(val) => {
                    const num = val.replace(/\D/g, "").substring(0, 12);
                    handleFieldChange("aadhaarNo", num);
                  }}
                  error={errors.aadhaarNo}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  name="mobile"
                  label="Mobile Number"
                  type="text"
                  placeholder="10-digit Mobile Number"
                  value={formData.mobile || ""}
                  onChange={(val) => {
                    const num = val.replace(/\D/g, "").substring(0, 10);
                    handleFieldChange("mobile", num);
                  }}
                  error={errors.mobile}
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  name="email"
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="For receiving e-PAN"
                  value={formData.email || ""}
                  onChange={(val) => handleFieldChange("email", val)}
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Document Uploads Section */}
            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-900/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">
                Required Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  name="aadhaarFront"
                  label="Aadhaar Card (Front)"
                  type="file"
                  value={formData.aadhaarFront || ""}
                  onChange={(val, file) => handleFieldChange("aadhaarFront", file?.name || "")}
                  disabled={isSubmitting}
                />
                <InputField
                  name="aadhaarBack"
                  label="Aadhaar Card (Back)"
                  type="file"
                  value={formData.aadhaarBack || ""}
                  onChange={(val, file) => handleFieldChange("aadhaarBack", file?.name || "")}
                  disabled={isSubmitting}
                />
                <InputField
                  name="photo"
                  label="Passport Size Photo"
                  type="file"
                  value={formData.photo || ""}
                  onChange={(val, file) => handleFieldChange("photo", file?.name || "")}
                  disabled={isSubmitting}
                />
                <InputField
                  name="signature"
                  label="Signature (Black Ink)"
                  type="file"
                  value={formData.signature || ""}
                  onChange={(val, file) => handleFieldChange("signature", file?.name || "", file)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Added Extra Fields */}
            {overrides.addedFields && overrides.addedFields.length > 0 && (
              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-900/50">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      onChange={(val, file) => handleFieldChange(field.name, val as string, file)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
            <button
              type="button"
              onClick={() => setFormData({ applicationType: "New PAN Card (Form 49A)" })}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
            >
              Reset
            </button>
            <SubmitButton
              text="Submit Application"
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </AppShell>
  );
}
