import React, { useState } from "react";

interface AgriStackPdfFormProps {
  price: number;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const AgriStackPdfForm: React.FC<AgriStackPdfFormProps> = ({
  price,
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    aadhaarNo: "",
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

    if (!formData.aadhaarNo.trim()) {
      newErrors.aadhaarNo = "Aadhaar Number is required";
    } else if (formData.aadhaarNo.replace(/\D/g, "").length !== 12) {
      newErrors.aadhaarNo = "Must be a valid 12-digit Aadhaar number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full text-slate-800 dark:text-slate-200"
    >
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Agri Stack PDF
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Locate your Agri Stack details by verifying Aadhaar Number
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Service Payment :{" "}
          <span className="font-bold">₹ {price.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          AADHAAR NUMBER
        </label>
        <input
          type="text"
          placeholder="Enter Aadhaar number"
          value={formData.aadhaarNo}
          onChange={(e) =>
            handleFieldChange(
              "aadhaarNo",
              e.target.value.replace(/\D/g, "").substring(0, 12),
            )
          }
          className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-xs outline-none transition-all ${
            errors.aadhaarNo
              ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
              : "border-slate-250 dark:border-slate-800 focus:border-[#005c3a] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#005c3a]/20"
          }`}
          disabled={isLoading}
        />
        {errors.aadhaarNo && (
          <span className="text-[10px] font-semibold text-rose-500 block mt-1">
            {errors.aadhaarNo}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-655 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider transition-all select-none"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-xl bg-[#005c3a] dark:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#004d30] dark:hover:bg-emerald-600 transition-all select-none shadow"
        >
          {isLoading ? "SEARCHING..." : "SEARCH DETAILS"}
        </button>
      </div>
    </form>
  );
};
