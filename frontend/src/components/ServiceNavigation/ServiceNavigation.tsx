"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PATHS } from "../../routes/paths";

interface ServiceNavigationProps {
  pageName: string;
  activeForm: string | null;
  setActiveForm: (form: string | null) => void;
  activeFormLabel?: string;
  backButtonText?: string;
  children?: React.ReactNode;
}

export function ServiceNavigation({
  pageName,
  activeForm,
  setActiveForm,
  activeFormLabel,
  backButtonText,
  children,
}: ServiceNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (activeForm) {
      setActiveForm(null);
    } else {
      router.push(PATHS.SERVICES);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
        <span
          onClick={() => {
            setActiveForm(null);
            router.push(PATHS.SERVICES);
          }}
          className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
        >
          Services Directory
        </span>
        <span className="text-slate-350 select-none">/</span>
        <span
          onClick={() => setActiveForm(null)}
          className="text-slate-400 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
        >
          {pageName}
        </span>
        {activeForm && activeFormLabel && (
          <>
            <span className="text-slate-350 select-none">/</span>
            <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
              {activeFormLabel}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        {children}
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>
            {backButtonText || (activeForm ? "Back to Sub-Services" : "Back to Services")}
          </span>
        </button>
      </div>
    </div>
  );
}
