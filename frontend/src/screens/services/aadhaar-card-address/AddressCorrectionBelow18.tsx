import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
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

interface AddressCorrectionBelow18Props {
  onCancel: () => void;
}

const DISTRICT_OPTIONS = [
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
                         ];

export const AddressCorrectionBelow18: React.FC<
  AddressCorrectionBelow18Props
> = ({ onCancel }) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    aadhaarNo: "",
    mobileNo: "",
    applicantName: "",
    doorNo: "",
    district: "",
    taluk: "",
    addressEnglish: "",
    addressTamil: "",
    postalArea: "",
    pinCode: "",
    signature: "",
    aadhaarCard: "",
    photo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (file) {
        setSelectedFiles((prev) => [...prev, file]);
      }

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
        } else if (name === "district") {
          rule = { required: true, requiredMessage: "District is required" };
        } else if (name === "taluk") {
          rule = { required: true, requiredMessage: "Taluk is required" };
        } else if (name === "addressEnglish") {
          rule = {
            required: true,
            requiredMessage: "Address in English is required",
          };
        } else if (name === "addressTamil") {
          rule = {
            required: true,
            requiredMessage: "Address in Tamil is required",
          };
        } else if (name === "postalArea") {
          rule = { required: true, requiredMessage: "Postal Area is required" };
        } else if (name === "pinCode") {
          rule = {
            required: true,
            pattern: PATTERNS.PINCODE,
            patternMessage: "Must be a valid 6-digit Pin code",
          };
        } else if (name === "signature") {
          rule = {
            required: true,
            requiredMessage: "Signature upload is required",
          };
        } else if (name === "aadhaarCard") {
          rule = {
            required: true,
            requiredMessage: "Aadhaar Card upload is required",
          };
        } else if (name === "photo") {
          rule = {
            required: true,
            requiredMessage: "Photo upload is required",
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
        name: "addressEnglish",
        label: "Address in English",
        rule: {
          required: true,
          requiredMessage: "Address in English is required",
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
        name: "signature",
        label: "Signature",
        rule: {
          required: true,
          requiredMessage: "Signature upload is required",
        },
      },
      {
        name: "aadhaarCard",
        label: "Aadhaar Card",
        rule: {
          required: true,
          requiredMessage: "Aadhaar Card upload is required",
        },
      },
      {
        name: "photo",
        label: "Photo",
        rule: { required: true, requiredMessage: "Photo upload is required" },
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

  const handlePaymentSuccess = () => {
    setPaymentPhase("success");
    setTimeout(() => {
      setPaymentPhase("form");
      onCancel();
    }, 3000);
  };

  if (paymentPhase === "success") {
    return (
      <ServiceSuccessScreen serviceName="Address Correction (Below 18-Minor)" />
    );
  }

  if (paymentPhase === "payment") {
    return (
      <div className="py-6">
        <ServicePaymentScreen
          serviceId="address-correction-below-18"
          serviceName="Address Correction (Below 18-Minor)"
          retailerCharge={100} // Hardcoded or imported from config
          formData={formData}
          files={selectedFiles}
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
            Adress Correction (Below 18-Minor)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-555 mt-0.5">
            Submit request to update the address on a minor&apos;s Aadhaar card using
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
              label="Mobile Number(Aadhaar link)"
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
              onChange={(val, file) => handleFieldChange("applicantName", val, file)}
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
              onChange={(val, file) => handleFieldChange("doorNo", val, file)}
            />
          </div>

          {/* Row 3 */}
          <div>
            <SelectField
              name="district"
              label="District"
              options={DISTRICT_OPTIONS}
              value={formData.district}
              error={errors.district}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("district", val, file)}
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
              onChange={(val, file) => handleFieldChange("taluk", val, file)}
            />
          </div>

          {/* Row 4 - Text Areas */}
          <div>
            <TextAreaField
              name="addressEnglish"
              label="Address in English"
              placeholder="Address in English"
              value={formData.addressEnglish}
              error={errors.addressEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("addressEnglish", val, file)}
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
              onChange={(val, file) => handleFieldChange("addressTamil", val, file)}
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
              onChange={(val, file) => handleFieldChange("postalArea", val, file)}
            />
          </div>

          <div>
            <InputField
              name="pinCode"
              label="Pin code"
              type="text"
              placeholder="Pin code"
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
              name="signature"
              label="Signature"
              type="file"
              value={formData.signature}
              error={errors.signature}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("signature", val, file)}
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
              onChange={(val, file) => handleFieldChange("aadhaarCard", val, file)}
            />
          </div>

          {/* Row 7 */}
          <div>
            <InputField
              name="photo"
              label="Photo"
              type="file"
              value={formData.photo}
              error={errors.photo}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("photo", val, file)}
            />
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
<div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
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
