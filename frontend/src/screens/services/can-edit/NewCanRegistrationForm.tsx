import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { CheckCircle2 } from "lucide-react";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";

interface NewCanRegistrationFormProps {
  onCancel: () => void;
}

export const NewCanRegistrationForm: React.FC<NewCanRegistrationFormProps> = ({
  onCancel,
}) => {
  const { overrides } = useFormEdit();
  const [formData, setFormData] = useState<Record<string, string>>({
    salutation: "",
    relationship1: "",
    relationship2: "",
    relationship3: "",
    dob: "",
    religion: "",
    education: "",
    work: "",
    doorNo: "",
    district: "",
    taluk: "",

    applicantNameTamil: "",
    fatherNameTamil: "",
    motherNameTamil: "",
    relationNameTamil: "",
    mobileNo: "",
    community: "",
    aadhaarNo: "",
    smartNumber: "",
    streetNameTamil: "",
    postNameTamil: "",
    villageTamil: "",

    applicantNameEnglish: "",
    fatherNameEnglish: "",
    motherNameEnglish: "",
    relationNameEnglish: "",
    maritalStatus: "",
    caste: "",
    aadhaarCard: "",
    smartCard: "",
    streetNameEnglish: "",
    pinCode: "",
    postalArea: "",
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
        if (
          [
            "salutation",
            "dob",
            "religion",
            "education",
            "doorNo",
            "district",
            "taluk",
            "applicantNameTamil",
            "mobileNo",
            "community",
            "aadhaarNo",
            "smartNumber",
            "applicantNameEnglish",
            "maritalStatus",
            "caste",
            "aadhaarCard",
            "smartCard",
            "streetNameEnglish",
            "pinCode",
            "postalArea",
          ].includes(name)
        ) {
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

    // Core Required Fields
    const requiredFields = [
      { name: "salutation", label: "Salutation" },
      { name: "dob", label: "Date of Birth" },
      { name: "religion", label: "Religion" },
      { name: "education", label: "Education" },
      { name: "doorNo", label: "Door No" },
      { name: "district", label: "District" },
      { name: "taluk", label: "Taluk" },

      { name: "applicantNameTamil", label: "Applicant Name in Tamil" },
      { name: "mobileNo", label: "Mobile Number" },
      { name: "community", label: "Community" },
      { name: "aadhaarNo", label: "Aadhaar Card Number" },
      { name: "smartNumber", label: "Smart Number" },

      { name: "applicantNameEnglish", label: "Applicant Name in English" },
      { name: "maritalStatus", label: "Maritial Status" },
      { name: "caste", label: "Caste" },
      { name: "aadhaarCard", label: "Aadhaar Card" },
      { name: "smartCard", label: "Smart Card" },
      { name: "streetNameEnglish", label: "Street Name in English" },
      { name: "pinCode", label: "Pin Code" },
      { name: "postalArea", label: "Postal Area" },
    ];

    requiredFields.forEach((f) => {
      const err = validateField(
        f.name,
        formData[f.name],
        { required: true, requiredMessage: `${f.label} is required` },
        formData,
      );
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
            Your application for **New CAN Registration** has been successfully
            registered. Status will update shortly.
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
            New CAN Registration
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Register new Citizen Access Number (CAN) to apply for e-Seva
            certificates
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Payment : ₹ 0
        </div>
      </div>

      {/* 3-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* COLUMN 1 */}
        <div className="space-y-5">
          <div>
            <SelectField
              name="salutation"
              label="திரு/திருமதி/செல்வி"
              options={[
                { label: "திரு (Mr)", value: "Mr" },
                { label: "திருமதி (Mrs)", value: "Mrs" },
                { label: "செல்வி (Ms)", value: "Ms" },
              ]}
              value={formData.salutation}
              error={errors.salutation}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("salutation", val, file)}
            />
          </div>

          <div>
            <SelectField
              name="relationship1"
              label="உறவுமுறை (Father/Spouse)"
              options={[
                { label: "தந்தை (Father)", value: "Father" },
                { label: "கணவர் (Husband)", value: "Husband" },
              ]}
              value={formData.relationship1}
              error={errors.relationship1}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("relationship1", val, file)}
            />
          </div>

          <div>
            <SelectField
              name="relationship2"
              label="உறவுமுறை (Mother)"
              options={[{ label: "தாய் (Mother)", value: "Mother" }]}
              value={formData.relationship2}
              error={errors.relationship2}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("relationship2", val, file)}
            />
          </div>

          <div>
            <SelectField
              name="relationship3"
              label="உறவுமுறை (Guardian)"
              options={[{ label: "பாதுகாவலர் (Guardian)", value: "Guardian" }]}
              value={formData.relationship3}
              error={errors.relationship3}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("relationship3", val, file)}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              DOB
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              disabled={isSubmitting}
              onChange={(e) => handleFieldChange("dob", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-slate-50 dark:bg-[#0a0f18]/30 ${
                errors.dob
                  ? "border-red-500"
                  : "border-slate-250 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
              }`}
            />
            {errors.dob && (
              <span className="text-[10px] font-bold text-red-500">
                {errors.dob}
              </span>
            )}
          </div>

          <div>
            <InputField
              name="religion"
              label="Religion"
              type="text"
              placeholder="Religion"
              value={formData.religion}
              error={errors.religion}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("religion", val, file)}
            />
          </div>

          <div>
            <InputField
              name="education"
              label="Education"
              type="text"
              placeholder="Education"
              value={formData.education}
              error={errors.education}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("education", val, file)}
            />
          </div>

          <div>
            <InputField
              name="work"
              label="Work"
              type="text"
              placeholder="Work"
              value={formData.work}
              error={errors.work}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("work", val, file)}
            />
          </div>

          <div>
            <InputField
              name="doorNo"
              label="Door No"
              type="text"
              placeholder="Door No"
              value={formData.doorNo}
              error={errors.doorNo}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("doorNo", val, file)}
            />
          </div>

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
        </div>

        {/* COLUMN 2 */}
        <div className="space-y-5">
          <div>
            <InputField
              name="applicantNameTamil"
              label="விண்ணப்பதாரர் பெயர் தமிழில்"
              type="text"
              placeholder="பெயர் தமிழில்"
              value={formData.applicantNameTamil}
              error={errors.applicantNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("applicantNameTamil", val, file)}
            />
          </div>

          <div>
            <InputField
              name="fatherNameTamil"
              label="தந்தை/கணவர் பெயர் தமிழில்"
              type="text"
              placeholder="பெயர் தமிழில்"
              value={formData.fatherNameTamil}
              error={errors.fatherNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("fatherNameTamil", val, file)}
            />
          </div>

          <div>
            <InputField
              name="motherNameTamil"
              label="தாய் பெயர் தமிழில்"
              type="text"
              placeholder="பெயர் தமிழில்"
              value={formData.motherNameTamil}
              error={errors.motherNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("motherNameTamil", val, file)}
            />
          </div>

          <div>
            <InputField
              name="relationNameTamil"
              label="பாதுகாவலர் பெயர் தமிழில்"
              type="text"
              placeholder="பெயர் தமிழில்"
              value={formData.relationNameTamil}
              error={errors.relationNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("relationNameTamil", val, file)}
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
                  val.replace(/\D/g, "").substring(0, 10),
                )
              }
            />
          </div>

          <div>
            <SelectField
              name="community"
              label="Community"
              options={[
                { label: "BC", value: "BC" },
                { label: "MBC", value: "MBC" },
                { label: "SC", value: "SC" },
                { label: "ST", value: "ST" },
                { label: "OC / General", value: "OC" },
              ]}
              value={formData.community}
              error={errors.community}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("community", val, file)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarNo"
              label="Aadhaar Card Number"
              type="text"
              placeholder="Enter Aadhaar Number"
              value={formData.aadhaarNo}
              error={errors.aadhaarNo}
              disabled={isSubmitting}
              onChange={(val) =>
                handleFieldChange(
                  "aadhaarNo",
                  val.replace(/\D/g, "").substring(0, 12),
                )
              }
            />
          </div>

          <div>
            <InputField
              name="smartNumber"
              label="Smart Number"
              type="text"
              placeholder="Smart Number"
              value={formData.smartNumber}
              error={errors.smartNumber}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("smartNumber", val, file)}
            />
          </div>

          <div>
            <InputField
              name="streetNameTamil"
              label="தெரு பெயர்"
              type="text"
              placeholder="தெரு பெயர்"
              value={formData.streetNameTamil}
              error={errors.streetNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("streetNameTamil", val, file)}
            />
          </div>

          <div>
            <InputField
              name="postNameTamil"
              label="அஞ்சல் பெயர்"
              type="text"
              placeholder="அஞ்சல் பெயர்"
              value={formData.postNameTamil}
              error={errors.postNameTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("postNameTamil", val, file)}
            />
          </div>

          <div>
            <InputField
              name="villageTamil"
              label="கிராம நிர்வாக பகுதி"
              type="text"
              placeholder="கிராம நிர்வாக பகுதி"
              value={formData.villageTamil}
              error={errors.villageTamil}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("villageTamil", val, file)}
            />
          </div>
        </div>

        {/* COLUMN 3 */}
        <div className="space-y-5">
          <div>
            <InputField
              name="applicantNameEnglish"
              label="Applicant Name"
              type="text"
              placeholder="Name In English"
              value={formData.applicantNameEnglish}
              error={errors.applicantNameEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("applicantNameEnglish", val, file)}
            />
          </div>

          <div>
            <InputField
              name="fatherNameEnglish"
              label="Father/Spouse Name"
              type="text"
              placeholder="Name In English"
              value={formData.fatherNameEnglish}
              error={errors.fatherNameEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("fatherNameEnglish", val, file)}
            />
          </div>

          <div>
            <InputField
              name="motherNameEnglish"
              label="Mother Name"
              type="text"
              placeholder="Name In English"
              value={formData.motherNameEnglish}
              error={errors.motherNameEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("motherNameEnglish", val, file)}
            />
          </div>

          <div>
            <InputField
              name="relationNameEnglish"
              label="Guardian Name"
              type="text"
              placeholder="Name In English"
              value={formData.relationNameEnglish}
              error={errors.relationNameEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("relationNameEnglish", val, file)}
            />
          </div>

          <div>
            <SelectField
              name="maritalStatus"
              label="Maritial Status"
              options={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Widowed", value: "Widowed" },
                { label: "Divorced", value: "Divorced" },
              ]}
              value={formData.maritalStatus}
              error={errors.maritalStatus}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("maritalStatus", val, file)}
            />
          </div>

          <div>
            <InputField
              name="caste"
              label="Caste"
              type="text"
              placeholder="Caste"
              value={formData.caste}
              error={errors.caste}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("caste", val, file)}
            />
          </div>

          <div>
            <InputField
              name="aadhaarCard"
              label="Aadhaar Card (Front & Back)"
              type="file"
              value={formData.aadhaarCard}
              error={errors.aadhaarCard}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("aadhaarCard", val, file)}
            />
          </div>

          <div>
            <InputField
              name="smartCard"
              label="Smart Card"
              type="file"
              value={formData.smartCard}
              error={errors.smartCard}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("smartCard", val, file)}
            />
          </div>

          <div>
            <InputField
              name="streetNameEnglish"
              label="Street Name"
              type="text"
              placeholder="Street Name"
              value={formData.streetNameEnglish}
              error={errors.streetNameEnglish}
              disabled={isSubmitting}
              onChange={(val, file) => handleFieldChange("streetNameEnglish", val, file)}
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
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
