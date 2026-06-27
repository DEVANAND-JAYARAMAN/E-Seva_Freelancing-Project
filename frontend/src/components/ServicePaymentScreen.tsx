import React, { useState } from "react";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../store/context/AuthContext";
import Link from "next/link";

interface ServicePaymentScreenProps {
  serviceId?: string;
  serviceName: string;
  retailerCharge: number;
  formData?: Record<string, string>;
  files?: File[];
  onBack: () => void;
  onSuccess: (customerWhatsApp?: string) => void;
}

export const ServicePaymentScreen: React.FC<ServicePaymentScreenProps> = ({
  serviceId,
  serviceName,
  retailerCharge,
  formData,
  files,
  onBack,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerWhatsApp, setCustomerWhatsApp] = useState("");

  const [error, setError] = useState("");
  const { user, updateWallet } = useAuth();
  const walletBalance = user?.walletBalance || 0;

  const handlePaymentSubmit = async () => {
    if (walletBalance < retailerCharge) {
      setError(`Insufficient wallet balance (₹${walletBalance.toFixed(2)}). Please add funds to your wallet to proceed.`);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const apiUrl = `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api`;
      
      const submitData = new FormData();
      submitData.append("retailerId", user?.id || "unknown_retailer");
      submitData.append("retailerName", user?.name || "");
      submitData.append("retailerMobile", user?.phone || "");
      submitData.append("serviceId", serviceId || serviceName.toLowerCase().replace(/\s+/g, "_"));
      submitData.append("serviceName", serviceName);
      submitData.append("cost", String(retailerCharge));
      submitData.append("customerWhatsApp", customerWhatsApp.trim());
      submitData.append("walletType", "Main");
      
      if (formData) {
        submitData.append("formData", JSON.stringify(formData));
      }
      
      if (files) {
        files.forEach((file) => {
          submitData.append("documents", file);
        });
      }

      const res = await fetch(`${apiUrl}/services/request`, {
        method: "POST",
        body: submitData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to create service request");
        setIsSubmitting(false);
        return;
      }

      // Update local wallet balance since payment is always via wallet
      updateWallet(walletBalance - retailerCharge);

      setIsSubmitting(false);
      onSuccess(customerWhatsApp.trim() || undefined);
    } catch (e) {
      setError("Network error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col items-center justify-center border-b border-slate-50 dark:border-slate-900/50 pb-5 pt-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 mb-3">
          <Wallet size={24} />
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight text-center">
          Service Payment: {serviceName}
        </h4>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider text-center px-4">
          Pay service charge to proceed with request submission
        </p>
      </div>

      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Retailer Charge
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white">
            ₹{retailerCharge.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">
            Select Payment Option
          </label>
          <div className="p-4 rounded-xl border-2 border-[#005c3a] bg-[#005c3a]/5 dark:border-emerald-600 dark:bg-emerald-950/20 flex items-center gap-3">
            <Wallet
              size={24}
              className="text-[#005c3a] dark:text-emerald-400"
            />
            <div className="flex flex-col">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#005c3a] dark:text-emerald-400">
                Main Wallet
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Amount will be automatically deducted
              </span>
            </div>
          </div>

          <div className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <label className="block text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              Customer WhatsApp Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={customerWhatsApp}
              onChange={(e) => setCustomerWhatsApp(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 focus:border-blue-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-[#0a0f18]/30 transition-all"
            />
            <p className="text-[9px] text-blue-500 dark:text-blue-400 mt-1.5 font-medium">
              Customer will receive an automated WhatsApp message when the
              service is marked as completed by Admin.
            </p>
          </div>

          {walletBalance < retailerCharge && (
            <Link href="/wallets" className="text-[10px] font-extrabold uppercase tracking-wider underline underline-offset-2 hover:text-rose-700 dark:hover:text-rose-300 w-fit">
              Go to Wallet to Add Funds
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 mt-2 border-t border-slate-50 dark:border-slate-900/50">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePaymentSubmit}
          disabled={isSubmitting}
          className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            "Pay & Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export const ServiceSuccessScreen: React.FC<{
  serviceName: string;
  onClose?: () => void;
}> = ({ serviceName, onClose }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
        <CheckCircle2 size={44} className="stroke-[2.5]" />
      </span>
      <div>
        <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Application Placed Successfully!
        </h5>
        <p className="text-sm text-slate-400 dark:text-slate-555 mt-2 max-w-md leading-relaxed">
          Your request for <strong>{serviceName}</strong> has been successfully
          registered and forwarded to the Admin Panel.
          <br />
          <br />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full inline-block">
            Note: Amount will be re-credited if Admin rejects
          </span>
        </p>
      </div>
    </div>
  );
};
