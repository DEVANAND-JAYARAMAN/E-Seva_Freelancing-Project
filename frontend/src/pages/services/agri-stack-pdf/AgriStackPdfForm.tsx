import React, { useState } from "react";
import {
  InputField,
  SelectField,
  PhoneField,
  SubmitButton,
} from "../form/FormFields";
import { Upload, FileText } from "lucide-react";

interface AgriStackPdfFormProps {
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thiruvallur",
  "Thiruvannamalai",
  "Thiruvarur",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupattur",
  "Tiruppur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Transgender", value: "Transgender" },
];

export const AgriStackPdfForm: React.FC<AgriStackPdfFormProps> = ({
  price,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    dob: "",
    gender: "",
    fatherName: "",
    doorNo: "",
    streetName: "",
    postalArea: "",
    district: "",
    taluk: "",
    pincode: "",
    customerMobile: "",
    aadhaarNo: "",
    farmerId: "",
    photo: "",
    aadhaarUpload: "",
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
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.fatherName.trim())
      newErrors.fatherName = "Father/Husband Name is required";
    if (!formData.doorNo.trim()) newErrors.doorNo = "Door No is required";
    if (!formData.streetName.trim())
      newErrors.streetName = "Street name is required";
    if (!formData.postalArea.trim())
      newErrors.postalArea = "Postal Area/Village is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.taluk.trim()) newErrors.taluk = "Taluk is required";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (formData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Must be a valid 6-digit pincode";
    }

    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = "Mobile Number is required";
    } else if (formData.customerMobile.replace(/\D/g, "").length !== 10) {
      newErrors.customerMobile = "Must be a valid 10-digit mobile number";
    }

    if (!formData.aadhaarNo.trim()) {
      newErrors.aadhaarNo = "Aadhaar Number is required";
    } else if (formData.aadhaarNo.replace(/\D/g, "").length !== 12) {
      newErrors.aadhaarNo = "Must be a valid 12-digit number";
    }

    if (!formData.farmerId.trim()) newErrors.farmerId = "Farmer ID is required";
    if (!formData.photo) newErrors.photo = "Photo is required";
    if (!formData.aadhaarUpload)
      newErrors.aadhaarUpload = "Aadhaar document upload is required";

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
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Agri Stack PDF Registration
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">
            Submit details to generate Farmer ID card / Agri Stack PDF
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Fee : ₹ {price}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <InputField
            name="name"
            label="Name"
            type="text"
            placeholder="Applicant Name"
            value={formData.name}
            error={errors.name}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("name", val)}
          />

          <InputField
            name="dob"
            label="Date of Birth"
            type="text"
            placeholder="YYYY-MM-DD"
            value={formData.dob}
            error={errors.dob}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("dob", val)}
          />

          <SelectField
            name="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            value={formData.gender}
            error={errors.gender}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("gender", val)}
          />

          <InputField
            name="farmerId"
            label="Farmer ID"
            type="text"
            placeholder="Enter Farmer ID"
            value={formData.farmerId}
            error={errors.farmerId}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("farmerId", val)}
          />
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <InputField
            name="fatherName"
            label="Father / Husband Name"
            type="text"
            placeholder="Father/Husband Name"
            value={formData.fatherName}
            error={errors.fatherName}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("fatherName", val)}
          />

          <InputField
            name="doorNo"
            label="Door No"
            type="text"
            placeholder="Door No"
            value={formData.doorNo}
            error={errors.doorNo}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("doorNo", val)}
          />

          <InputField
            name="streetName"
            label="Street name"
            type="text"
            placeholder="Street name"
            value={formData.streetName}
            error={errors.streetName}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("streetName", val)}
          />

          <InputField
            name="postalArea"
            label="Postal Area/Village"
            type="text"
            placeholder="Postal Area/Village"
            value={formData.postalArea}
            error={errors.postalArea}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("postalArea", val)}
          />
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <SelectField
            name="district"
            label="District"
            options={DISTRICTS.map((d) => ({ label: d, value: d }))}
            value={formData.district}
            error={errors.district}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("district", val)}
          />

          <InputField
            name="taluk"
            label="Taluk"
            type="text"
            placeholder="Taluk"
            value={formData.taluk}
            error={errors.taluk}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("taluk", val)}
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

          <PhoneField
            name="customerMobile"
            label="Mobile Number"
            value={formData.customerMobile}
            error={errors.customerMobile}
            disabled={isLoading}
            onChange={(val) => handleFieldChange("customerMobile", val)}
          />

          <InputField
            name="aadhaarNo"
            label="Aadhaar Number"
            type="text"
            placeholder="Aadhaar Number"
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

          {/* Aadhaar Upload */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Aadhaar Upload (PDF format)
            </label>
            <div
              className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                errors.aadhaarUpload
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80"
              }`}
            >
              <span className="text-xs text-slate-450 truncate flex items-center gap-1.5">
                {formData.aadhaarUpload ? (
                  <FileText
                    size={14}
                    className="text-[#005c3a] dark:text-emerald-400"
                  />
                ) : (
                  <Upload size={14} />
                )}
                {formData.aadhaarUpload || "No file chosen"}
              </span>
              <label className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 select-none">
                Choose File
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  disabled={isLoading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleFieldChange("aadhaarUpload", file ? file.name : "");
                  }}
                />
              </label>
            </div>
            {errors.aadhaarUpload && (
              <span className="text-[10px] font-bold text-red-500">
                {errors.aadhaarUpload}
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
        <SubmitButton
          text="Submit Registration"
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </form>
  );
};
