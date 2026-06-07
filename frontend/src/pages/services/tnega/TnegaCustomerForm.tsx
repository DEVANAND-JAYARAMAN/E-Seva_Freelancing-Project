import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { TnegaCustomer } from "./types";
import { InputField, TextAreaField, SelectField } from "../form/FormFields";

type TnegaCustomerFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    customerData: Omit<TnegaCustomer, "id" | "createdDate" | "status"> & {
      id?: string;
    },
  ) => void;
  customer?: TnegaCustomer | null; // If passed, we are in Edit mode
};

export function TnegaCustomerForm({
  isOpen,
  onClose,
  onSubmit,
  customer,
}: TnegaCustomerFormProps) {
  const [formData, setFormData] = useState({
    applicantName: "",
    dob: "",
    gender: "",
    phone: "",
    district: "",
    taluk: "",
    vao: "",
    photo: "",
    aadhaarNo: "",
    aadhaarCard: "",
    smartCardNo: "",
    smartCard: "",
    signature: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        applicantName: customer.applicantName || "",
        dob: customer.dob || "",
        gender: customer.gender || "",
        phone: customer.phone || "",
        district: customer.district || "",
        taluk: customer.taluk || "",
        vao: customer.vao || "",
        photo: customer.photo || "",
        aadhaarNo: customer.aadhaarNo || "",
        aadhaarCard: customer.aadhaarCard || "",
        smartCardNo: customer.smartCardNo || "",
        smartCard: customer.smartCard || "",
        signature: customer.signature || "",
        address: customer.address || "",
      });
    } else {
      setFormData({
        applicantName: "",
        dob: "",
        gender: "",
        phone: "",
        district: "",
        taluk: "",
        vao: "",
        photo: "",
        aadhaarNo: "",
        aadhaarCard: "",
        smartCardNo: "",
        smartCard: "",
        signature: "",
        address: "",
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  if (!isOpen) return null;

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = "Applicant Name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: customer?.id,
      applicantName: formData.applicantName,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender,
      district: formData.district,
      taluk: formData.taluk,
      vao: formData.vao,
      photo: formData.photo,
      aadhaarNo: formData.aadhaarNo,
      aadhaarCard: formData.aadhaarCard,
      smartCardNo: formData.smartCardNo,
      smartCard: formData.smartCard,
      signature: formData.signature,
      address: formData.address,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-900/40">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {customer ? "Edit Customer Details" : "Register New Customer"}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {customer
                ? "Modify selected customer TNEGA details"
                : "Create a new customer profile for TNEGA services"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <InputField
              type="text"
              name="applicantName"
              label="Applicant Name"
              placeholder="Applicant Name"
              value={formData.applicantName}
              error={errors.applicantName}
              onChange={(val) => handleFieldChange("applicantName", val)}
            />
            <InputField
              type="date"
              name="dob"
              label="DOB"
              placeholder="mm/dd/yyyy"
              value={formData.dob}
              error={errors.dob}
              onChange={(val) => handleFieldChange("dob", val)}
            />
            <SelectField
              name="gender"
              label="Gender"
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              value={formData.gender}
              error={errors.gender}
              onChange={(val) => handleFieldChange("gender", val)}
            />
            <InputField
              type="text"
              name="phone"
              label="Phone"
              placeholder="Phone"
              value={formData.phone}
              error={errors.phone}
              onChange={(val) => handleFieldChange("phone", val)}
            />
            <SelectField
              name="district"
              label="District"
              options={[
                { label: "Chennai", value: "Chennai" },
                { label: "Coimbatore", value: "Coimbatore" },
                { label: "Madurai", value: "Madurai" },
                { label: "Trichy", value: "Trichy" },
              ]}
              value={formData.district}
              error={errors.district}
              onChange={(val) => handleFieldChange("district", val)}
            />
            <InputField
              type="text"
              name="taluk"
              label="Taluk"
              placeholder="Taluk"
              value={formData.taluk}
              error={errors.taluk}
              onChange={(val) => handleFieldChange("taluk", val)}
            />
            <InputField
              type="text"
              name="vao"
              label="VAO"
              placeholder="VAO"
              value={formData.vao}
              error={errors.vao}
              onChange={(val) => handleFieldChange("vao", val)}
            />
            <InputField
              type="file"
              name="photo"
              label="Photo"
              placeholder="No file chosen"
              value={formData.photo}
              error={errors.photo}
              onChange={(val) => handleFieldChange("photo", val)}
            />
            <InputField
              type="text"
              name="aadhaarNo"
              label="Aadhaar No"
              placeholder="Aadhaar No"
              value={formData.aadhaarNo}
              error={errors.aadhaarNo}
              onChange={(val) => handleFieldChange("aadhaarNo", val)}
            />
            <InputField
              type="file"
              name="aadhaarCard"
              label="Aadhar Card"
              placeholder="No file chosen"
              value={formData.aadhaarCard}
              error={errors.aadhaarCard}
              onChange={(val) => handleFieldChange("aadhaarCard", val)}
            />
            <InputField
              type="text"
              name="smartCardNo"
              label="Smart Card No"
              placeholder="Smart Card No"
              value={formData.smartCardNo}
              error={errors.smartCardNo}
              onChange={(val) => handleFieldChange("smartCardNo", val)}
            />
            <InputField
              type="file"
              name="smartCard"
              label="Smart Card"
              placeholder="No file chosen"
              value={formData.smartCard}
              error={errors.smartCard}
              onChange={(val) => handleFieldChange("smartCard", val)}
            />
            <InputField
              type="file"
              name="signature"
              label="Signature"
              placeholder="No file chosen"
              value={formData.signature}
              error={errors.signature}
              onChange={(val) => handleFieldChange("signature", val)}
            />
            <TextAreaField
              name="address"
              label="Address"
              placeholder="Address"
              value={formData.address}
              error={errors.address}
              onChange={(val) => handleFieldChange("address", val)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-900/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#005c3a] hover:bg-[#004d30] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all"
            >
              <span>{customer ? "UPDATE CUSTOMER" : "ADD CUSTOMER"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
