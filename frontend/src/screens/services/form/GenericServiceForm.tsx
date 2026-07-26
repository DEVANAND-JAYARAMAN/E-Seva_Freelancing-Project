"use client";

import { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { EditableFormHeader, InputField, SubmitButton } from "./FormFields";
import { ServicePaymentBadge } from "../../../components/ServicePaymentBadge";
import { usePaidServiceFlow } from "../../../hooks/usePaidServiceFlow";

export function GenericServiceForm({
  title,
  onCancel,
  pricingCategoryId,
  pricingServiceId,
  retailerCharge = 50,
}: {
  title: string;
  onCancel: () => void;
  pricingCategoryId?: string;
  pricingServiceId?: string;
  retailerCharge?: number;
}) {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    applicantName: "",
    mobileNo: "",
    remarks: "",
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isForm, startPayment, paymentView } = usePaidServiceFlow({
    serviceId: pricingServiceId || title.toLowerCase().replace(/\s+/g, "-"),
    serviceName: title,
    pricingCategoryId: pricingCategoryId || "",
    retailerCharge,
    formData: { ...formData, ...customValues },
    onDone: onCancel,
  });

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
    startPayment();
  };

  if (!isForm) return paymentView;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <EditableFormHeader
        defaultTitle={title}
        defaultSubtitle={`Submit details to apply for ${title}`}
        rightContent={
          <ServicePaymentBadge
            pricingCategoryId={pricingCategoryId}
            serviceId={pricingServiceId}
            serviceName={title}
            fallback={retailerCharge}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        <InputField
          name="applicantName"
          label="Applicant Name"
          type="text"
          placeholder="Enter full name"
          value={formData.applicantName}
          error={errors.applicantName}
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
            placeholder="10-digit mobile"
          value={formData.mobileNo}
          error={errors.mobileNo}
          onChange={(val) => {
            const digits = val.replace(/\D/g, "").slice(0, 10);
            setFormData((p) => ({ ...p, mobileNo: digits }));
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
          onChange={(val) => setFormData((p) => ({ ...p, remarks: val }))}
        />
        {overrides.addedFields?.map((field) => (
          <InputField
            key={field.name}
            name={field.name}
            label={field.label}
            type={(field.type as "text") || "text"}
            placeholder={field.placeholder}
            value={customValues[field.name] || ""}
            onChange={(val) =>
              setCustomValues((p) => ({ ...p, [field.name]: val }))
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase"
        >
          Cancel
        </button>
        <SubmitButton text="Submit Request" />
      </div>
    </form>
  );
}
