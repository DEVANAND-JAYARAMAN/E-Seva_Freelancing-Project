import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputField, TextAreaField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import { ServicePaymentScreen, ServiceSuccessScreen } from "../../../components/ServicePaymentScreen";

interface AddressCorrectionAbove18Props {
  onCancel: () => void;
}

export const AddressCorrectionAbove18: React.FC<AddressCorrectionAbove18Props> = ({ onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    aadhaarNo: "",
    fullName: "",
    newAddress: "",
    addressProof: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<"form" | "payment" | "success">("form");

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "aadhaarNo") {
          rule = { required: true, pattern: PATTERNS.AADHAAR, patternMessage: "Must be a valid 12-digit Aadhaar number" };
        } else if (name === "fullName") {
          rule = { required: true, requiredMessage: "Full Name is required" };
        } else if (name === "newAddress") {
          rule = { required: true, requiredMessage: "New Address is required" };
        } else if (name === "addressProof") {
          rule = { required: true, requiredMessage: "Address Proof is required" };
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
    
    const aadhaarErr = validateField("aadhaarNo", formData.aadhaarNo, { required: true, requiredMessage: "Aadhaar Number is required", pattern: PATTERNS.AADHAAR, patternMessage: "Must be exactly 12 digits" }, formData);
    if (aadhaarErr) newErrors.aadhaarNo = aadhaarErr;

    const nameErr = validateField("fullName", formData.fullName, { required: true, requiredMessage: "Full Name is required" }, formData);
    if (nameErr) newErrors.fullName = nameErr;

    const addrErr = validateField("newAddress", formData.newAddress, { required: true, requiredMessage: "New Address is required" }, formData);
    if (addrErr) newErrors.newAddress = addrErr;

    const proofErr = validateField("addressProof", formData.addressProof, { required: true, requiredMessage: "Address Proof upload is required" }, formData);
    if (proofErr) newErrors.addressProof = proofErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = () => {
    setPaymentPhase("success");
    setTimeout(() => {
      setPaymentPhase("form");
      onCancel();
    }, 3000);
  };

  if (paymentPhase === "success") {
    return <ServiceSuccessScreen serviceName="Address Correction (above 18)" />;
  }

  if (paymentPhase === "payment") {
    return (
      <div className="py-6">
        <ServicePaymentScreen
          serviceName="Address Correction (above 18)"
          retailerCharge={100} // Hardcoded or imported from config
          onBack={() => setPaymentPhase("form")}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Adress Correction (above 18)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Submit request to update the address on your Aadhaar card using valid address proofs
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <InputField
              name="aadhaarNo"
              label="Aadhaar Number"
              type="text"
              placeholder="Enter 12-digit Aadhaar Number"
              value={formData.aadhaarNo}
              error={errors.aadhaarNo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("aadhaarNo", val.replace(/\D/g, "").slice(0, 12))}
            />
          </div>

          <div>
            <InputField
              name="fullName"
              label="Full Name"
              type="text"
              placeholder="Enter full name exactly as in Aadhaar"
              value={formData.fullName}
              error={errors.fullName}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("fullName", val)}
            />
          </div>

          <div className="md:col-span-2">
            <TextAreaField
              name="newAddress"
              label="New Address to Update"
              placeholder="Enter complete new address including door number, street, landmark, and pin code"
              value={formData.newAddress}
              error={errors.newAddress}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("newAddress", val)}
            />
          </div>

          <div className="md:col-span-2">
            <InputField
              name="addressProof"
              label="Address Proof Document (PDF/JPG)"
              type="file"
              value={formData.addressProof}
              error={errors.addressProof}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("addressProof", val)}
            />
          </div>
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
          text="Apply Correction"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
