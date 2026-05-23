"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Cpu,
  Sparkles,
  FileText,
  CreditCard,
  Key,
  Building2,
  Scroll,
  Percent,
  Fingerprint,
  Calendar,
  Car,
  Landmark,
  FileCheck,
  CheckCircle,
  GraduationCap,
  Users2,
  Shield,
  Map,
  Award,
  Search,
  Settings,
  Home,
  Upload,
  User,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";

// Service item interface
export interface EService {
  id: string;
  name: string;
  subName?: string;
  icon: any;
  color: string;
  bgColor: string;
  glowColor: string;
  category: "Top" | "All";
  formFields: string[];
}

export function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<EService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // List of all 19 services as requested in the screenshot
  const servicesList: EService[] = [
    // Top Services Group
    {
      id: "pdf-services",
      name: "PDF Services",
      icon: FileText,
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10 dark:shadow-rose-950/20",
      category: "Top",
      formFields: ["pdfType", "fileUpload", "customerMobile", "remarks"],
    },
    {
      id: "nsdl-pan",
      name: "NSDL PAN",
      icon: CreditCard,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500",
      glowColor: "shadow-amber-500/10 dark:shadow-amber-950/20",
      category: "Top",
      formFields: [
        "panType",
        "applicantName",
        "dob",
        "aadhaarNo",
        "aadhaarUpload",
      ],
    },

    // All Services Group
    {
      id: "software-keys",
      name: "Software Keys",
      icon: Key,
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: ["softwareType", "quantity", "customerEmail"],
    },
    {
      id: "msme",
      name: "MSME",
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-600",
      glowColor: "shadow-blue-600/10",
      category: "All",
      formFields: ["enterpriseName", "ownerName", "aadhaarNo", "businessType"],
    },
    {
      id: "ration-card",
      name: "Ration Card",
      icon: Scroll,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["rationType", "headOfFamily", "membersCount", "address"],
    },
    {
      id: "gst",
      name: "GST",
      icon: Percent,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-600",
      glowColor: "shadow-amber-600/10",
      category: "All",
      formFields: ["gstType", "tradeName", "ownerName", "panNo", "state"],
    },
    {
      id: "aadhaar-card-address",
      name: "Adhaar Card (Adress Correction)",
      icon: Fingerprint,
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10",
      category: "All",
      formFields: ["aadhaarNo", "fullName", "newAddress", "addressProof"],
    },
    {
      id: "can-edit",
      name: "CAN EDIT",
      icon: Calendar,
      color: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
      glowColor: "shadow-indigo-500/10",
      category: "All",
      formFields: ["canNo", "fullName", "dob", "fieldsToEdit"],
    },
    {
      id: "rto-services",
      name: "RTO Services",
      icon: Car,
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-500",
      glowColor: "shadow-orange-500/10",
      category: "All",
      formFields: ["rtoType", "vehicleNumber", "ownerName", "licenseNo"],
    },
    {
      id: "registration-dept",
      name: "பதிவு துறை",
      subName: "Registration Dept",
      icon: Landmark,
      color: "text-pink-500 dark:text-pink-400",
      bgColor: "bg-pink-500",
      glowColor: "shadow-pink-500/10",
      category: "All",
      formFields: ["documentType", "partiesNames", "stampValue", "district"],
    },
    {
      id: "voter-id",
      name: "Voter ID",
      icon: FileCheck,
      color: "text-cyan-500 dark:text-cyan-400",
      bgColor: "bg-cyan-500",
      glowColor: "shadow-cyan-500/10",
      category: "All",
      formFields: ["voterType", "epicNo", "fullName", "constituency"],
    },
    {
      id: "fssai",
      name: "FSSAI",
      icon: CheckCircle,
      color: "text-lime-500 dark:text-lime-400",
      bgColor: "bg-lime-500",
      glowColor: "shadow-lime-500/10",
      category: "All",
      formFields: ["fssaiType", "foodBusinessName", "ownerName", "address"],
    },
    {
      id: "certificate-courses",
      name: "Certificate Courses",
      icon: GraduationCap,
      color: "text-teal-500 dark:text-teal-400",
      bgColor: "bg-teal-500",
      glowColor: "shadow-teal-500/10",
      category: "All",
      formFields: ["courseName", "studentName", "qualification", "mobile"],
    },
    {
      id: "employment-services",
      name: "EMPLOYMENT SERVICES",
      icon: Users2,
      color: "text-slate-500 dark:text-slate-400",
      bgColor: "bg-slate-500",
      glowColor: "shadow-slate-500/10",
      category: "All",
      formFields: ["registrationNo", "candidateName", "dob", "qualification"],
    },
    {
      id: "insurance-scheme",
      name: "காப்பீடு திட்டம்",
      subName: "Insurance Scheme",
      icon: Shield,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["schemeType", "primaryApplicant", "dob", "nomineeName"],
    },
    {
      id: "police-verification",
      name: "Police Verification",
      icon: FileCheck,
      color: "text-violet-500 dark:text-violet-400",
      bgColor: "bg-violet-500",
      glowColor: "shadow-violet-500/10",
      category: "All",
      formFields: ["applicantName", "purpose", "aadhaarNo", "district"],
    },
    {
      id: "patta-service",
      name: "பட்டா சேவை",
      subName: "Patta Service",
      icon: Map,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-600",
      glowColor: "shadow-green-600/10",
      category: "All",
      formFields: ["district", "taluk", "village", "surveyNo", "subdivisionNo"],
    },
    {
      id: "utisl-pan",
      name: "Utisl Pan",
      icon: CreditCard,
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: ["applicantName", "dob", "aadhaarNo", "couponNumber"],
    },
    {
      id: "pstm-certificate",
      name: "PSTM Certificate",
      icon: Award,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500",
      glowColor: "shadow-purple-500/10",
      category: "All",
      formFields: ["studentName", "schoolName", "academicYear", "standard"],
    },
  ];

  // Live filter based on search inputs
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSub = s.subName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchName || matchSub;
    });
  }, [searchTerm]);

  const topServices = useMemo(
    () => filteredServices.filter((s) => s.category === "Top"),
    [filteredServices],
  );
  const allServices = useMemo(
    () => filteredServices.filter((s) => s.category === "All"),
    [filteredServices],
  );

  // Open interactive form drawer
  const handleServiceClick = (service: EService) => {
    setSelectedService(service);
    setFormData({});
    setErrors({});
    setSubmissionSuccess(false);
    setIsModalOpen(true);
  };

  // Form field value change
  const handleFieldChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate dynamic form inputs
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const newErrors: Record<string, string> = {};

    selectedService.formFields.forEach((field) => {
      const val = formData[field]?.trim();
      if (!val) {
        newErrors[field] = "This field is required";
      } else if (
        field === "aadhaarNo" &&
        val.replace(/\s/g, "").length !== 12
      ) {
        newErrors[field] = "Aadhaar number must be exactly 12 digits";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit mock handler
    setSubmissionSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmissionSuccess(false);
      setFormData({});
    }, 2000);
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Mock Address Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <span className="text-[#005c3a] dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <Home size={14} />
              <span>thuruvancommunication.in</span>
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider">
              Services Directory
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Search Bar inside Breadcrumb */}
            <div className="relative max-w-xs w-full">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search utility services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
              />
            </div>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-[#007bff] dark:hover:text-blue-400 transition-colors"
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* TOP SERVICES SECTION */}
        {topServices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Priority Services
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topServices.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className={`bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex items-center gap-4 border-l-4 hover:border-l-[#005c3a]`}
                  >
                    <div
                      className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 ${service.color} group-hover:scale-105 transition-transform duration-300 border border-slate-100 dark:border-slate-850`}
                    >
                      <Icon size={24} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-sm uppercase tracking-wide">
                        {service.name}
                      </h4>
                      {service.subName && (
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                          {service.subName}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL SERVICES GRID */}
        {allServices.length > 0 ? (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a]" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                E-Seva Utility Directory
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {allServices.map((service) => {
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex flex-col items-center text-center gap-3 relative overflow-hidden"
                  >
                    {/* Glossy Gradient Glow in background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 to-transparent dark:from-slate-900/5 dark:to-transparent pointer-events-none" />

                    {/* Rounded Circular Icon Container */}
                    <div
                      className={`h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 flex items-center justify-center ${service.color} group-hover:scale-110 group-hover:shadow-sm transition-all duration-300`}
                    >
                      <Icon size={24} className="stroke-[2.5]" />
                    </div>

                    <div className="space-y-1 mt-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-sm leading-snug">
                        {service.name}
                      </h4>
                      {service.subName && (
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {service.subName}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl text-center shadow-sm">
            <AlertCircle
              size={32}
              className="text-slate-300 dark:text-slate-700 mb-2"
            />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              No Utility Services Found
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              No services match your search term "{searchTerm}". Please clear or
              adjust filters.
            </p>
          </div>
        )}

        {/* MODAL / DRAWER INTERACTIVE FORM FOR SERVICES */}
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10 p-6 flex flex-col gap-5">
              {/* Form Success State Screen */}
              {submissionSuccess ? (
                <div className="py-10 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-450 animate-bounce">
                    <CheckCircle2 size={36} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                      Application Submitted!
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                      Your service request for{" "}
                      <strong>{selectedService.name}</strong> has been
                      successfully placed. It is now queued for validation.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 ${selectedService.color}`}
                      >
                        {(() => {
                          const Icon = selectedService.icon;
                          return <Icon size={18} className="stroke-[2.5]" />;
                        })()}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                          {selectedService.name}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                          Create E-Seva Application
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>

                  {/* Dynamic Form Generation */}
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex flex-col gap-4"
                  >
                    {selectedService.formFields.map((field) => {
                      const isError = errors[field];
                      let label = field.replace(/([A-Z])/g, " $1");
                      label = label.charAt(0).toUpperCase() + label.slice(1);

                      // Custom elements mapping
                      if (
                        field === "fileUpload" ||
                        field === "aadhaarUpload" ||
                        field === "addressProof"
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
                                handleFieldChange(
                                  field,
                                  "attached_doc_mock.pdf",
                                )
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
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                  <Upload size={20} />
                                  <span className="text-xs font-bold">
                                    Click to upload document
                                  </span>
                                </div>
                              )}
                            </div>
                            {isError && (
                              <span className="text-[10px] font-semibold text-rose-500">
                                {isError}
                              </span>
                            )}
                          </div>
                        );
                      }

                      if (
                        field === "pdfType" ||
                        field === "panType" ||
                        field === "rtoType" ||
                        field === "voterType" ||
                        field === "schemeType" ||
                        field === "softwareType" ||
                        field === "gstType"
                      ) {
                        const options: Record<string, string[]> = {
                          pdfType: [
                            "Aadhaar Smart Card Print",
                            "Ration Card Print-out",
                            "Voter ID Card Print",
                            "Community Certificate Print",
                          ],
                          panType: [
                            "New PAN Application (Form 49A)",
                            "PAN Correction/Reissue",
                            "Minor to Major PAN Update",
                          ],
                          rtoType: [
                            "Learning License (LLR)",
                            "Driving License Renewal",
                            "Address Correction in DL",
                          ],
                          voterType: [
                            "New Voter Registration",
                            "Voter Card Correction",
                            "Voter List Verification",
                          ],
                          schemeType: [
                            "Central Medical Insurance Scheme",
                            "Farmers Welfare Subsidy Scheme",
                            "Widow Pension Scheme",
                          ],
                          softwareType: [
                            "Windows 11 Professional Retail Key",
                            "Office 2021 Professional Plus Key",
                            "Quick Heal Antivirus Total Security 1 Yr",
                          ],
                          gstType: [
                            "New GST Registration",
                            "GST Composition Scheme Opt-in",
                            "GST Return Audit Filing",
                          ],
                        };

                        return (
                          <div key={field} className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Select {label}
                            </label>
                            <select
                              value={formData[field] || ""}
                              onChange={(e) =>
                                handleFieldChange(field, e.target.value)
                              }
                              className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-[#0a0f18]/30 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
                            >
                              <option value="">-- Choose Category --</option>
                              {options[field]?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {isError && (
                              <span className="text-[10px] font-semibold text-rose-500">
                                {isError}
                              </span>
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
                            type={
                              field === "dob"
                                ? "date"
                                : field === "membersCount" ||
                                    field === "quantity"
                                  ? "number"
                                  : "text"
                            }
                            value={formData[field] || ""}
                            onChange={(e) => {
                              if (field === "aadhaarNo") {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .substring(0, 12);
                                const parts = value.match(/.{1,4}/g) || [];
                                handleFieldChange(field, parts.join(" "));
                              } else {
                                handleFieldChange(field, e.target.value);
                              }
                            }}
                            placeholder={
                              field === "aadhaarNo"
                                ? "e.g. 1234 5678 9012"
                                : `Enter ${label.toLowerCase()}`
                            }
                            className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005c3a]/15 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                              isError
                                ? "border-rose-400 dark:border-rose-500/50"
                                : "border-slate-200 dark:border-slate-850 focus:border-[#005c3a]"
                            }`}
                          />
                          {isError && (
                            <span className="text-[10px] font-semibold text-rose-500">
                              {isError}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Submit & Cancel Buttons */}
                    <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
