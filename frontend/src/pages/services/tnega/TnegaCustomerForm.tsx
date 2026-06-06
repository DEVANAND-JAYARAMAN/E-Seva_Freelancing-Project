import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { TnegaCustomer } from "./types";
import type { Retailer } from "../../retailers/types";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

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
  const [retailers] = useLocalStorage<Retailer[]>(
    "thuruvan_retailers_list",
    [],
  );
  const [selectedRetailerId, setSelectedRetailerId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setSelectedRetailerId(customer.retailerId || "");
    } else {
      setSelectedRetailerId("");
    }
    setErrors({});
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedRetailerId) {
      newErrors.retailerId = "Please select a retailer";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const retailer = retailers.find((r) => r.id === selectedRetailerId);
    if (!retailer) {
      setErrors({ retailerId: "Selected retailer not found" });
      return;
    }

    onSubmit({
      id: customer?.id,
      retailerId: retailer.id,
      applicantName: retailer.name,
      phone: retailer.phone,
      aadhaarNo: retailer.aadhaarNo || "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-900/40">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {customer ? "Edit Customer" : "Add Customer"}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {customer
                ? "Modify selected retailer TNEGA assignment"
                : "Register a retailer for TNEGA services"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Select Retailer
            </label>
            <select
              value={selectedRetailerId}
              onChange={(e) => setSelectedRetailerId(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#007bff]/20 dark:focus:ring-blue-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                errors.retailerId
                  ? "border-rose-400 dark:border-rose-500/50"
                  : "border-slate-200 dark:border-slate-800/80 focus:border-[#007bff] dark:focus:border-blue-500"
              }`}
            >
              <option value="">-- Choose Retailer --</option>
              {retailers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.shopName} ({r.phone})
                </option>
              ))}
            </select>
            {errors.retailerId && (
              <span className="text-[10px] font-bold text-rose-500">
                {errors.retailerId}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-900/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#007bff] hover:bg-[#0056b3] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all"
            >
              <span>{customer ? "Update" : "Add"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
