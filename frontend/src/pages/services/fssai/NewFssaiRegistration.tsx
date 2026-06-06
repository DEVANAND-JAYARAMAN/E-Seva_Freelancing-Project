import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  InputField,
  SelectField,
  TextAreaField,
  RadioField,
  SubmitButton,
} from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface NewFssaiRegistrationProps {
  onCancel: () => void;
}

export const NewFssaiRegistration: React.FC<NewFssaiRegistrationProps> = ({
  onCancel,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    fssaiCategory: "Food Service",
    shopName: "",
    shopAddress: "",
    aadhaarNo: "",
    emailId: "",
    applicantName: "",
    mobileNo: "",
    documentType: "",
    foodCategory: "",
    shopPhoto: "",
    blockDivision: "",
    pinCode: "",
    panCard: "",
    aadhaarCard: "",
    applicantPhoto: "",
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
        if (
          [
            "shopName",
            "shopAddress",
            "applicantName",
            "blockDivision",
            "documentType",
            "foodCategory",
          ].includes(name)
        ) {
          rule = { required: true, requiredMessage: "This field is required" };
        } else if (name === "aadhaarNo") {
          rule = {
            required: true,
            requiredMessage: "Aadhaar Number is required",
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a valid 12-digit Aadhaar",
          };
        } else if (name === "emailId") {
          rule = {
            required: true,
            requiredMessage: "Email is required",
            pattern: PATTERNS.EMAIL,
            patternMessage: "Must be a valid email",
          };
        } else if (name === "mobileNo") {
          rule = {
            required: true,
            requiredMessage: "Mobile Number is required",
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit number",
          };
        } else if (name === "pinCode") {
          rule = {
            required: true,
            requiredMessage: "Pin Code is required",
            pattern: PATTERNS.PINCODE,
            patternMessage: "Must be a 6-digit pin code",
          };
        } else if (
          ["shopPhoto", "panCard", "aadhaarCard", "applicantPhoto"].includes(
            name,
          )
        ) {
          rule = { required: true, requiredMessage: "File upload is required" };
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
    const textFields = [
      "shopName",
      "shopAddress",
      "applicantName",
      "blockDivision",
      "documentType",
      "foodCategory",
    ];
    textFields.forEach((field) => {
      const err = validateField(
        field,
        formData[field],
        { required: true, requiredMessage: "This field is required" },
        formData,
      );
      if (err) newErrors[field] = err;
    });

    const fileFields = [
      "shopPhoto",
      "panCard",
      "aadhaarCard",
      "applicantPhoto",
    ];
    fileFields.forEach((field) => {
      const err = validateField(
        field,
        formData[field],
        { required: true, requiredMessage: "File upload is required" },
        formData,
      );
      if (err) newErrors[field] = err;
    });

    const emailErr = validateField(
      "emailId",
      formData.emailId,
      {
        required: true,
        requiredMessage: "Email is required",
        pattern: PATTERNS.EMAIL,
        patternMessage: "Must be a valid email format",
      },
      formData,
    );
    if (emailErr) newErrors.emailId = emailErr;

    const mobileErr = validateField(
      "mobileNo",
      formData.mobileNo,
      {
        required: true,
        requiredMessage: "Mobile is required",
        pattern: PATTERNS.PHONE,
        patternMessage: "Must be a valid 10-digit number",
      },
      formData,
    );
    if (mobileErr) newErrors.mobileNo = mobileErr;

    const aadhaarErr = validateField(
      "aadhaarNo",
      formData.aadhaarNo,
      {
        required: true,
        requiredMessage: "Aadhaar is required",
        pattern: PATTERNS.AADHAAR,
        patternMessage: "Must be a valid 12-digit Aadhaar number",
      },
      formData,
    );
    if (aadhaarErr) newErrors.aadhaarNo = aadhaarErr;

    const pinErr = validateField(
      "pinCode",
      formData.pinCode,
      {
        required: true,
        requiredMessage: "Pin Code is required",
        pattern: PATTERNS.PINCODE,
        patternMessage: "Must be a valid 6-digit postal code",
      },
      formData,
    );
    if (pinErr) newErrors.pinCode = pinErr;

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
            Registration Submitted Successfully!
          </h5>
          <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
            Your application for **New FSSAI Registration (Food service)** has
            been registered. You can monitor progress under the status tab.
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
            New FSSAI Registration (Food service)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Apply online for new central / state / basic FSSAI registration
            certificate
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* Top Radio Category Selection */}
      <div className="bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800/40">
        <RadioField
          name="fssaiCategory"
          label="Category Type"
          options={[
            { label: "Trade/Retail", value: "Trade/Retail" },
            { label: "Food Service", value: "Food Service" },
            { label: "Central Govt Agencies", value: "Central Govt Agencies" },
          ]}
          value={formData.fssaiCategory}
          error={errors.fssaiCategory}
          disabled={isSubmitting}
          onChange={(val) => handleFieldChange("fssaiCategory", val)}
        />
      </div>

      {/* 2-Column Responsive Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div>
            <InputField
              name="shopName"
              label="Shop Name"
              type="text"
              placeholder="Shop Name"
              value={formData.shopName}
              error={errors.shopName}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("shopName", val)}
            />
          </div>

          <div>
            <TextAreaField
              name="shopAddress"
              label="Shop Full Address"
              placeholder="Shop Full Address"
              value={formData.shopAddress}
              error={errors.shopAddress}
              disabled={isSubmitting}
              rows={3}
              onChange={(val) => handleFieldChange("shopAddress", val)}
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
              onChange={(val) =>
                handleFieldChange(
                  "aadhaarNo",
                  val.replace(/\D/g, "").slice(0, 12),
                )
              }
            />
          </div>

          <div>
            <InputField
              name="emailId"
              label="Email Id"
              type="email"
              placeholder="Email Id"
              value={formData.emailId}
              error={errors.emailId}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("emailId", val)}
            />
          </div>

          <div>
            <InputField
              name="applicantName"
              label="Applicant Name"
              type="text"
              placeholder="Applicant Name"
              value={formData.applicantName}
              error={errors.applicantName}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("applicantName", val)}
            />
          </div>

          <div>
            <InputField
              name="mobileNo"
              label="Mobile Number"
              type="text"
              placeholder="Mobile Number"
              value={formData.mobileNo}
              error={errors.mobileNo}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange(
                  "mobileNo",
                  val.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
          </div>

          <div>
            <SelectField
              name="documentType"
              label="Documents"
              options={[
                { label: "Rental Agreement", value: "Rental Agreement" },
                { label: "NOC from Owner", value: "NOC from Owner" },
                { label: "Electricity Bill", value: "Electricity Bill" },
                { label: "Water Tax Receipt", value: "Water Tax Receipt" },
              ]}
              value={formData.documentType}
              error={errors.documentType}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("documentType", val)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div>
            <SelectField
              name="foodCategory"
              label="Name of the food category"
              options={[
                { label: "Bakery and Confectionery", value: "Bakery" },
                { label: "Dairy Products and Analogues", value: "Dairy" },
                { label: "Beverages (Excluding Dairy)", value: "Beverages" },
                { label: "Ready-to-Eat Food / Savouries", value: "ReadyToEat" },
                { label: "Sweetmeats & Desserts", value: "Sweets" },
              ]}
              value={formData.foodCategory}
              error={errors.foodCategory}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("foodCategory", val)}
            />
          </div>

          <div>
            <InputField
              name="shopPhoto"
              label="Shop Photo"
              type="file"
              value={formData.shopPhoto}
              error={errors.shopPhoto}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("shopPhoto", val)}
            />
          </div>

          <div>
            <InputField
              name="blockDivision"
              label="Block/Division"
              type="text"
              placeholder="Block/Division"
              value={formData.blockDivision}
              error={errors.blockDivision}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("blockDivision", val)}
            />
          </div>

          <div>
            <InputField
              name="pinCode"
              label="Pin Code"
              type="text"
              placeholder="Pin Code"
              value={formData.pinCode}
              error={errors.pinCode}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange("pinCode", val.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>

          <div>
            <InputField
              name="panCard"
              label="Pan Card"
              type="file"
              value={formData.panCard}
              error={errors.panCard}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("panCard", val)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarCard"
              label="Aadhaar Card"
              type="file"
              value={formData.aadhaarCard}
              error={errors.aadhaarCard}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("aadhaarCard", val)}
            />
          </div>

          <div>
            <InputField
              name="applicantPhoto"
              label="Applicant Photo"
              type="file"
              value={formData.applicantPhoto}
              error={errors.applicantPhoto}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("applicantPhoto", val)}
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
          text="Apply"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
