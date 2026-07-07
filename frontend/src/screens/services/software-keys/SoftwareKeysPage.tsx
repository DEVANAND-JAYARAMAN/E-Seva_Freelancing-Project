"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { AppShell } from "../../../layouts/AppShell";
import { PATHS } from "../../../routes/paths";
import { ServiceCard } from "../ServiceCard";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../../components/ServicePaymentScreen";
import { useAuth } from "../../../store/context/AuthContext";
import Swal from "sweetalert2";
import { TnHealthCardForm } from "./TnHealthCardForm";
import { LongAadhaarForm } from "./LongAadhaarForm";
import { TnpdsSmartCardForm } from "./TnpdsSmartCardForm";
import { PanManualMakerForm } from "./PanManualMakerForm";
import { EshramIdForm } from "./EshramIdForm";
import { EpicVoterIdForm } from "./EpicVoterIdForm";
import { PahalAadhaarPdfForm } from "./PahalAadhaarPdfForm";
import { PassportSizePhotoForm } from "./PassportSizePhotoForm";
import { RcPvcForm } from "./RcPvcForm";
import { DlPvcForm } from "./DlPvcForm";
import { TamilAstrologyForm } from "./TamilAstrologyForm";
import { FishermanCardForm } from "./FishermanCardForm";
import { InstantPanCardForm } from "./InstantPanCardForm";

interface SoftwareCardItem {
  id: string;
  name: string;
  price: number;
  iconBg: string;
}

