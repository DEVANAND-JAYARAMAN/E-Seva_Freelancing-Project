import React, { useState } from "react";
import { CreditCard, Download } from "lucide-react";
import { InputField } from "../form/FormFields";

interface PanManualMakerFormProps {
  price: number;
  onSubmit: (data: { mobileNumber: string; deviceName: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PanManualMakerForm: React.FC<PanManualMakerFormProps> = ({
  price,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Must be a valid 10-digit number";
    }

    if (!deviceName.trim()) {
      newErrors.deviceName = "Device name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ mobileNumber, deviceName });
  };

  return (
    <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="space-y-8 w-full">
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
              Pan Card NSDL and UTI Manual Maker
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
              Register Pan Card NSDL and UTI Manual Maker software key.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none flex items-center gap-1.5">
            <CreditCard
              size={13}
              className="text-[#005c3a] dark:text-emerald-400"
            />
            <span>Service Charge : ₹ {price.toFixed(2)}</span>
            <button
              type="button"
              className="p-1 rounded-lg border border-[#005c3a]/30 dark:border-emerald-500/30 text-[#005c3a] dark:text-emerald-400 hover:bg-[#005c3a]/5 dark:hover:bg-emerald-500/5 transition-all flex items-center justify-center"
              onClick={() => window.open("#", "_blank")}
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <InputField
                name="mobileNumber"
                label="Register Mobile Number"
                type="text"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(val) => {
                  const num = val.replace(/D/g, "").substring(0, 10);
                  setMobileNumber(num);
                  if (errors.mobileNumber) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.mobileNumber;
                      return next;
                    });
                  }
                }}
                error={errors.mobileNumber}
                disabled={isLoading}
              />
            </div>
            <div>
              <InputField
                name="deviceName"
                label="Device Name"
                type="text"
                placeholder="Device Name"
                value={deviceName}
                onChange={(val) => {
                  setDeviceName(val);
                  if (errors.deviceName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.deviceName;
                      return next;
                    });
                  }
                }}
                error={errors.deviceName}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
            ) : null}
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};
