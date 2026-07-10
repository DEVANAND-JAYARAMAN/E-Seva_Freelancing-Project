import React, { useState } from "react";
import { useFormEdit } from "../../../store/context/FormEditContext";
import { Plus, Trash2 } from "lucide-react";
import {
  InputField,
  PhoneField,
  TextAreaField,
  SubmitButton,
} from "../form/FormFields";

interface PvcCardPrintFormProps {
  cardType: string;
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

interface PrintItem {
  id: string;
  service: string;
  fileName: string;
  password?: string;
}

export const PvcCardPrintForm: React.FC<PvcCardPrintFormProps> = ({
  cardType,
  price = 160,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const { overrides } = useFormEdit();
  const [items, setItems] = useState<PrintItem[]>([]);
  const [currentService, setCurrentService] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");

  const [addressData, setAddressData] = useState({
    fullName: "",
    mobile: "",
    address: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, value: string, file?: File) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleAddService = () => {
    const serviceErrors: Record<string, string> = {};
    if (!currentService) serviceErrors.service = "Select a service";
    if (!currentFile) serviceErrors.file = "Choose a file";

    if (Object.keys(serviceErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serviceErrors }));
      return;
    }

    const newItem: PrintItem = {
      id: Math.random().toString(36).substring(2, 9),
      service: currentService,
      fileName: currentFile ? currentFile.name : "",
      password: currentPassword,
    };

    setItems((prev) => [...prev, newItem]);

    // Clear item inputs
    setCurrentService("");
    setCurrentFile(null);
    setCurrentPassword("");
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.service;
      delete copy.file;
      return copy;
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddressChange = (name: string, value: string) => {
    setAddressData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (items.length === 0) {
      newErrors.items = "Add at least one service card to print";
    }

    if (!addressData.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!addressData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (addressData.mobile.replace(/\D/g, "").length !== 10) {
      newErrors.mobile = "Must be a valid 10-digit mobile number";
    }
    if (!addressData.address.trim()) newErrors.address = "Address is required";
    if (!addressData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (addressData.pincode.replace(/\D/g, "").length !== 6) {
      newErrors.pincode = "Must be a valid 6-digit pincode";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      items,
      deliveryAddress: addressData,
      totalAmount: items.length * price,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 w-full text-slate-800 dark:text-slate-200"
    >
      {/* Form Header matching MSME Registration layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
            PVC CARD PRINT(ALL TYPE)
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            Order high-quality plastic PVC print outputs for multiple card
            schemes
          </p>
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none">
          Service Cost : ₹ {price.toFixed(2)}
        </div>
      </div>

      {/* Section 1: Print Queue & Card Selector */}
      <div className="space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-900/60 pb-2 text-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
            Print Queue & Card Selector
          </h3>
        </div>

        {/* Dynamic Services Selector Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-855 text-slate-800 dark:text-slate-350">
                  <th className="py-3 px-4 w-1/4">Service</th>
                  <th className="py-3 px-4 w-1/4">Document</th>
                  <th className="py-3 px-4 w-1/4">Password</th>
                  <th className="py-3 px-4">E PDF</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-900">
                  <td className="py-2.5 px-3">
                    <select
                      value={currentService}
                      onChange={(e) => setCurrentService(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#0a0f18]/30 border border-slate-250 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 focus:border-[#005c3a] dark:focus:border-emerald-500 font-bold"
                    >
                      <option value="">Select Service</option>
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Voter Card">Voter Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Ration Card">Ration Card</option>
                      <option value="Health Card">Health Card</option>
                      <option value="Employment Card">Employment Card</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="relative flex items-center justify-between border border-slate-250 dark:border-slate-800/80 rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#0a0f18]/30 overflow-hidden max-w-xs">
                      <span className="text-xs text-slate-500 truncate mr-2 select-none">
                        {currentFile ? currentFile.name : "No file chosen"}
                      </span>
                      <label className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 text-slate-700 dark:text-slate-350 text-[10px] font-extrabold px-2 py-1 rounded-lg cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 whitespace-nowrap select-none">
                        Choose File
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCurrentFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="Enter password if secure"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#0a0f18]/30 border border-slate-250 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 focus:border-[#005c3a] dark:focus:border-emerald-500 font-bold"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-400 select-none text-[10px] uppercase font-bold">
                      Auto
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#005c3a] hover:bg-[#004d30] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
                    >
                      <Plus size={16} className="stroke-[2.5]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* List of Added Cards Area */}
          <div className="p-4 bg-slate-50/30 dark:bg-slate-950/20 min-h-[100px] border-b border-slate-200 dark:border-slate-800">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-[80px] text-slate-400 text-xs font-bold select-none">
                No services added to print queue. Use the table above to add
                cards.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-3 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="font-extrabold text-[#005c3a] dark:text-emerald-400 uppercase tracking-wide">
                          {item.service}
                        </span>
                      </div>
                      <div className="text-slate-450 dark:text-slate-500 truncate max-w-[200px]">
                        File: <span className="font-mono">{item.fileName}</span>
                      </div>
                      {item.password && (
                        <div className="text-amber-600 dark:text-amber-400 font-bold">
                          Psw:{" "}
                          <span className="font-mono">{item.password}</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table/List Summary Footer panel */}
          <div className="flex flex-col items-end gap-1 px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 select-none">
            <div>
              Total Services :{" "}
              <span className="font-extrabold text-slate-900 dark:text-white">
                {items.length}
              </span>
            </div>
            <div>
              Total Amount :{" "}
              <span className="font-black text-[#005c3a] dark:text-emerald-400 text-sm">
                ₹ {items.length * price}
              </span>
            </div>
          </div>
        </div>
      </div>

      {errors.items && (
        <span className="text-[10px] font-bold text-rose-500 block">
          {errors.items}
        </span>
      )}

      {/* Section 2: Delivery Address */}
      <div className="space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-900/60 pb-2 text-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
            Delivery Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            name="fullName"
            label="FULL NAME"
            type="text"
            placeholder="Enter full name"
            value={addressData.fullName}
            error={errors.fullName}
            disabled={isLoading}
            onChange={(val) => handleAddressChange("fullName", val)}
          />

          <PhoneField
            name="mobile"
            label="MOBILE"
            placeholder="Enter contact mobile number"
            value={addressData.mobile}
            error={errors.mobile}
            disabled={isLoading}
            onChange={(val) => handleAddressChange("mobile", val)}
          />

          <TextAreaField
            name="address"
            label="ADDRESS"
            placeholder="Enter house no, street name, area, etc."
            rows={2}
            value={addressData.address}
            error={errors.address}
            disabled={isLoading}
            onChange={(val) => handleAddressChange("address", val)}
          />

          <InputField
            name="pincode"
            label="PINCODE"
            type="text"
            placeholder="Enter 6-digit pin code"
            value={addressData.pincode}
            error={errors.pincode}
            disabled={isLoading}
            onChange={(val) =>
              handleAddressChange(
                "pincode",
                val.replace(/\D/g, "").substring(0, 6),
              )
            }
          />
        </div>
      </div>

      {/* Button Footer matching MSME dynamic form styling exactly */}
      
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
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
        >
          Cancel
        </button>
        <SubmitButton
          text={isLoading ? "Ordering..." : "Place Order"}
          loading={isLoading}
          disabled={isLoading}
        />
      </div>
    </form>
  );
};
