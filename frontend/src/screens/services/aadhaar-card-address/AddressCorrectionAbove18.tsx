import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  InputField,
  TextAreaField,
  SelectField,
  SubmitButton,
} from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";

interface AddressCorrectionAbove18Props {
  onCancel: () => void;
}

const DISTRICT_OPTIONS = [
  { label: "Chennai", value: "Chennai" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Madurai", value: "Madurai" },
  { label: "Trichy", value: "Trichy" },
  { label: "Salem", value: "Salem" },
];

export const AddressCorrectionAbove18: React.FC<
  AddressCorrectionAbove18Props
> = ({ onCancel }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    aadhaarNo: "",
    mobileNo: "",
    applicantName: "",
    doorNo: "",
    addressEnglish: "",
    addressTamil: "",
    district: "",
    taluk: "",
    postalArea: "",
    pinCode: "",
    photo: "",
    signature: "",
    aadhaarCard: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Live validation on edit
      if (errors[name]) {
        let rule = {};
        if (name === "aadhaarNo") {
          rule = {
            required: true,
            pattern: PATTERNS.AADHAAR,
            patternMessage: "Must be a valid 12-digit Aadhaar number",
          };
        } else if (name === "mobileNo") {
          rule = {
            required: true,
            pattern: PATTERNS.PHONE,
            patternMessage: "Must be a valid 10-digit mobile number",
          };
        } else if (name === "applicantName") {
          rule = {
            required: true,
            requiredMessage: "Applicant Name is required",
          };
        } else if (name === "doorNo") {
          rule = { required: true, requiredMessage: "Door Number is required" };
        } else if (name === "addressEnglish") {
          rule = {
            required: true,
            requiredMessage: "Address In English is required",
          };
        } else if (name === "addressTamil") {
          rule = {
            required: true,
            requiredMessage: "Address in Tamil is required",
          };
        } else if (name === "district") {
          rule = { required: true, requiredMessage: "District is required" };
        } else if (name === "taluk") {
          rule = { required: true, requiredMessage: "Taluk is required" };
        } else if (name === "postalArea") {
          rule = { required: true, requiredMessage: "Postal Area is required" };
        } else if (name === "pinCode") {
          rule = {
            required: true,
            pattern: PATTERNS.PINCODE,
            patternMessage: "Must be a valid 6-digit Pin code",
          };
        } else if (name === "photo") {
          rule = { required: true, requiredMessage: "Photo is required" };
        } else if (name === "signature") {
          rule = { required: true, requiredMessage: "Signature is required" };
        } else if (name === "aadhaarCard") {
          rule = {
            required: true,
            requiredMessage: "Aadhaar Card is required",
          };
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

    const fieldsToValidate = [
      {
        name: "aadhaarNo",
        label: "Aadhaar Number",
        rule: {
          required: true,
          pattern: PATTERNS.AADHAAR,
          patternMessage: "Must be a valid 12-digit Aadhaar number",
        },
      },
      {
        name: "mobileNo",
        label: "Mobile Number",
        rule: {
          required: true,
          pattern: PATTERNS.PHONE,
          patternMessage: "Must be a valid 10-digit mobile number",
        },
      },
      {
        name: "applicantName",
        label: "Applicant Name",
        rule: { required: true, requiredMessage: "Applicant Name is required" },
      },
      {
        name: "doorNo",
        label: "Door Number",
        rule: { required: true, requiredMessage: "Door Number is required" },
      },
      {
        name: "addressEnglish",
        label: "Address In English",
        rule: {
          required: true,
          requiredMessage: "Address In English is required",
        },
      },
      {
        name: "addressTamil",
        label: "Address in Tamil",
        rule: {
          required: true,
          requiredMessage: "Address in Tamil is required",
        },
      },
      {
        name: "district",
        label: "District",
        rule: { required: true, requiredMessage: "District is required" },
      },
      {
        name: "taluk",
        label: "Taluk",
        rule: { required: true, requiredMessage: "Taluk is required" },
      },
      {
        name: "postalArea",
        label: "Postal Area",
        rule: { required: true, requiredMessage: "Postal Area is required" },
      },
      {
        name: "pinCode",
        label: "Pin code",
        rule: {
          required: true,
          pattern: PATTERNS.PINCODE,
          patternMessage: "Must be a valid 6-digit Pin code",
        },
      },
      {
        name: "photo",
        label: "Photo",
        rule: { required: true, requiredMessage: "Photo is required" },
      },
      {
        name: "signature",
        label: "Signature",
        rule: { required: true, requiredMessage: "Signature is required" },
      },
      {
        name: "aadhaarCard",
        label: "Aadhaar Card",
        rule: { required: true, requiredMessage: "Aadhaar Card is required" },
      },
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(f.name, formData[f.name], f.rule, formData);
      if (err) newErrors[f.name] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = async (customerWhatsApp?: string) => {
    try {
      const apiUrl = `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}/api`;
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const reqBody = {
        retailerId: user?.id || "unknown_retailer",
        serviceId: "aadhaar_address_update",
        serviceName: "Address Correction (above 18)",
        cost: 100, // Hardcoded or imported from config
        customerWhatsApp: customerWhatsApp || "",
        walletType: "Main"
      };

      const res = await fetch(`${apiUrl}/services/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        console.error("Failed to create service request");
      }
    } catch (e) {
      console.error(e);
    }

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
            Submit request to update the address on your Aadhaar card using
            valid address proofs
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Row 1 */}
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
              name="mobileNo"
              label="Mobile Number (Aadhaar link)"
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

          {/* Row 2 */}
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
              name="doorNo"
              label="Door Number"
              type="text"
              placeholder="Door Number"
              value={formData.doorNo}
              error={errors.doorNo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("doorNo", val)}
            />
          </div>

          {/* Row 3 - Text Areas */}
          <div>
            <TextAreaField
              name="addressEnglish"
              label="Address In English"
              placeholder="Address In English"
              value={formData.addressEnglish}
              error={errors.addressEnglish}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("addressEnglish", val)}
            />
          </div>

          <div>
            <TextAreaField
              name="addressTamil"
              label="முகவரி தமிழில்"
              placeholder="முகவரி தமிழில்"
              value={formData.addressTamil}
              error={errors.addressTamil}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("addressTamil", val)}
            />
          </div>

          {/* Row 4 */}
          <div>
            <SelectField
              name="district"
              label="District"
              options={DISTRICT_OPTIONS}
              value={formData.district}
              error={errors.district}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("district", val)}
            />
          </div>

          <div>
            <InputField
              name="taluk"
              label="Taluk"
              type="text"
              placeholder="Taluk"
              value={formData.taluk}
              error={errors.taluk}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("taluk", val)}
            />
          </div>

          {/* Row 5 */}
          <div>
            <InputField
              name="postalArea"
              label="Postal Area"
              type="text"
              placeholder="Postal Area"
              value={formData.postalArea}
              error={errors.postalArea}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("postalArea", val)}
            />
          </div>

          <div>
            <InputField
              name="pinCode"
              label="Pin code"
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

          {/* Row 6 - Files */}
          <div>
            <InputField
              name="photo"
              label="Photo"
              type="file"
              value={formData.photo}
              error={errors.photo}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("photo", val)}
            />
          </div>

          <div>
            <InputField
              name="signature"
              label="Signature"
              type="file"
              value={formData.signature}
              error={errors.signature}
              disabled={isSubmitting}
              onChange={(val) => handleFieldChange("signature", val)}
            />
          </div>

          {/* Row 7 */}
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
          text="Apply"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};
