import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import type { TnegaCustomer } from "./types";

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

const TN_DISTRICTS = [
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
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

export function TnegaCustomerForm({
  isOpen,
  onClose,
  onSubmit,
  customer,
}: TnegaCustomerFormProps) {
  const [applicantName, setApplicantName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [vao, setVao] = useState("");
  const [photo, setPhoto] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [aadhaarCard, setAadhaarCard] = useState("");
  const [smartCardNo, setSmartCardNo] = useState("");
  const [smartCard, setSmartCard] = useState("");
  const [signature, setSignature] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setApplicantName(customer.applicantName);
      setDob(customer.dob);
      setGender(customer.gender);
      setPhone(customer.phone);
      setDistrict(customer.district);
      setTaluk(customer.taluk);
      setVao(customer.vao);
      setPhoto(customer.photo || "");
      setAadhaarNo(customer.aadhaarNo);
      setAadhaarCard(customer.aadhaarCard || "");
      setSmartCardNo(customer.smartCardNo);
      setSmartCard(customer.smartCard || "");
      setSignature(customer.signature || "");
      setAddress(customer.address);
    } else {
      setApplicantName("");
      setDob("");
      setGender("");
      setPhone("");
      setDistrict("");
      setTaluk("");
      setVao("");
      setPhoto("");
      setAadhaarNo("");
      setAadhaarCard("");
      setSmartCardNo("");
      setSmartCard("");
      setSignature("");
      setAddress("");
    }
    setErrors({});
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!applicantName.trim())
      newErrors.applicantName = "Applicant Name is required";
    if (!dob) newErrors.dob = "DOB is required";
    if (!gender || gender === "Select") newErrors.gender = "Gender is required";
    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be a 10 digit number";
    }
    if (!district || district === "Select District")
      newErrors.district = "District is required";
    if (!taluk.trim()) newErrors.taluk = "Taluk is required";
    if (!vao.trim()) newErrors.vao = "VAO is required";
    if (!aadhaarNo.trim()) {
      newErrors.aadhaarNo = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(aadhaarNo.replace(/\s/g, ""))) {
      newErrors.aadhaarNo = "Aadhaar number must be 12 digits";
    }
    if (!smartCardNo.trim())
      newErrors.smartCardNo = "Smart Card No is required";
    if (!address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate file upload or save name
      const fakeUrl = URL.createObjectURL(file);
      if (field === "photo") setPhoto(file.name);
      if (field === "aadhaarCard") setAadhaarCard(file.name);
      if (field === "smartCard") setSmartCard(file.name);
      if (field === "signature") setSignature(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: customer?.id,
      applicantName: applicantName.trim(),
      dob,
      gender,
      phone: phone.trim(),
      district,
      taluk: taluk.trim(),
      vao: vao.trim(),
      photo,
      aadhaarNo: aadhaarNo.replace(/\s/g, "").trim(),
      aadhaarCard,
      smartCardNo: smartCardNo.trim(),
      smartCard,
      signature,
      address: address.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-slideUp my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 dark:border-slate-900/40 shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-[#007bff] dark:text-blue-400">
              {customer ? "Edit Customer" : "Add Customer"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Applicant Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Applicant Name
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Applicant Name"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.applicantName
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.applicantName && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.applicantName}
                </span>
              )}
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                DOB
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.dob
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.dob && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.dob}
                </span>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.gender
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
              {errors.gender && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.gender}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").substring(0, 10))
                }
                placeholder="Phone"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.phone
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.phone && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* District */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.district
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              >
                <option value="">Select District</option>
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.district}
                </span>
              )}
            </div>

            {/* Taluk */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Taluk
              </label>
              <input
                type="text"
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                placeholder="Taluk"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.taluk
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.taluk && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.taluk}
                </span>
              )}
            </div>

            {/* VAO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                VAO
              </label>
              <input
                type="text"
                value={vao}
                onChange={(e) => setVao(e.target.value)}
                placeholder="VAO"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.vao
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.vao && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.vao}
                </span>
              )}
            </div>

            {/* Photo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Photo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={(e) => handleFileChange("photo", e)}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Upload size={14} />
                  Choose File
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {photo || "No file chosen"}
                </span>
              </div>
            </div>

            {/* Aadhaar No */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Aadhaar No
              </label>
              <input
                type="text"
                value={aadhaarNo}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/\D/g, "")
                    .substring(0, 12);
                  const parts = val.match(/.{1,4}/g) || [];
                  setAadhaarNo(parts.join(" "));
                }}
                placeholder="Aadhaar No"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.aadhaarNo
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.aadhaarNo && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.aadhaarNo}
                </span>
              )}
            </div>

            {/* Aadhaar Card file */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Aadhaar Card
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="aadhaar-upload"
                  onChange={(e) => handleFileChange("aadhaarCard", e)}
                  className="hidden"
                />
                <label
                  htmlFor="aadhaar-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Upload size={14} />
                  Choose File
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {aadhaarCard || "No file chosen"}
                </span>
              </div>
            </div>

            {/* Smart Card No */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Smart Card No
              </label>
              <input
                type="text"
                value={smartCardNo}
                onChange={(e) => setSmartCardNo(e.target.value)}
                placeholder="SmartCard No"
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 ${
                  errors.smartCardNo
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.smartCardNo && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.smartCardNo}
                </span>
              )}
            </div>

            {/* Smart Card file */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Smart Card
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="smartcard-upload"
                  onChange={(e) => handleFileChange("smartCard", e)}
                  className="hidden"
                />
                <label
                  htmlFor="smartcard-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Upload size={14} />
                  Choose File
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {smartCard || "No file chosen"}
                </span>
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Signature
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="sig-upload"
                  onChange={(e) => handleFileChange("signature", e)}
                  className="hidden"
                />
                <label
                  htmlFor="sig-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Upload size={14} />
                  Choose File
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {signature || "No file chosen"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border text-sm font-semibold transition-all bg-white dark:bg-[#0a0f18]/30 resize-none ${
                  errors.address
                    ? "border-rose-400 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-[#007bff] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                }`}
              />
              {errors.address && (
                <span className="text-xs text-rose-500 font-medium">
                  {errors.address}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center pt-6">
            <button
              type="submit"
              className="px-8 py-2.5 rounded-lg bg-[#007bff] hover:bg-[#0056b3] text-white font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
