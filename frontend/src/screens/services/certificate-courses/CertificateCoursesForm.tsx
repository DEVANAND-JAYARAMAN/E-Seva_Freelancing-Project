import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { Upload, FileText } from "lucide-react";

interface CertificateCoursesFormProps {
  courseName: string;
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
  "Viluppurams",
  "Virudhunagar",
];

const SIGNIFICANT_OPTIONS = [
  { label: "Father", value: "Father" },
  { label: "Husband", value: "Husband" },
  { label: "Guardian", value: "Guardian" },
];

const GET_COURSE_OPTIONS = (courseName: string) => {
  if (courseName.includes("Computer")) {
    return [
      { label: "Computer Certificate", value: "Computer Certificate" },
      {
        label: "DCA (Diploma in Computer Applications)",
        value: "DCA (Diploma in Computer Applications)",
      },
      { label: "Tally Essential Course", value: "Tally Essential Course" },
      {
        label: "Certificate in Computer Skills",
        value: "Certificate in Computer Skills",
      },
    ];
  }
  if (courseName.includes("Beautician")) {
    return [
      { label: "Beautician Certificate", value: "Beautician Certificate" },
      {
        label: "Hair Styling & Cosmetology",
        value: "Hair Styling & Cosmetology",
      },
      {
        label: "Professional Makeup Artist",
        value: "Professional Makeup Artist",
      },
    ];
  }
  return [
    { label: "Tailoring Certificate", value: "Tailoring Certificate" },
    { label: "Sewing & Fashion Design", value: "Sewing & Fashion Design" },
    { label: "Embroidery & Needle Work", value: "Embroidery & Needle Work" },
  ];
};

export const CertificateCoursesForm: React.FC<CertificateCoursesFormProps> = ({
  courseName,
  price,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const { overrides } = useFormEdit();
  const courseOptions = GET_COURSE_OPTIONS(courseName);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    significant: "",
    fatherName: "",
    doorNo: "",
    streetName: "",
    postalArea: "",
    district: "",
    taluk: "",
    pincode: "",
    aadhaarNumber: "",
    courseName: courseOptions[0]?.value || courseName,
    photo: "",
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

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.significant)
      newErrors.significant = "Significant selection is required";
    if (!formData.fatherName.trim())
      newErrors.fatherName = "Father/Husband Name is required";
    if (!formData.doorNo.trim()) newErrors.doorNo = "Door No is required";
    if (!formData.streetName.trim())
      newErrors.streetName = "Street name is required";
    if (!formData.postalArea.trim())
      newErrors.postalArea = "Postal Area is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.taluk.trim()) newErrors.taluk = "Taluk is required";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (formData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Must be a valid 6-digit pincode";
    }

    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = "Aadhaar Number is required";
    } else if (formData.aadhaarNumber.replace(/\D/g, "").length !== 12) {
      newErrors.aadhaarNumber = "Must be a valid 12-digit number";
    }

    if (!formData.courseName) newErrors.courseName = "Course name is required";
    if (!formData.photo) newErrors.photo = "Photo is required";

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
            {courseName} Registration
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Submit applicant details for Certification Course
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Course Fee : ₹ {price}
        </div>
      </div>

      {/* 3-Column Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <InputField
            name="name"
            label="Name"
            type="text"
            placeholder="Name"
            value={formData.name}
            error={errors.name}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("name", val, file)}
          />

          <InputField
            name="doorNo"
            label="Door No"
            type="text"
            placeholder="Door No"
            value={formData.doorNo}
            error={errors.doorNo}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("doorNo", val, file)}
          />

          <SelectField
            name="district"
            label="District"
            options={DISTRICTS.map((d) => ({ label: d, value: d }))}
            value={formData.district}
            error={errors.district}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("district", val, file)}
          />

          <InputField
            name="aadhaarNumber"
            label="Aadhaar Number"
            type="text"
            placeholder="Aadhaar Number"
            value={formData.aadhaarNumber}
            error={errors.aadhaarNumber}
            disabled={isLoading}
            onChange={(val) =>
              handleFieldChange(
                "aadhaarNumber",
                val.replace(/\D/g, "").substring(0, 12),
              )
            }
          />
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <SelectField
            name="significant"
            label="Significant"
            options={SIGNIFICANT_OPTIONS}
            value={formData.significant}
            error={errors.significant}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("significant", val, file)}
          />

          <InputField
            name="streetName"
            label="Street name"
            type="text"
            placeholder="Street name"
            value={formData.streetName}
            error={errors.streetName}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("streetName", val, file)}
          />

          <InputField
            name="taluk"
            label="Taluk"
            type="text"
            placeholder="Taluk"
            value={formData.taluk}
            error={errors.taluk}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("taluk", val, file)}
          />

          <SelectField
            name="courseName"
            label="Course name"
            options={courseOptions}
            value={formData.courseName}
            error={errors.courseName}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("courseName", val, file)}
          />
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <InputField
            name="fatherName"
            label="Father /Husband Name"
            type="text"
            placeholder="Father or Husband Name"
            value={formData.fatherName}
            error={errors.fatherName}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("fatherName", val, file)}
          />

          <InputField
            name="postalArea"
            label="Postal Area"
            type="text"
            placeholder="Postal Area"
            value={formData.postalArea}
            error={errors.postalArea}
            disabled={isLoading}
            onChange={(val, file) => handleFieldChange("postalArea", val, file)}
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

          {/* Photo File Upload */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Photo
            </label>
            <div
              className={`relative flex items-center justify-between border rounded-xl px-4 py-2 bg-slate-50 dark:bg-[#0a0f18]/30 transition-all ${
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-880 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton text="Submit" loading={isLoading} disabled={isLoading} />
      </div>
    </form>
  );
};
