"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Send } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { useAuth } from "../../../store/context/AuthContext";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";
import { EService } from "../ServicesPage";

export function DynamicServicePage({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [service, setService] = useState<EService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [paymentPhase, setPaymentPhase] = useState<"form" | "payment" | "success">("form");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic`);
        if (response.ok) {
          const data = await response.json();
          const found = data.find((d: any) => d.id === serviceId);
          if (found) {
            setService({
              id: found.id,
              name: found.name,
              color: "text-blue-500",
              bgColor: "bg-blue-500",
              glowColor: "shadow-blue-500/10",
              category: "All",
              formFields: found.formFields || [],
              price: { retailer: found.retailerCharge || 0, distributor: found.distributorCharge || 0 },
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch dynamic service", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  const handleFieldChange = (field: string, val: string, file?: File) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: false }));
    if (file) {
      setSelectedFiles((prev) => [...prev, file]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    
    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    service.formFields.forEach((field) => {
      if (!formData[field]) {
        hasError = true;
        newErrors[field] = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = () => {
    setPaymentPhase("success");
  };

  if (isLoading) {
    return (
      <AppShell activePage="Services">
        <div className="flex justify-center items-center h-full">Loading...</div>
      </AppShell>
    );
  }

  if (!service) {
    return (
      <AppShell activePage="Services">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-xl font-bold">Service Not Found</h2>
          <button onClick={() => router.push("/services")} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Go Back</button>
        </div>
      </AppShell>
    );
  }

  const retailerCharge = Number(service.price?.retailer) || 0;

  return (
    <AppShell activePage="Services">
      <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
        <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-900/30 pb-6">
          <button
            onClick={() => router.push("/services")}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {service.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Create New Application
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b101e] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {paymentPhase === "success" ? (
            <ServiceSuccessScreen serviceName={service.name} />
          ) : paymentPhase === "payment" ? (
            <ServicePaymentScreen
              serviceName={service.name}
              retailerCharge={retailerCharge}
              formData={formData}
              files={selectedFiles}
              onBack={() => setPaymentPhase("form")}
              onSuccess={handlePaymentSuccess}
            />
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              {service.formFields.map((field) => {
                const isError = errors[field];
                let label = field.replace(/([A-Z])/g, " $1");
                label = label.charAt(0).toUpperCase() + label.slice(1);

                if (
                  field === "fileUpload" ||
                  field === "aadhaarUpload" ||
                  field === "addressProof" ||
                  field === "incomeCertificateUpload"
                ) {
                  return (
                    <div key={field} className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {label} (PDF/JPG)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          isError
                            ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/10"
                            : "border-slate-200 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                        }`}
                        onClick={() =>
                          handleFieldChange(field, "attached_doc_mock.pdf")
                        }
                      >
                        {formData[field] ? (
                          <div className="flex flex-col items-center gap-1 text-[#005c3a] dark:text-emerald-400">
                            <FileText size={24} />
                            <span className="text-xs font-bold font-mono">
                              attached_doc_mock.pdf
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <FileText
                              size={24}
                              className="text-slate-300 dark:text-slate-700 mb-1"
                            />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Click to upload {label}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-600">
                              Max 5MB
                            </span>
                          </div>
                        )}
                      </div>
                      {isError && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1">
                          File upload is required
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field} className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={formData[field] || ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      placeholder={`Enter ${label}`}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isError
                          ? "border-rose-300 dark:border-rose-900 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:border-[#005c3a] focus:ring-[#005c3a]/20"
                      } bg-white dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 text-sm font-semibold text-slate-800 dark:text-slate-200`}
                    />
                    {isError && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1">
                        {label} is required
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 mt-2 border-t border-slate-50 dark:border-slate-900/50">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                >
                  Proceed to Payment
                  <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