export function SoftwareKeysPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSoftware, setSelectedSoftware] =
    useState<SoftwareCardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [softwareList, setSoftwareList] = useState<SoftwareCardItem[]>([
    {
      id: "tn-health-qr",
      name: "TN - Health Card Maker With QR",
      price: 149.0,
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "long-aadhaar",
      name: "Long Adhaar Setup",
      price: 400.0,
      iconBg: "bg-sky-50 dark:bg-sky-950/20",
    },
    {
      id: "tnpds-smart-pvc",
      name: "TNPDS Smart Card PVC Maker",
      price: 400.0,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      id: "pan-nsdl-uti-manual",
      name: "Pan Card NSDL and UTI Manual Maker",
      price: 400.0,
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      id: "eshram-id",
      name: "Eshram Id Maker",
      price: 400.0,
      iconBg: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      id: "epic-voter-id",
      name: "Epic Voter Id Maker",
      price: 400.0,
      iconBg: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      id: "pahal-aadhaar-pdf",
      name: "Pahal Aadhaar pdf Maker",
      price: 400.0,
      iconBg: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      id: "passport-photo",
      name: "Passport Size photo Maker",
      price: 400.0,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      id: "rc-pvc",
      name: "RC PVC Maker",
      price: 400.0,
      iconBg: "bg-orange-100 dark:bg-orange-950/25",
    },
    {
      id: "dl-pvc",
      name: "DL PVC Maker",
      price: 400.0,
      iconBg: "bg-cyan-50 dark:bg-cyan-950/20",
    },
    {
      id: "tamil-astrology",
      name: "Tamil Astrology",
      price: 400.0,
      iconBg: "bg-amber-100 dark:bg-amber-950/25",
    },
    {
      id: "fisherman-card",
      name: "Fisherman Card",
      price: 400.0,
      iconBg: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      id: "instant-pan",
      name: "INSTANT PAN CARD",
      price: 400.0,
      iconBg: "bg-sky-100 dark:bg-sky-950/30",
    },
  ]);

  const filteredSoftware = useMemo(() => {
    return softwareList.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, softwareList]);

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
        setSoftwareList((prev) =>
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
        setSoftwareList((prev) => prev.filter((s) => s.id !== id));
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

  const handleCardClick = (software: SoftwareCardItem) => {
    setSelectedSoftware(software);
    setFormData({ quantity: "1" });
    setErrors({});
    setPaymentPhase("form");
    setActiveForm(software.id);
  };

  const handleFieldChange = (field: string, val: string, file?: File) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoftware) return;

    const newErrors: Record<string, string> = {};
    if (!formData.customerEmail?.trim()) {
      newErrors.customerEmail = "Customer Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Invalid email address";
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = () => {
    setPaymentPhase("success");
    setTimeout(() => {
      setIsModalOpen(false);
      setActiveForm(null);
      setPaymentPhase("form");
      setFormData({});
    }, 3000);
  };

  const renderSoftwareIcon = (id: string, className = "w-16 h-16") => {
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;

    switch (id) {
      case "epro-13-1":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id={`grad-${uniqueId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#db2777"
              strokeWidth="1.5"
            />
            <ellipse
              cx="40"
              cy="32"
              rx="28"
              ry="14"
              fill={`url(#grad-${uniqueId})`}
            />
            <text
              x="40"
              y="36"
              fill="white"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              e PRO 12.5
            </text>
            <rect x="18" y="52" width="44" height="12" rx="6" fill="#fbcfe8" />
            <text
              x="40"
              y="60.5"
              fill="#9d174d"
              fontSize="6.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              EPRO - 13
            </text>
          </svg>
        );

      case "tn-health-qr":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="18"
              width="44"
              height="28"
              rx="2"
              fill="#eff6ff"
              stroke="#3b82f6"
              strokeWidth="1.2"
            />
            <rect x="18" y="18" width="44" height="5" fill="#1e3a8a" />
            <rect x="22" y="27" width="10" height="12" rx="1" fill="#bfdbfe" />
            <circle cx="27" cy="31" r="2.5" fill="#1e40af" />
            <path
              d="M24 37.5C24 35.5 25.5 35 27 35C28.5 35 30 35.5 30 37.5H24Z"
              fill="#1e40af"
            />
            <rect x="44" y="27" width="12" height="12" fill="#1e3a8a" />
            <rect x="46" y="29" width="3" height="3" fill="white" />
            <rect x="51" y="29" width="3" height="3" fill="white" />
            <rect x="46" y="34" width="3" height="3" fill="white" />
            <rect x="51" y="34" width="3" height="3" fill="white" />
            <text
              x="40"
              y="58"
              fill="#1e3a8a"
              fontSize="5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              HEALTH ID
            </text>
          </svg>
        );

      case "long-aadhaar":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="24"
              width="44"
              height="18"
              rx="1.5"
              fill="#fff7ed"
              stroke="#ffedd5"
              strokeWidth="1"
            />
            <rect x="18" y="24" width="44" height="4" fill="#ea580c" />
            <line
              x1="22"
              y1="32"
              x2="38"
              y2="32"
              stroke="#ea580c"
              strokeWidth="1.2"
            />
            <line
              x1="22"
              y1="36"
              x2="34"
              y2="36"
              stroke="#ea580c"
              strokeWidth="1.2"
            />
            <circle cx="52" cy="33" r="3.5" fill="#ea580c" opacity="0.3" />
            <text
              x="40"
              y="58"
              fill="#ea580c"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              LONG AADHAAR
            </text>
          </svg>
        );

      case "tnpds-smart-pvc":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#059669"
              strokeWidth="1.5"
            />
            <rect
              x="16"
              y="22"
              width="48"
              height="26"
              rx="3"
              fill="#ecfdf5"
              stroke="#059669"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="35" r="4.5" fill="#a7f3d0" />
            <circle cx="56" cy="35" r="4.5" fill="#a7f3d0" />
            <rect x="32" y="28" width="16" height="3" rx="0.5" fill="#059669" />
            <rect x="32" y="34" width="12" height="3" rx="0.5" fill="#059669" />
            <text
              x="40"
              y="60"
              fill="#047857"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              TNPDS MAKER
            </text>
          </svg>
        );

      case "pan-nsdl-uti-manual":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="20"
              width="44"
              height="26"
              rx="2"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="1"
            />
            <rect x="22" y="24" width="8" height="10" rx="0.5" fill="#f59e0b" />
            <line
              x1="34"
              y1="24"
              x2="56"
              y2="24"
              stroke="#b45309"
              strokeWidth="1.2"
            />
            <line
              x1="34"
              y1="29"
              x2="52"
              y2="29"
              stroke="#b45309"
              strokeWidth="1.2"
            />
            <circle cx="50" cy="38" r="3.5" fill="#b45309" opacity="0.6" />
            <text
              x="40"
              y="60"
              fill="#b45309"
              fontSize="5.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              PAN MANUAL
            </text>
          </svg>
        );

      case "eshram-id":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="22"
              width="44"
              height="26"
              rx="2.5"
              fill="#fef9c3"
              stroke="#eab308"
              strokeWidth="1.2"
            />
            <path d="M18 22H62V28H18V22Z" fill="#eab308" />
            <circle
              cx="40"
              cy="35"
              r="5"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="1.2"
            />
            <path
              d="M40 32.5V37.5M37.5 35H42.5"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            <text
              x="40"
              y="60"
              fill="#ca8a04"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              E-SHRAM MAKER
            </text>
          </svg>
        );

      case "epic-voter-id":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#e11d48"
              strokeWidth="1.5"
            />
            <rect
              x="20"
              y="18"
              width="40"
              height="30"
              rx="3"
              fill="#fff1f2"
              stroke="#e11d48"
              strokeWidth="1.2"
            />
            <rect
              x="24"
              y="22"
              width="12"
              height="14"
              rx="1"
              fill="#fecdd3"
              stroke="#e11d48"
              strokeWidth="0.5"
            />
            <circle cx="30" cy="27" r="2.5" fill="#e11d48" />
            <path
              d="M27 33C27 31.5 28.5 31 30 31C31.5 31 33 31.5 33 33H27Z"
              fill="#e11d48"
            />
            <line
              x1="40"
              y1="22"
              x2="54"
              y2="22"
              stroke="#e11d48"
              strokeWidth="1.2"
            />
            <line
              x1="40"
              y1="27"
              x2="50"
              y2="27"
              stroke="#e11d48"
              strokeWidth="1.2"
            />
            <text
              x="40"
              y="60"
              fill="#be123c"
              fontSize="5.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              EPIC VOTER
            </text>
          </svg>
        );

      case "pahal-aadhaar-pdf":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            <circle
              cx="40"
              cy="32"
              r="14"
              fill="#ffedd5"
              stroke="#ea580c"
              strokeWidth="1"
            />
            <path
              d="M40 22C34.5 22 30 26.5 30 32C30 37.5 34.5 42 40 42C45.5 42 50 37.5 50 32C50 26.5 45.5 22 40 22ZM40 26C41.7 26 43 27.3 43 29C43 30.7 41.7 32 40 32C38.3 32 37 30.7 37 29C37 27.3 38.3 26 40 26ZM40 40C36.5 40 34 38.5 34 36.5C34 34.5 36.5 34 40 34C43.5 34 46 34.5 46 36.5C46 38.5 43.5 40 40 40Z"
              fill="#ea580c"
            />
            <text
              x="40"
              y="60"
              fill="#ea580c"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              PAHAL MAKER
            </text>
          </svg>
        );

      case "passport-photo":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />
            <rect
              x="22"
              y="20"
              width="16"
              height="18"
              fill="#e0e7ff"
              stroke="#4f46e5"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="26" r="3" fill="#4f46e5" />
            <path
              d="M26 34C26 31 28 31 30 31C32 31 34 31 34 34H26Z"
              fill="#4f46e5"
            />

            <rect
              x="42"
              y="20"
              width="16"
              height="18"
              fill="#e0e7ff"
              stroke="#4f46e5"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="26" r="3" fill="#4f46e5" />
            <path
              d="M46 34C46 31 48 31 50 31C52 31 54 31 54 34H46Z"
              fill="#4f46e5"
            />

            <rect
              x="22"
              y="42"
              width="16"
              height="18"
              fill="#e0e7ff"
              stroke="#4f46e5"
              strokeWidth="0.8"
            />
            <circle cx="30" cy="48" r="3" fill="#4f46e5" />
            <path
              d="M26 56C26 53 28 53 30 53C32 53 34 53 34 56H26Z"
              fill="#4f46e5"
            />

            <rect
              x="42"
              y="42"
              width="16"
              height="18"
              fill="#e0e7ff"
              stroke="#4f46e5"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="48" r="3" fill="#4f46e5" />
            <path
              d="M46 56C46 53 48 53 50 53C52 53 54 53 54 56H46Z"
              fill="#4f46e5"
            />

            <rect x="18" y="62" width="44" height="10" rx="3" fill="#e0e7ff" />
            <text
              x="40"
              y="69.5"
              fill="#312e81"
              fontSize="5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              PASSPORT PHOTO
            </text>
          </svg>
        );

      case "rc-pvc":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            <circle
              cx="40"
              cy="34"
              r="16"
              fill="#ffedd5"
              stroke="#ea580c"
              strokeWidth="1"
            />
            <path
              d="M30 38C30 38 33 32 38 32C43 32 46 38 46 38"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="33" cy="40" r="2.5" fill="#ea580c" />
            <circle cx="47" cy="40" r="2.5" fill="#ea580c" />
            <path d="M33 40H47" stroke="#ea580c" strokeWidth="1.2" />
            <path d="M38 32V26H35" stroke="#ea580c" strokeWidth="1.5" />
            <text
              x="40"
              y="60"
              fill="#ea580c"
              fontSize="6"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              RC PVC MAKER
            </text>
          </svg>
        );

      case "dl-pvc":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#0891b2"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="22"
              width="44"
              height="26"
              rx="2.5"
              fill="#ecfeff"
              stroke="#0891b2"
              strokeWidth="1.2"
            />
            <rect x="22" y="27" width="8" height="10" rx="0.5" fill="#0891b2" />
            <line
              x1="34"
              y1="27"
              x2="56"
              y2="27"
              stroke="#0891b2"
              strokeWidth="1.2"
            />
            <line
              x1="34"
              y1="32"
              x2="50"
              y2="32"
              stroke="#0891b2"
              strokeWidth="1.2"
            />
            <text
              x="40"
              y="60"
              fill="#0891b2"
              fontSize="6"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              DL PVC MAKER
            </text>
          </svg>
        );

      case "tamil-astrology":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <circle
              cx="40"
              cy="32"
              r="16"
              fill="none"
              stroke="#d97706"
              strokeWidth="1.2"
            />
            <circle
              cx="40"
              cy="32"
              r="8"
              fill="none"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="16"
              x2="40"
              y2="48"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <line
              x1="24"
              y1="32"
              x2="56"
              y2="32"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <line
              x1="28.7"
              y1="20.7"
              x2="51.3"
              y2="43.3"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <line
              x1="28.7"
              y1="43.3"
              x2="51.3"
              y2="20.7"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            <text
              x="40"
              y="60"
              fill="#b45309"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              TAMIL ASTROLOGY
            </text>
          </svg>
        );

      case "fisherman-card":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#2563eb"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="22"
              width="44"
              height="26"
              rx="3"
              fill="#eff6ff"
              stroke="#2563eb"
              strokeWidth="1.2"
            />
            <path
              d="M22 38C26 35 30 41 34 38C38 35 42 41 46 38C50 35 54 41 58 38"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M26 30C28 32 30 32 32 30C34 28 32 26 30 26C28 26 26 28 26 30Z"
              fill="#2563eb"
            />
            <text
              x="40"
              y="60"
              fill="#1d4ed8"
              fontSize="5.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              FISHERMAN CARD
            </text>
          </svg>
        );

      case "instant-pan":
        return (
          <svg
            className={className}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="white"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="20"
              width="44"
              height="26"
              rx="2"
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth="1.2"
            />
            <text
              x="40"
              y="31"
              fill="#0369a1"
              fontSize="5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="Impact"
            >
              INSTANT
            </text>
            <text
              x="40"
              y="38"
              fill="#0369a1"
              fontSize="6.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="Impact"
            >
              PAN CARD
            </text>
            <circle cx="54" cy="26" r="3.5" fill="#10b981" />
            <path
              d="M52 26L53.5 27.5L56 24.5"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <text
              x="40"
              y="60"
              fill="#0369a1"
              fontSize="5.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              INSTANT PAN
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  const renderActiveForm = () => {
    if (!selectedSoftware) return null;
    const props = {
      price: selectedSoftware.price,
      onSubmit: (data: any) => {
        setFormData(data);
        setPaymentPhase("payment");
      },
      onCancel: () => setActiveForm(null),
    };

    switch (activeForm) {
      case "tn-health-qr":
        return <TnHealthCardForm {...props} />;
      case "long-aadhaar":
        return <LongAadhaarForm {...props} />;
      case "tnpds-smart-pvc":
        return <TnpdsSmartCardForm {...props} />;
      case "pan-nsdl-uti-manual":
        return <PanManualMakerForm {...props} />;
      case "eshram-id":
        return <EshramIdForm {...props} />;
      case "epic-voter-id":
        return <EpicVoterIdForm {...props} />;
      case "pahal-aadhaar-pdf":
        return <PahalAadhaarPdfForm {...props} />;
      case "passport-photo":
        return <PassportSizePhotoForm {...props} />;
      case "rc-pvc":
        return <RcPvcForm {...props} />;
      case "dl-pvc":
        return <DlPvcForm {...props} />;
      case "tamil-astrology":
        return <TamilAstrologyForm {...props} />;
      case "fisherman-card":
        return <FishermanCardForm {...props} />;
      case "instant-pan":
        return <InstantPanCardForm {...props} />;
      default:
        return null;
    }
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#090d16] border-2 border-black rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <span
              onClick={() => {
                setActiveForm(null);
                router.push(PATHS.SERVICES);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Services Directory
            </span>
            <span className="text-slate-350 select-none">/</span>
            <span
              onClick={() => setActiveForm(null)}
              className={`${
                activeForm
                  ? "text-slate-450 dark:text-slate-555 hover:text-[#005c3a] dark:hover:text-emerald-400 cursor-pointer"
                  : "text-[#005c3a] dark:text-emerald-400 pointer-events-none"
              } font-bold uppercase text-xs tracking-wider transition-colors`}
            >
              Software Keys
            </span>
            {activeForm && (
              <>
                <span className="text-slate-350 select-none">/</span>
                <span className="text-[#005c3a] dark:text-emerald-400 font-bold uppercase text-xs tracking-wider">
                  {selectedSoftware?.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Search Input (Only show when viewing directory) */}
            {!activeForm && (
              <div className="relative max-w-xs w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-555 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search software keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
                />
              </div>
            )}
            <button
              onClick={() => {
                if (activeForm) {
                  setActiveForm(null);
                } else {
                  router.push(PATHS.SERVICES);
                }
              }}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 hover:text-slate-755 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER: CARDS GRID OR INLINE FORM */}
        {!activeForm ? (
          /* CARDS DIRECTORY GRID */
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-900/40 pb-3">
              <span className="flex h-2 w-2 rounded-full bg-[#005c3a] animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">
                Available Softwares & Makers
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {filteredSoftware.map((software) => (
                <div
                  key={software.id}
                  onClick={() => handleCardClick(software)}
                  className="bg-white dark:bg-[#090d16] border-2 border-black rounded-3xl p-5 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden hover:translate-y-[-4px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 to-transparent dark:from-slate-900/5 to-transparent pointer-events-none" />

                  {/* Admin edit/delete buttons */}
                  {isAdmin && (
                    <div
                      className="absolute top-2 right-2 flex gap-1 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          handleEditCard(software.id, software.name)
                        }
                        className="p-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-[#005C3A] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors shadow-sm"
                        title="Rename"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(software.id)}
                        className="p-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center ${software.iconBg} group-hover:scale-105 transition-transform duration-300 p-2 shadow-inner`}
                  >
                    {renderSoftwareIcon(software.id, "w-20 h-20")}
                  </div>

                  <div className="space-y-1 mt-4">
                    <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-xs leading-snug min-h-[32px] flex items-center justify-center">
                      {software.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* RENDER CUSTOM APPLY FORM INLINE */
          <div className="w-full">
            {paymentPhase === "success" && selectedSoftware ? (
              <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
                <ServiceSuccessScreen serviceName={selectedSoftware.name} />
              </div>
            ) : paymentPhase === "payment" && selectedSoftware ? (
              <div className="w-full bg-white dark:bg-[#090d16] border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden animate-in fade-in duration-200">
                <div className="py-2">
                  <ServicePaymentScreen
                    serviceName={selectedSoftware.name}
                    retailerCharge={selectedSoftware.price}
                    formData={formData}
                    onBack={() => setPaymentPhase("form")}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>
            ) : selectedSoftware ? (
              renderActiveForm()
            ) : null}
          </div>
        )}

        {/* MODAL / DRAWER INTERACTIVE FORM (For other keys) */}
        {isModalOpen && selectedSoftware && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#090d16] border-2 border-black rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10 p-6 flex flex-col gap-5">
              {/* Form Success State Screen */}
              {paymentPhase === "success" ? (
                <ServiceSuccessScreen serviceName={selectedSoftware.name} />
              ) : paymentPhase === "payment" ? (
                <div className="py-2">
                  <ServicePaymentScreen
                    serviceName={selectedSoftware.name}
                    retailerCharge={selectedSoftware.price}
                    formData={formData}
                    onBack={() => setPaymentPhase("form")}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                        {renderSoftwareIcon(selectedSoftware.id, "w-10 h-10")}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                          {selectedSoftware.name}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-555 uppercase tracking-widest mt-0.5">
                          Purchase License Key
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex flex-col gap-4"
                  >
                    {/* Software Type (Read-Only) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Software Type
                      </label>
                      <input
                        type="text"
                        value={selectedSoftware.name}
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity || "1"}
                        onChange={(e) =>
                          handleFieldChange("quantity", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005c3a]/15 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                          errors.quantity
                            ? "border-rose-450 dark:border-rose-500/50"
                            : "border-slate-200 dark:border-slate-850 focus:border-[#005c3a]"
                        }`}
                      />
                      {errors.quantity && (
                        <span className="text-[10px] font-semibold text-rose-500">
                          {errors.quantity}
                        </span>
                      )}
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                        Customer Email (for key delivery)
                      </label>
                      <input
                        type="email"
                        placeholder="customer@example.com"
                        value={formData.customerEmail || ""}
                        onChange={(e) =>
                          handleFieldChange("customerEmail", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005c3a]/15 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                          errors.customerEmail
                            ? "border-rose-450 dark:border-rose-500/50"
                            : "border-slate-200 dark:border-slate-850 focus:border-[#005c3a]"
                        }`}
                      />
                      {errors.customerEmail && (
                        <span className="text-[10px] font-semibold text-rose-500">
                          {errors.customerEmail}
                        </span>
                      )}
                    </div>

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
