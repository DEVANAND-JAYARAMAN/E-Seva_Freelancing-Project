"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { ServiceCard } from "../ServiceCard";
import { InputField, SelectField, SubmitButton } from "../form/FormFields";
import { validateField, PATTERNS } from "../form/validators";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";

interface DharsanSubService {
  id: string;
  name: string;
  subName?: string;
  price: { retailer: number; distributor: number };
}

const timeOptions = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
];

const routeOptions = [
  { value: "Pampa", label: "Pampa" },
  { value: "Erumeli", label: "Erumeli" },
  { value: "Pulmedu", label: "Pulmedu" },
];

export function DharsanPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<string | null>(null); // "sabarimala" | null
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dharsanServicesList: DharsanSubService[] = [
    {
      id: "sabarimala",
      name: "சபரிமலை",
      subName: "Sabarimala Dharsan",
      price: { retailer: 150, distributor: 150 },
    },
  ];

  const handleCardClick = (service: DharsanSubService) => {
    setFormData({});
    setErrors({});
    setPaymentPhase("form");
    if (service.id === "sabarimala") {
      setActiveForm("sabarimala");
    }
  };

  const renderServiceIcon = (id: string, className = "w-14 h-14") => {
    switch (id) {
      case "sabarimala":
        return (
          <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="sabarimalaBgGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="12"
              fill="url(#sabarimalaBgGrad)"
            />
            {/* 18 Steps representation */}
            <path
              d="M16 42H48M18 39H46M20 36H44M22 33H42M24 30H40"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Arch/Canopy */}
            <path
              d="M20 28V16C20 12 24 10 32 10C40 10 44 12 44 28"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Glowing flame */}
            <circle cx="32" cy="18" r="3" fill="#f59e0b" />
            <path d="M32 15L32 12" stroke="#f59e0b" strokeWidth="1" />
            {/* Tamil Text */}
            <text
              x="32"
              y="51"
              fill="white"
              fontSize="5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
              letterSpacing="0.2"
            >
              சபரிமலை
            </text>
          </svg>
        );
      default:
        return null;
    }
  };

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateField(
      "devoteeName",
      formData.devoteeName,
      { required: true, requiredMessage: "Name is required" },
      formData,
    );
    if (nameErr) newErrors.devoteeName = nameErr;

    const photoErr = validateField(
      "photoUpload",
      formData.photoUpload,
      { required: true, requiredMessage: "Photo is required" },
      formData,
    );
    if (photoErr) newErrors.photoUpload = photoErr;

    const mobileErr = validateField(
      "customerMobile",
      formData.customerMobile,
      {
        required: true,
        requiredMessage: "Mobile number is required",
        pattern: PATTERNS.PHONE,
        patternMessage: "Must be a valid 10-digit mobile number",
      },
      formData,
    );
    if (mobileErr) newErrors.customerMobile = mobileErr;

    const aadhaarErr = validateField(
      "aadhaarUpload",
      formData.aadhaarUpload,
      { required: true, requiredMessage: "Aadhaar Card copy is required" },
      formData,
    );
    if (aadhaarErr) newErrors.aadhaarUpload = aadhaarErr;

    const dateErr = validateField(
      "bookingDate",
      formData.bookingDate,
      { required: true, requiredMessage: "Darshan date is required" },
      formData,
    );
    if (dateErr) newErrors.bookingDate = dateErr;

    const timeErr = validateField(
      "bookingTime",
      formData.bookingTime,
      { required: true, requiredMessage: "Time is required" },
      formData,
    );
    if (timeErr) newErrors.bookingTime = timeErr;

    const routeErr = validateField(
      "route",
      formData.route,
      { required: true, requiredMessage: "Route is required" },
      formData,
    );
    if (routeErr) newErrors.route = routeErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = () => {
    setPaymentPhase("success");
    setTimeout(() => {
      setActiveForm(null);
      setFormData({});
      setPaymentPhase("form");
    }, 3000);
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
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
              Dharsan
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  சபரிமலை (Sabarimala)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (activeForm) {
                  setActiveForm(null);
                } else {
                  router.push(PATHS.SERVICES);
                }
              }}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>
                {activeForm ? "Back to Sub-Services" : "Back to Services"}
              </span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER LIST OF DHARSANS OR DYNAMIC INLINE FORM */}
        {!activeForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
                Dharsan Sub-Services
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dharsanServicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  subName={service.subName}
                  icon={renderServiceIcon(service.id, "w-16 h-16")}
                  onClick={() => handleCardClick(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {paymentPhase === "success" ? (
                <ServiceSuccessScreen serviceName="Sabarimala Dharsan Booking" />
              ) : paymentPhase === "payment" ? (
                <div className="py-2">
                  <ServicePaymentScreen
                    serviceName="Sabarimala Dharsan Booking"
                    retailerCharge={150}
                    onBack={() => setPaymentPhase("form")}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-8 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                        சபரிமலை (Sabarimala Dharsan)
                      </h2>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                        Submit devotee credentials to book Sabarimala Dharsan.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white self-start sm:self-auto pt-1 sm:pt-1.5 select-none flex items-center gap-1.5">
                      <CreditCard size={13} className="text-emerald-500" />
                      <span>Service Charge : ₹ 150.00</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <InputField
                          name="devoteeName"
                          label="Name"
                          type="text"
                          placeholder="Name"
                          value={formData.devoteeName || ""}
                          onChange={(val) =>
                            handleFieldChange("devoteeName", val)
                          }
                          error={errors.devoteeName}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <InputField
                          name="photoUpload"
                          label="Photo"
                          type="file"
                          value={formData.photoUpload || ""}
                          onChange={(val) =>
                            handleFieldChange("photoUpload", val)
                          }
                          error={errors.photoUpload}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <InputField
                          name="customerMobile"
                          label="Mobile Number"
                          type="text"
                          placeholder="Mobile Number"
                          value={formData.customerMobile || ""}
                          onChange={(val) =>
                            handleFieldChange("customerMobile", val)
                          }
                          error={errors.customerMobile}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <InputField
                          name="aadhaarUpload"
                          label="Aadhaar Card (Front&Back)"
                          type="file"
                          value={formData.aadhaarUpload || ""}
                          onChange={(val) =>
                            handleFieldChange("aadhaarUpload", val)
                          }
                          error={errors.aadhaarUpload}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <InputField
                          name="bookingDate"
                          label="தரிசனம் தேதி"
                          type="date"
                          placeholder="mm/dd/yyyy"
                          value={formData.bookingDate || ""}
                          onChange={(val) =>
                            handleFieldChange("bookingDate", val)
                          }
                          error={errors.bookingDate}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <SelectField
                          name="bookingTime"
                          label="நேரம்"
                          options={timeOptions}
                          value={formData.bookingTime || ""}
                          onChange={(val) =>
                            handleFieldChange("bookingTime", val)
                          }
                          error={errors.bookingTime}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <SelectField
                          name="route"
                          label="Route"
                          options={routeOptions}
                          value={formData.route || ""}
                          onChange={(val) => handleFieldChange("route", val)}
                          error={errors.route}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-900/60 mt-8">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 select-none"
                    >
                      Cancel
                    </button>
                    <SubmitButton
                      text="Apply"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
