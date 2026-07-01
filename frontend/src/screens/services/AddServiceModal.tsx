import React, { useState } from "react";
import { Plus } from "lucide-react";
import { EService } from "./ServicesPage";

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: EService) => void;
};

export function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [retailerPrice, setRetailerPrice] = useState("0");
  const [distributorPrice, setDistributorPrice] = useState("0");
  const [formFieldsInput, setFormFieldsInput] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const formFields = formFieldsInput
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const newService: EService = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: name,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500",
      glowColor: "shadow-blue-500/10",
      category: "All",
      formFields: formFields.length > 0 ? formFields : ["applicantName", "mobile"],
      price: {
        retailer: Number(retailerPrice) || 0,
        distributor: Number(distributorPrice) || 0,
      },
      customImage: customImage || undefined,
    };

    onAdd(newService);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Add New Service
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Passport Application"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                Retailer Price (₹)
              </label>
              <input
                type="number"
                value={retailerPrice}
                onChange={(e) => setRetailerPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                Distributor Price (₹)
              </label>
              <input
                type="number"
                value={distributorPrice}
                onChange={(e) => setDistributorPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Form Fields (Comma Separated)
            </label>
            <input
              type="text"
              value={formFieldsInput}
              onChange={(e) => setFormFieldsInput(e.target.value)}
              placeholder="e.g. applicantName, mobile, fileUpload"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
            <p className="text-[9px] text-slate-400 mt-1">
              Available special fields: fileUpload, aadhaarUpload, addressProof
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Image / Icon (Optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {customImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customImage} alt="" className="h-full w-full object-contain" />
                  </>
                ) : (
                  <div className="text-[10px] font-bold text-slate-350">Upload</div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#005c3a]/10 file:text-[#005c3a] hover:file:bg-[#005c3a]/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Service
          </button>
        </div>
      </div>
    </div>
  );
}
