"use client";

import { ServiceNavigation } from "../../../components/ServiceNavigation/ServiceNavigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { CertificateCoursesForm } from "./CertificateCoursesForm";
import { ServiceCard } from "../ServiceCard";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";

interface CertificateService {
  id: string;
  name: string;
  priceKey: string;
  defaultPrice: number;
}

export function CertificateCoursesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [selectedService, setSelectedService] =
    useState<CertificateService | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read pricing matrix from localStorage
  const [pricingConfig] = useLocalStorage<Record<string, any[]>>(
    "thuruvan_service_pricing_matrix_v2",
    {},
  );

  const [servicesList, setServicesList] = useState<CertificateService[]>([
    {
      id: "course-tailoring",
      name: "Tailoring Certificate",
      priceKey: "course-tailoring",
      defaultPrice: 300.0,
    },
    {
      id: "course-computer",
      name: "Computer Certificate",
      priceKey: "course-computer",
      defaultPrice: 300.0,
    },
    {
      id: "course-beautician",
      name: "Beautician Certificate",
      priceKey: "course-beautician",
      defaultPrice: 300.0,
    },
  ]);

  const handleEditCard = (id: string, currentName: string) => {
    Swal.fire({
      title: "Rename Service",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonColor: "#005C3A",
      confirmButtonText: "Save",
    }).then((result) => {
      if (result.isConfirmed && result.value?.trim()) {
        setServicesList((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, name: result.value.trim() } : s,
          ),
        );
      }
    });
  };

  const handleDeleteCard = (id: string) => {
    Swal.fire({
      title: "Delete Service?",
      text: "This will remove the card from view.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setServicesList((prev) => prev.filter((s) => s.id !== id));
        Swal.fire({
          title: "Deleted!",
          icon: "success",
          confirmButtonColor: "#005C3A",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Helper to resolve dynamic price from admin pricing matrix
  const getServicePrice = (service: CertificateService) => {
    const list = pricingConfig["certificate-courses"];
    if (list && Array.isArray(list)) {
      const match = list.find((item) => item.id === service.priceKey);
      if (match && match.retailerPrice !== undefined) {
        return Number(match.retailerPrice);
      }
    }
    return service.defaultPrice;
  };

  const handleCardClick = (service: CertificateService) => {
    setSelectedService(service);
    setSubmissionSuccess(false);
    setActiveForm(service.id);
  };

  const handleFormSubmit = (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setActiveForm(null);
        setSubmissionSuccess(false);
      }, 3000);
    }, 1500);
  };

  const renderServiceIcon = (id: string, className = "w-24 h-24") => {
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;

    if (id === "course-tailoring") {
      return (
        <svg
          className={className}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Background Box */}
          <rect
            width="100"
            height="100"
            rx="12"
            fill="#FEFDF0"
            stroke="#FEF3C7"
            strokeWidth="1"
          />
          {/* Certificate background shape */}
          <rect
            x="25"
            y="20"
            width="50"
            height="35"
            rx="3"
            fill="#84CC16"
            opacity="0.15"
          />

          {/* Tailoring Certificate Central Label Shield */}
          <rect x="20" y="58" width="60" height="22" rx="6" fill="#4D7C0F" />
          <text
            x="50"
            y="71"
            fill="#FFFFFF"
            fontSize="6.5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Tailoring
          </text>
          <text
            x="50"
            y="77"
            fill="#BEF264"
            fontSize="4.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Certificate
          </text>

          {/* Sewing/Tailoring Vector Elements */}
          {/* Mannequin / Dress Form */}
          <path
            d="M72 26C72 28.5 70 32 68 36H76C74 32 72 28.5 72 26Z"
            fill="#D97706"
          />
          <line
            x1="72"
            y1="36"
            x2="72"
            y2="52"
            stroke="#92400E"
            strokeWidth="2"
          />
          <line
            x1="66"
            y1="52"
            x2="78"
            y2="52"
            stroke="#92400E"
            strokeWidth="2"
          />

          {/* Spools of thread */}
          <rect x="24" y="38" width="8" height="12" rx="1" fill="#EF4444" />
          <line
            x1="24"
            y1="36"
            x2="32"
            y2="36"
            stroke="#991B1B"
            strokeWidth="1.5"
          />
          <line
            x1="24"
            y1="51"
            x2="32"
            y2="51"
            stroke="#991B1B"
            strokeWidth="1.5"
          />
          {/* Thread wraps */}
          <line
            x1="24"
            y1="40"
            x2="32"
            y2="40"
            stroke="#FEE2E2"
            strokeWidth="1"
          />
          <line
            x1="24"
            y1="43"
            x2="32"
            y2="43"
            stroke="#FEE2E2"
            strokeWidth="1"
          />
          <line
            x1="24"
            y1="46"
            x2="32"
            y2="46"
            stroke="#FEE2E2"
            strokeWidth="1"
          />

          <rect x="36" y="38" width="8" height="12" rx="1" fill="#3B82F6" />
          <line
            x1="36"
            y1="36"
            x2="44"
            y2="36"
            stroke="#1D4ED8"
            strokeWidth="1.5"
          />
          <line
            x1="36"
            y1="51"
            x2="44"
            y2="51"
            stroke="#1D4ED8"
            strokeWidth="1.5"
          />
          {/* Thread wraps */}
          <line
            x1="36"
            y1="40"
            x2="44"
            y2="40"
            stroke="#DBEAFE"
            strokeWidth="1"
          />
          <line
            x1="36"
            y1="43"
            x2="44"
            y2="43"
            stroke="#DBEAFE"
            strokeWidth="1"
          />
          <line
            x1="36"
            y1="46"
            x2="44"
            y2="46"
            stroke="#DBEAFE"
            strokeWidth="1"
          />

          {/* Sewing Needle */}
          <line
            x1="48"
            y1="24"
            x2="58"
            y2="48"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="49" cy="26" r="0.75" fill="#FEFDF0" />

          {/* Measuring Tape */}
          <path
            d="M22 52C32 48 42 56 52 50C62 44 72 52 78 48"
            stroke="#FBBF24"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="1 1.5"
          />

          {/* Mini Certificate Icon in BG */}
          <rect
            x="34"
            y="24"
            width="28"
            height="18"
            rx="1"
            fill="white"
            stroke="#A3E635"
            strokeWidth="1"
          />
          <line
            x1="38"
            y1="28"
            x2="58"
            y2="28"
            stroke="#D1D5DB"
            strokeWidth="1"
          />
          <line
            x1="38"
            y1="31"
            x2="54"
            y2="31"
            stroke="#D1D5DB"
            strokeWidth="1"
          />
          <line
            x1="38"
            y1="34"
            x2="58"
            y2="34"
            stroke="#D1D5DB"
            strokeWidth="1"
          />
          <circle cx="56" cy="38" r="2" fill="#E11D48" />
        </svg>
      );
    }

    if (id === "course-computer") {
      return (
        <svg
          className={className}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Background Box */}
          <rect
            width="100"
            height="100"
            rx="12"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
          />

          {/* Certificate in Computer Skills frame */}
          <rect
            x="20"
            y="20"
            width="60"
            height="42"
            rx="3"
            fill="#EFF6FF"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
          {/* Certificate Header Banner */}
          <rect x="20" y="20" width="60" height="8" rx="1" fill="#1D4ED8" />
          <text
            x="50"
            y="26"
            fill="#FFFFFF"
            fontSize="4"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
            letterSpacing="0.2"
          >
            CERTIFICATE IN COMPUTER SKILLS
          </text>

          {/* Recipient Line */}
          <line
            x1="30"
            y1="36"
            x2="70"
            y2="36"
            stroke="#94A3B8"
            strokeWidth="0.75"
          />
          <text
            x="50"
            y="34.5"
            fill="#475569"
            fontSize="3"
            fontStyle="italic"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Recipient&apos;s Name
          </text>

          {/* Bottom texts */}
          <text
            x="50"
            y="44"
            fill="#1E40AF"
            fontSize="3.5"
            fontWeight="extrabold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Computer Skills & Application
          </text>

          {/* Signatures */}
          <line
            x1="28"
            y1="54"
            x2="42"
            y2="54"
            stroke="#94A3B8"
            strokeWidth="0.75"
          />
          <line
            x1="58"
            y1="54"
            x2="72"
            y2="54"
            stroke="#94A3B8"
            strokeWidth="0.75"
          />
          <text
            x="35"
            y="58"
            fill="#64748B"
            fontSize="2.5"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Instructor
          </text>
          <text
            x="65"
            y="58"
            fill="#64748B"
            fontSize="2.5"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Director
          </text>

          {/* Computer / Tech overlay graphics */}
          {/* Laptop monitor */}
          <rect x="38" y="70" width="24" height="14" rx="1.5" fill="#0F172A" />
          <rect x="40" y="72" width="20" height="10" fill="#3B82F6" />
          <rect x="34" y="84" width="32" height="2" fill="#64748B" />

          {/* Network icon */}
          <circle cx="28" cy="74" r="3" fill="#60A5FA" />
          <path d="M26 76C26 73.5 30 73.5 30 76H26Z" fill="#1D4ED8" />

          {/* CD/DVD representation */}
          <circle
            cx="72"
            cy="76"
            r="6"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <circle cx="72" cy="76" r="2" fill="#64748B" />
        </svg>
      );
    }

    if (id === "course-beautician") {
      return (
        <svg
          className={className}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Background Box */}
          <rect
            width="100"
            height="100"
            rx="12"
            fill="#FFF5F5"
            stroke="#FFE4E6"
            strokeWidth="1"
          />

          {/* Certificate Boarder */}
          <rect
            x="18"
            y="16"
            width="64"
            height="42"
            rx="2"
            fill="#FFF"
            stroke="#FDA4AF"
            strokeWidth="1.5"
          />
          <rect
            x="20"
            y="18"
            width="60"
            height="38"
            fill="none"
            stroke="#FECDD3"
            strokeWidth="0.75"
            strokeDasharray="3 1"
          />

          {/* Title */}
          <text
            x="50"
            y="25"
            fill="#BE123C"
            fontSize="5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            letterSpacing="0.5"
          >
            BEAUTICIAN CERTIFICATE
          </text>

          {/* Recipient's Name */}
          <text
            x="50"
            y="33"
            fill="#E11D48"
            fontSize="3.5"
            fontStyle="italic"
            textAnchor="middle"
            fontFamily="serif"
          >
            Recipient&apos;s Name
          </text>
          <line
            x1="30"
            y1="35"
            x2="70"
            y2="35"
            stroke="#FDA4AF"
            strokeWidth="0.75"
          />

          <text
            x="50"
            y="42"
            fill="#4C0519"
            fontSize="3"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            For successfully completing the course in
          </text>
          <text
            x="50"
            y="47"
            fill="#E11D48"
            fontSize="4"
            fontWeight="extrabold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Beauty & Hair
          </text>

          {/* Signatures */}
          <line
            x1="62"
            y1="52"
            x2="76"
            y2="52"
            stroke="#FDA4AF"
            strokeWidth="0.75"
          />
          <text
            x="69"
            y="55"
            fill="#9F1239"
            fontSize="2.2"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Authorized Signature
          </text>

          {/* Beautician items vector graphics */}
          {/* Cosmetics bottles & flower */}
          <rect x="22" y="68" width="6" height="14" rx="1" fill="#F43F5E" />
          <rect x="23" y="65" width="4" height="3" fill="#FB7185" />

          <rect x="30" y="72" width="5" height="10" rx="1" fill="#FB7185" />
          <rect x="31" y="70" width="3" height="2" fill="#F43F5E" />

          {/* Compact makeup box */}
          <circle
            cx="41"
            cy="78"
            r="4"
            fill="#FFF"
            stroke="#FDA4AF"
            strokeWidth="1"
          />
          <circle cx="41" cy="78" r="2.5" fill="#FFE4E6" />

          {/* Roses/Flowers decoration */}
          <circle cx="70" cy="76" r="4" fill="#FB7185" />
          <circle cx="73" cy="74" r="3.5" fill="#FDA4AF" />
          <circle cx="75" cy="78" r="4.2" fill="#F43F5E" />
          <circle cx="72" cy="77" r="1.5" fill="#FFF" />
        </svg>
      );
    }

    return null;
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <ServiceNavigation
          pageName="Certificate Courses"
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          activeFormLabel={selectedService?.name}
        />

        {/* CONDITIONALLY RENDER CARDS DIRECTORY OR THE FORM */}
        {!activeForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                Available Courses
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesList.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  icon={renderServiceIcon(service.id, "w-24 h-24")}
                  onClick={() => handleCardClick(service)}
                  isAdmin={isAdmin}
                  onEditClick={() => handleEditCard(service.id, service.name)}
                  onDeleteClick={() => handleDeleteCard(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
              {submissionSuccess ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#005c3a] dark:text-emerald-400 animate-bounce">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Registration Submitted Successfully!
                    </h5>
                    <p className="text-sm text-slate-450 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                      Your application for the **{selectedService?.name}**
                      course has been registered successfully. You can monitor
                      the progress inside Service Status tab.
                    </p>
                  </div>
                </div>
              ) : selectedService ? (
                <CertificateCoursesForm
                  courseName={selectedService.name}
                  price={getServicePrice(selectedService)}
                  onCancel={() => setActiveForm(null)}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              ) : null}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
