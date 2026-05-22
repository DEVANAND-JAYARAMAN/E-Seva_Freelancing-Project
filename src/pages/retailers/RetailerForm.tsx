import { useState, useEffect } from "react";
import { X, Save, ShieldAlert } from "lucide-react";
import type { Retailer } from "./types";

type RetailerFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (retailerData: Omit<Retailer, "id" | "createdDate"> & { id?: string }) => void;
  retailer?: Retailer | null; // If passed, we are in Edit mode
};

export function RetailerForm({ isOpen, onClose, onSubmit, retailer }: RetailerFormProps) {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [balance, setBalance] = useState("0");
  const [status, setStatus] = useState<"Active" | "Suspended">("Active");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state with selected retailer when in Edit mode
  useEffect(() => {
    if (retailer) {
      setName(retailer.name);
      setShopName(retailer.shopName);
      setEmail(retailer.email);
      setPhone(retailer.phone);
      setCity(retailer.city);
      setBalance(retailer.balance.toString());
      setStatus(retailer.status);
    } else {
      // Reset form fields
      setName("");
      setShopName("");
      setEmail("");
      setPhone("");
      setCity("");
      setBalance("0");
      setStatus("Active");
    }
    setErrors({});
  }, [retailer, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full Name is required";
    if (!shopName.trim()) newErrors.shopName = "Shop Name is required";
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!city.trim()) newErrors.city = "City/Location is required";
    
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      newErrors.balance = "Wallet balance must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: retailer?.id,
      name: name.trim(),
      shopName: shopName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      city: city.trim(),
      balance: parseFloat(balance) || 0,
      status,
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
              {retailer ? "Edit Retailer" : "Register New Retailer"}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              {retailer ? "Modify retailer profile settings" : "Create a new agent merchant profile"}
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
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Owner Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.name
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.name && <span className="text-[10px] font-bold text-rose-500">{errors.name}</span>}
            </div>

            {/* Shop Name */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Shop / Store Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kumar E-Seva Center"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.shopName
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.shopName && <span className="text-[10px] font-bold text-rose-500">{errors.shopName}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rajesh@gmail.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.email
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.email && <span className="text-[10px] font-bold text-rose-500">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.phone
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.phone && <span className="text-[10px] font-bold text-rose-500">{errors.phone}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Chennai"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.city
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.city && <span className="text-[10px] font-bold text-rose-500">{errors.city}</span>}
            </div>

            {/* Initial Balance */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Wallet Balance (INR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="e.g. 5000"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/20 dark:focus:ring-emerald-500/20 bg-white dark:bg-[#0a0f18]/30 ${
                  errors.balance
                    ? "border-rose-400 dark:border-rose-500/50"
                    : "border-slate-200 dark:border-slate-800/80 focus:border-[#005c3a] dark:focus:border-emerald-500"
                }`}
              />
              {errors.balance && <span className="text-[10px] font-bold text-rose-500">{errors.balance}</span>}
            </div>
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Merchant Account Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`px-4 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  status === "Active"
                    ? "bg-[#e8f5e9] text-[#005c3a] border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                    : "border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-500"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("Suspended")}
                className={`px-4 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  status === "Suspended"
                    ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/60"
                    : "border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-500"
                }`}
              >
                Suspended
              </button>
            </div>
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all"
            >
              <Save size={13} />
              <span>{retailer ? "Update Retailer" : "Add Retailer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
