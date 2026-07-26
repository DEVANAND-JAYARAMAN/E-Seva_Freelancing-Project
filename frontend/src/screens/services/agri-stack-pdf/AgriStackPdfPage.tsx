"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { AgriStackPdfForm } from "./AgriStackPdfForm";
import { useServicePricing } from "../../../hooks/useServicePricing";
import { PATHS } from "../../../routes/paths";

export function AgriStackPdfPage() {
  const router = useRouter();
const [isSubmitting, setIsSubmitting] = useState(false);

  // Read pricing from Service Payment API (role-based)
  const { getCharge } = useServicePricing();
  const getServicePrice = () =>
    getCharge({
      categoryId: "agri-stack-pdf",
      serviceId: "agri-main",
      serviceName: "Agri Stack PDF",
      fallback: 35,
    });

  const handleFormSubmit = (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
setTimeout(() => {
router.push(PATHS.SERVICES);
      }, 3000);
    }, 1500);
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <Link
              href={PATHS.SERVICES}
              className="text-slate-400 dark:text-slate-500 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </Link>
            <span className="text-slate-350 select-none">/</span>
            <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
              Agri Stack PDF
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <Link
              href={PATHS.SERVICES}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-750 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="w-full">
          <div className="w-full bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
            
              <AgriStackPdfForm
                price={getServicePrice()}
                onCancel={() => router.push(PATHS.SERVICES)}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
              />
            
          </div>
        </div>
      </section>
    </AppShell>
  );
}
