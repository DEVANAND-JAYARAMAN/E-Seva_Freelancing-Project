"use client";

import { useState, useMemo } from "react";
import {
  Home,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Settings,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "../layouts/AppShell";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../store/context/AuthContext";

// Catalog item representing main services in grid
export interface ServiceCatalogItem {
  id: string;
  name: string;
  subName?: string;
  color: string;
}

// Sub Service row structure inside table
interface SubService {
  id: string;
  name: string;
  adminPrice: number;
  distributorPrice: number;
  retailerPrice: number;
  needCoordinator: boolean;
}

// Pre-populated mapping from card catalog items to their specific pricing rows
const DEFAULT_SUB_SERVICES: Record<string, SubService[]> = {
  tnega: [
    {
      id: "tnega-main",
      name: "TNeGA Services",
      adminPrice: 60.0,
      distributorPrice: 60.0,
      retailerPrice: 60.0,
      needCoordinator: false,
    },
    {
      id: "tnega-income",
      name: "Income Certificate",
      adminPrice: 60.0,
      distributorPrice: 60.0,
      retailerPrice: 60.0,
      needCoordinator: false,
    },
    {
      id: "tnega-community",
      name: "Community Certificate",
      adminPrice: 60.0,
      distributorPrice: 60.0,
      retailerPrice: 60.0,
      needCoordinator: false,
    },
    {
      id: "tnega-nativity",
      name: "Nativity Certificate",
      adminPrice: 60.0,
      distributorPrice: 60.0,
      retailerPrice: 60.0,
      needCoordinator: false,
    },
  ],
  "software-keys": [
    {
      id: "soft-main",
      name: "Software Keys",
      adminPrice: 450.0,
      distributorPrice: 400.0,
      retailerPrice: 400.0,
      needCoordinator: false,
    },
    {
      id: "soft-win11",
      name: "Windows 11 Retail Key",
      adminPrice: 800.0,
      distributorPrice: 750.0,
      retailerPrice: 750.0,
      needCoordinator: false,
    },
    {
      id: "soft-office",
      name: "Office 2021 Key",
      adminPrice: 1200.0,
      distributorPrice: 1100.0,
      retailerPrice: 1100.0,
      needCoordinator: false,
    },
  ],
  msme: [
    {
      id: "msme-main",
      name: "MSME",
      adminPrice: 200.0,
      distributorPrice: 100.0,
      retailerPrice: 100.0,
      needCoordinator: false,
    },
    {
      id: "msme-pan",
      name: "Pan To Msme Udhayam Find",
      adminPrice: 0.0,
      distributorPrice: 200.0,
      retailerPrice: 200.0,
      needCoordinator: false,
    },
    {
      id: "msme-mobile",
      name: "Mobile To Msme Udhayam Find",
      adminPrice: 0.0,
      distributorPrice: 200.0,
      retailerPrice: 200.0,
      needCoordinator: false,
    },
  ],
  "ration-card": [
    {
      id: "ration-main",
      name: "Ration Card Services",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
    {
      id: "ration-new",
      name: "New Family Card Registration",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
    {
      id: "ration-member",
      name: "Add New Family Member",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
  ],
  gst: [
    {
      id: "gst-filing",
      name: "GST Filing",
      adminPrice: 250.0,
      distributorPrice: 200.0,
      retailerPrice: 200.0,
      needCoordinator: false,
    },
    {
      id: "gst-reg",
      name: "GST Registration",
      adminPrice: 500.0,
      distributorPrice: 400.0,
      retailerPrice: 400.0,
      needCoordinator: false,
    },
    {
      id: "gst-correction",
      name: "GST Correction",
      adminPrice: 300.0,
      distributorPrice: 250.0,
      retailerPrice: 250.0,
      needCoordinator: false,
    },
  ],
  "aadhaar-card-address": [
    {
      id: "aadhaar-main",
      name: "Adhaar Card (Address Correction)",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
    {
      id: "aadhaar-address",
      name: "Aadhaar Address Update",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
    {
      id: "aadhaar-mobile",
      name: "Aadhaar Mobile Link Info",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
  ],
  "can-edit": [
    {
      id: "can-main",
      name: "CAN EDIT",
      adminPrice: 60.0,
      distributorPrice: 50.0,
      retailerPrice: 50.0,
      needCoordinator: false,
    },
    {
      id: "can-new",
      name: "Create CAN Number",
      adminPrice: 60.0,
      distributorPrice: 50.0,
      retailerPrice: 50.0,
      needCoordinator: false,
    },
    {
      id: "can-edit-sub",
      name: "CAN Correction",
      adminPrice: 60.0,
      distributorPrice: 50.0,
      retailerPrice: 50.0,
      needCoordinator: false,
    },
  ],
  "rto-services": [
    {
      id: "rto-main",
      name: "RTO Services",
      adminPrice: 150.0,
      distributorPrice: 120.0,
      retailerPrice: 120.0,
      needCoordinator: false,
    },
    {
      id: "rto-llr",
      name: "LLR Application",
      adminPrice: 150.0,
      distributorPrice: 120.0,
      retailerPrice: 120.0,
      needCoordinator: false,
    },
    {
      id: "rto-dl",
      name: "DL Renewal",
      adminPrice: 250.0,
      distributorPrice: 200.0,
      retailerPrice: 200.0,
      needCoordinator: false,
    },
  ],
  "registration-dept": [
    {
      id: "reg-main",
      name: "பதிவு துறை (Registration Dept)",
      adminPrice: 200.0,
      distributorPrice: 180.0,
      retailerPrice: 180.0,
      needCoordinator: false,
    },
    {
      id: "reg-prop",
      name: "Property Registration",
      adminPrice: 500.0,
      distributorPrice: 450.0,
      retailerPrice: 450.0,
      needCoordinator: false,
    },
    {
      id: "reg-ec",
      name: "EC Search (Encumbrance Certificate)",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
  ],
  "voter-id": [
    {
      id: "voter-main",
      name: "Voter ID",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
    {
      id: "voter-new",
      name: "New Voter Registration",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
    {
      id: "voter-correct",
      name: "Voter Correction",
      adminPrice: 80.0,
      distributorPrice: 60.0,
      retailerPrice: 60.0,
      needCoordinator: false,
    },
  ],
  fssai: [
    {
      id: "fssai-main",
      name: "FSSAI License",
      adminPrice: 180.0,
      distributorPrice: 150.0,
      retailerPrice: 150.0,
      needCoordinator: false,
    },
    {
      id: "fssai-reg",
      name: "FSSAI Registration",
      adminPrice: 200.0,
      distributorPrice: 180.0,
      retailerPrice: 180.0,
      needCoordinator: false,
    },
    {
      id: "fssai-renew",
      name: "FSSAI Renewal",
      adminPrice: 180.0,
      distributorPrice: 150.0,
      retailerPrice: 150.0,
      needCoordinator: false,
    },
  ],
  "certificate-courses": [
    {
      id: "course-tailoring",
      name: "Tailoring Certificate",
      adminPrice: 350.0,
      distributorPrice: 300.0,
      retailerPrice: 300.0,
      needCoordinator: false,
    },
    {
      id: "course-computer",
      name: "Computer Certificate",
      adminPrice: 350.0,
      distributorPrice: 300.0,
      retailerPrice: 300.0,
      needCoordinator: false,
    },
    {
      id: "course-beautician",
      name: "Beautician Certificate",
      adminPrice: 350.0,
      distributorPrice: 300.0,
      retailerPrice: 300.0,
      needCoordinator: false,
    },
  ],
  "employment-services": [
    {
      id: "emp-main",
      name: "EMPLOYMENT SERVICES",
      adminPrice: 80.0,
      distributorPrice: 70.0,
      retailerPrice: 70.0,
      needCoordinator: false,
    },
    {
      id: "emp-reg",
      name: "Employment Registration",
      adminPrice: 80.0,
      distributorPrice: 70.0,
      retailerPrice: 70.0,
      needCoordinator: false,
    },
    {
      id: "emp-renew",
      name: "Employment Renewal",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
  ],

  "police-verification": [
    {
      id: "police-main",
      name: "Police Verification",
      adminPrice: 150.0,
      distributorPrice: 130.0,
      retailerPrice: 130.0,
      needCoordinator: false,
    },
    {
      id: "police-job",
      name: "Job Verification",
      adminPrice: 150.0,
      distributorPrice: 130.0,
      retailerPrice: 130.0,
      needCoordinator: false,
    },
    {
      id: "police-tenant",
      name: "Tenant Verification",
      adminPrice: 150.0,
      distributorPrice: 130.0,
      retailerPrice: 130.0,
      needCoordinator: false,
    },
  ],

  "utisl-pan": [
    {
      id: "pan-main",
      name: "Utisl Pan",
      adminPrice: 107.0,
      distributorPrice: 99.0,
      retailerPrice: 99.0,
      needCoordinator: false,
    },
    {
      id: "pan-new-pan",
      name: "UTI New PAN",
      adminPrice: 107.0,
      distributorPrice: 99.0,
      retailerPrice: 99.0,
      needCoordinator: false,
    },
    {
      id: "pan-correct",
      name: "UTI PAN Correction",
      adminPrice: 107.0,
      distributorPrice: 99.0,
      retailerPrice: 99.0,
      needCoordinator: false,
    },
  ],

  "agri-stack-pdf": [
    {
      id: "agri-main",
      name: "Agri Stack PDF",
      adminPrice: 50.0,
      distributorPrice: 40.0,
      retailerPrice: 40.0,
      needCoordinator: false,
    },
  ],
  "pvc-card-print": [
    {
      id: "pvc-main",
      name: "PVC Card Print",
      adminPrice: 60.0,
      distributorPrice: 50.0,
      retailerPrice: 50.0,
      needCoordinator: false,
    },
  ],
  "cm-health-card": [
    {
      id: "cm-health-main",
      name: "CM Health Card",
      adminPrice: 100.0,
      distributorPrice: 80.0,
      retailerPrice: 80.0,
      needCoordinator: false,
    },
  ],
};

// Designed vectors mapping
function renderServiceImage(id: string, className = "w-14 h-14") {
  switch (id) {
    case "tnega":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tnegaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="10"
            fill="url(#tnegaGrad)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <path d="M32 14L22 38H42L32 14Z" fill="#38BDF8" />
          <path d="M28 26H36M26 32H38" stroke="#0F172A" strokeWidth="2" />
          <rect x="18" y="44" width="28" height="8" rx="2" fill="#38BDF8" />
          <text
            x="32"
            y="50"
            fill="#0F172A"
            fontSize="6.5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            TNeGA
          </text>
        </svg>
      );
    case "software-keys":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="softGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="12"
            fill="url(#softGrad)"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="1.5"
            strokeDasharray="32 8"
          />
          <circle
            cx="32"
            cy="32"
            r="14"
            fill="#1D4ED8"
            stroke="#93C5FD"
            strokeWidth="1"
          />
          <circle
            cx="32"
            cy="32"
            r="6"
            fill="#FCD34D"
            stroke="#D97706"
            strokeWidth="1"
          />
          <path
            d="M35 35L44 44M44 44L41 47M44 44L47 41"
            stroke="#FCD34D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="32"
            y="16"
            fill="white"
            fontSize="6.5"
            fontWeight="extrabold"
            textAnchor="middle"
            fontFamily="sans-serif"
            letterSpacing="1"
          >
            SOFTWARE
          </text>
        </svg>
      );
    case "msme":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="msmeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="4"
            fill="#FFFBEB"
            stroke="#D97706"
            strokeWidth="2"
          />
          <rect
            x="9"
            y="9"
            width="46"
            height="46"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="1"
            strokeDasharray="3 1"
          />
          <path
            d="M32 14C30 14 29 16 29 18C29 20 30 21 32 21C34 21 35 20 35 18C35 16 34 14 32 14Z"
            fill="#D97706"
          />
          <rect x="30" y="21" width="4" height="6" fill="#D97706" />
          <path
            d="M27 23C27 23 29 26 32 26C35 26 37 23 37 23"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <rect x="16" y="32" width="32" height="2" rx="0.5" fill="#92400E" />
          <rect x="20" y="37" width="24" height="2" rx="0.5" fill="#92400E" />
          <rect x="14" y="42" width="36" height="2" rx="0.5" fill="#92400E" />
          <rect x="18" y="46" width="28" height="8" rx="1.5" fill="#B45309" />
          <text
            x="32"
            y="52"
            fill="white"
            fontSize="6.5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            MSME
          </text>
        </svg>
      );
    case "ration-card":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="4"
            fill="url(#rationGrad)"
            stroke="#064E3B"
            strokeWidth="1.5"
          />
          <path
            d="M32 16C32 20 28 24 28 28C28 32 32 36 32 36C32 36 36 32 36 28C36 24 32 20 32 16Z"
            fill="#A7F3D0"
            opacity="0.4"
          />
          <path
            d="M32 14V42"
            stroke="#A7F3D0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="28" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="36" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="27" cy="29" r="2.5" fill="#A7F3D0" />
          <circle cx="37" cy="29" r="2.5" fill="#A7F3D0" />
          <rect x="12" y="44" width="40" height="7" rx="1.5" fill="#064E3B" />
          <text
            x="32"
            y="49.5"
            fill="#A7F3D0"
            fontSize="5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            TNEB RATION
          </text>
        </svg>
      );
    case "gst":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gstGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
            <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="12"
            fill="url(#gstGrad)"
            stroke="#F59E0B"
            strokeWidth="1"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="url(#sealGrad)"
            stroke="#B45309"
            strokeWidth="1.5"
          />
          <circle
            cx="32"
            cy="32"
            r="17"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <text
            x="32"
            y="38"
            fill="#451A03"
            fontSize="16"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="Impact, Arial Black, sans-serif"
          >
            GST
          </text>
          <text
            x="32"
            y="45"
            fill="#451A03"
            fontSize="4"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            TAX SYSTEM
          </text>
        </svg>
      );
    case "aadhaar-card-address":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="aadhaarGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFFDF5" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="12"
            width="56"
            height="40"
            rx="4"
            fill="url(#aadhaarGrad)"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <rect x="4" y="12" width="56" height="3" fill="#FF9933" />
          <rect x="4" y="15" width="56" height="3" fill="#FFFFFF" />
          <rect x="4" y="18" width="56" height="3" fill="#138808" />
          <circle cx="32" cy="16.5" r="1.2" fill="#000080" />
          <path
            d="M32 23C28.5 23 26 25.5 26 29C26 32.5 28.5 35 32 35C35.5 35 38 32.5 38 29C38 25.5 35.5 23 32 23Z"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.2"
          />
          <path
            d="M29 29C29 27 30 25.5 32 25.5C34 25.5 35 27 35 29M27.5 31C27.5 28 29.5 26.5 32 26.5C34.5 26.5 36.5 28 36.5 31"
            stroke="#EF4444"
            strokeWidth="0.8"
          />
          <text
            x="32"
            y="44"
            fill="#B45309"
            fontSize="6.5"
            fontWeight="extrabold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            AADHAAR
          </text>
          <rect x="4" y="47" width="56" height="5" fill="#EF4444" />
        </svg>
      );
    case "can-edit":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="10"
            width="48"
            height="44"
            rx="5"
            fill="#ECFDF5"
            stroke="#10B981"
            strokeWidth="2"
          />
          <rect x="8" y="10" width="48" height="12" rx="1" fill="#10B981" />
          <circle cx="16" cy="16" r="2.5" fill="white" />
          <circle cx="48" cy="16" r="2.5" fill="white" />
          <rect x="14" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="28" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="42" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="14" y="40" width="8" height="8" rx="1" fill="#A7F3D0" />
          <circle
            cx="38"
            cy="42"
            r="10"
            fill="#3B82F6"
            stroke="white"
            strokeWidth="1.5"
          />
          <path
            d="M38 36V42H43"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "rto-services":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rtoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="10"
            width="52"
            height="44"
            rx="4"
            fill="url(#rtoGrad)"
            stroke="#C2410C"
            strokeWidth="1.5"
          />
          <circle
            cx="32"
            cy="28"
            r="12"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          <circle cx="32" cy="28" r="3" fill="white" />
          <line
            x1="32"
            y1="16"
            x2="32"
            y2="40"
            stroke="white"
            strokeWidth="2.5"
          />
          <line
            x1="20"
            y1="28"
            x2="44"
            y2="28"
            stroke="white"
            strokeWidth="2.5"
          />
          <rect x="16" y="44" width="32" height="6" rx="1" fill="#7C2D12" />
          <text
            x="32"
            y="48.5"
            fill="white"
            fontSize="4.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            RTO SERVICE
          </text>
        </svg>
      );
    case "registration-dept":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="8"
            fill="url(#regGrad)"
          />
          <path
            d="M16 16C16 16 24 18 32 18C40 18 48 16 48 16V46C48 46 40 48 32 48C24 48 16 46 16 46V16Z"
            fill="white"
          />
          <line
            x1="32"
            y1="18"
            x2="32"
            y2="48"
            stroke="#BE185D"
            strokeWidth="2"
          />
          <line
            x1="20"
            y1="24"
            x2="28"
            y2="24"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <line
            x1="20"
            y1="30"
            x2="28"
            y2="30"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <line
            x1="36"
            y1="24"
            x2="44"
            y2="24"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <line
            x1="36"
            y1="30"
            x2="44"
            y2="30"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <path d="M31 18V38L33 36L35 38V18H31Z" fill="#F59E0B" />
        </svg>
      );
    case "voter-id":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="voteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="10"
            width="48"
            height="44"
            rx="4"
            fill="url(#voteGrad)"
            stroke="#0369A1"
            strokeWidth="1.5"
          />
          <circle cx="44" cy="20" r="5" fill="#E0F2FE" opacity="0.7" />
          <circle cx="44" cy="20" r="3" fill="#0284C7" />
          <rect
            x="14"
            y="16"
            width="16"
            height="20"
            rx="1"
            fill="white"
            stroke="#0369A1"
            strokeWidth="0.75"
          />
          <circle cx="22" cy="23" r="3.5" fill="#0EA5E9" />
          <path
            d="M16 32C16 29 19 29 22 29C25 29 28 29 28 32H16Z"
            fill="#0EA5E9"
          />
          <rect x="14" y="40" width="36" height="3" fill="#E0F2FE" rx="0.5" />
          <rect x="14" y="46" width="28" height="3" fill="#E0F2FE" rx="0.5" />
          <text
            x="44"
            y="32"
            fill="white"
            fontSize="6.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            VOTE
          </text>
        </svg>
      );
    case "fssai":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fssaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#65A30D" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="10"
            fill="url(#fssaiGrad)"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="white"
            stroke="#4D7C0F"
            strokeWidth="2.5"
          />
          <circle
            cx="32"
            cy="32"
            r="16"
            fill="none"
            stroke="#A3E635"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <path
            d="M32 20C32 20 25 23 25 28C25 33 32 37 32 37C32 37 39 33 39 28C39 23 32 20 32 20Z"
            fill="#65A30D"
          />
          <path
            d="M29 29L31 31L35 26"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "certificate-courses":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          <rect
            x="12"
            y="10"
            width="40"
            height="44"
            rx="2"
            fill="white"
            stroke="url(#certGrad)"
            strokeWidth="2.5"
          />
          <rect x="18" y="16" width="28" height="32" fill="#ECFEFF" />
          <circle cx="32" cy="32" r="6" fill="#EF4444" />
          <path d="M30 35L27 44L32 40L37 44L34 35H30Z" fill="#EF4444" />
          <line
            x1="22"
            y1="22"
            x2="42"
            y2="22"
            stroke="#0891B2"
            strokeWidth="2"
          />
          <line
            x1="22"
            y1="27"
            x2="38"
            y2="27"
            stroke="#0891B2"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "employment-services":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="empGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="12"
            fill="url(#empGrad)"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <path
            d="M18 34C20 30 26 30 30 34"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M46 34C44 30 38 30 34 34"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M30 34L34 34"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="24" cy="25" r="3" fill="#F59E0B" />
          <circle cx="40" cy="25" r="3" fill="#F59E0B" />
        </svg>
      );

    case "police-verification":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="10"
            width="48"
            height="44"
            rx="4"
            fill="#EFF6FF"
            stroke="#1E3A8A"
            strokeWidth="2"
          />
          <path
            d="M32 16L35 23H43L37 27L39 34L32 30L25 34L27 27L21 23H29L32 16Z"
            fill="#1E3A8A"
            stroke="#3B82F6"
            strokeWidth="1"
          />
          <circle cx="32" cy="26" r="3" fill="#F59E0B" />
          <rect x="18" y="42" width="28" height="5" rx="1" fill="#1E3A8A" />
          <text
            x="32"
            y="46"
            fill="white"
            fontSize="3.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            VERIFIED
          </text>
        </svg>
      );

    case "utisl-pan":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="utiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="14"
            width="56"
            height="36"
            rx="4"
            fill="url(#utiGrad)"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          <rect x="8" y="20" width="11" height="13" rx="1.5" fill="#E0F2FE" />
          <circle cx="13.5" cy="25" r="2.5" fill="#0369A1" />
          <path
            d="M9 31C9 28.5 12 28.5 13.5 29.5C15 28.5 18 28.5 18 31H9Z"
            fill="#0369A1"
          />
          <circle cx="50" cy="24" r="4.5" fill="#E0F2FE" opacity="0.8" />
          <text
            x="50"
            y="26.5"
            fill="#0369A1"
            fontSize="6.5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="Impact"
          >
            UTI
          </text>
          <rect x="23" y="20" width="22" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="25" width="18" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="30" width="28" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="35" width="20" height="4" rx="0.5" fill="white" />
        </svg>
      );

    case "agri-stack-pdf":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="agriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="12"
            width="56"
            height="40"
            rx="4"
            fill="#F0FDF4"
            stroke="url(#agriGrad)"
            strokeWidth="1.5"
          />
          <rect x="4" y="12" width="56" height="6" fill="url(#agriGrad)" />
          <text
            x="32"
            y="16.5"
            fill="white"
            fontSize="4.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Agri Stack
          </text>
          <rect
            x="8"
            y="22"
            width="12"
            height="15"
            rx="1"
            fill="#E8F5E9"
            stroke="#81C784"
            strokeWidth="0.5"
          />
          <circle cx="14" cy="27" r="2.5" fill="#2E7D32" />
          <path
            d="M9.5 35C9.5 32.5 12 32.5 14 33.5C16 32.5 18.5 32.5 18.5 35H9.5Z"
            fill="#2E7D32"
          />
          <rect x="24" y="22" width="22" height="2" rx="0.5" fill="#C8E6C9" />
          <rect x="24" y="26" width="18" height="2" rx="0.5" fill="#C8E6C9" />
          <rect x="24" y="30" width="30" height="2" rx="0.5" fill="#C8E6C9" />
          <rect x="24" y="34" width="26" height="2" rx="0.5" fill="#C8E6C9" />
          <rect x="4" y="44" width="56" height="8" rx="1" fill="#2E7D32" />
          <text
            x="32"
            y="50"
            fill="white"
            fontSize="4.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            FARMER ID
          </text>
        </svg>
      );
    case "pvc-card-print":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pvcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <rect
            x="14"
            y="18"
            width="40"
            height="26"
            rx="3"
            fill="#FEF3C7"
            stroke="#B45309"
            strokeWidth="1"
            transform="rotate(-8 34 31)"
          />
          <rect
            x="10"
            y="22"
            width="40"
            height="26"
            rx="3"
            fill="white"
            stroke="#D97706"
            strokeWidth="1.2"
          />
          <rect x="11.2" y="23.2" width="37.6" height="3" fill="#F59E0B" />
          <rect x="14" y="29" width="8" height="10" rx="0.5" fill="#FEF3C7" />
          <rect x="25" y="29" width="20" height="1.5" rx="0.5" fill="#E5E7EB" />
          <rect x="25" y="32" width="16" height="1.5" rx="0.5" fill="#E5E7EB" />
          <rect x="25" y="35" width="22" height="1.5" rx="0.5" fill="#E5E7EB" />
          <text
            x="30"
            y="44"
            fill="#B45309"
            fontSize="4.5"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            PVC CARD
          </text>
        </svg>
      );
    case "cm-health-card":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#4D7C0F" />
            </linearGradient>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="#F0FDF4"
            stroke="url(#healthGrad)"
            strokeWidth="2.5"
          />
          <circle
            cx="32"
            cy="32"
            r="22"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="1"
            strokeDasharray="2 1"
          />
          <circle cx="27" cy="26" r="3.5" fill="#15803D" />
          <circle cx="37" cy="26" r="3.5" fill="#15803D" />
          <circle cx="32" cy="35" r="2.5" fill="#15803D" />
          <path
            d="M22 36C22 32 26 31 27 31C28 31 32 32 32 36H22Z"
            fill="#15803D"
          />
          <path
            d="M32 36C32 32 36 31 37 31C38 31 42 32 42 36H32Z"
            fill="#15803D"
          />
          <path
            d="M29 41C29 39 31 38.5 32 38.5C33 38.5 35 39 35 41H29Z"
            fill="#15803D"
          />
          <path
            d="M16 28C14 26 14 22 16 20C18 22 18 26 16 28Z"
            fill="#4D7C0F"
          />
          <path
            d="M48 28C50 26 50 22 48 20C46 22 46 26 48 28Z"
            fill="#4D7C0F"
          />
        </svg>
      );
    default:
      return null;
  }
}

// Complete catalog items
const servicesCatalog: ServiceCatalogItem[] = [
  { id: "tnega", name: "TNeGA Services", color: "text-sky-500" },
  { id: "software-keys", name: "Software Keys", color: "text-blue-500" },
  { id: "msme", name: "MSME", color: "text-amber-500" },
  {
    id: "ration-card",
    name: "Ration Card Services",
    color: "text-emerald-500",
  },
  { id: "gst", name: "GST Filing & Reg", color: "text-amber-600" },
  {
    id: "aadhaar-card-address",
    name: "Adhaar Card (Address Correction)",
    color: "text-rose-500",
  },
  { id: "can-edit", name: "CAN EDIT", color: "text-indigo-500" },
  { id: "rto-services", name: "RTO Services", color: "text-orange-500" },
  {
    id: "registration-dept",
    name: "பதிவு துறை",
    subName: "Registration Dept",
    color: "text-pink-500",
  },
  { id: "voter-id", name: "Voter ID", color: "text-cyan-500" },
  { id: "fssai", name: "FSSAI", color: "text-lime-500" },
  {
    id: "certificate-courses",
    name: "Certificate Courses",
    color: "text-teal-500",
  },
  {
    id: "employment-services",
    name: "EMPLOYMENT SERVICES",
    color: "text-slate-500",
  },
  {
    id: "police-verification",
    name: "Police Verification",
    color: "text-violet-500",
  },
  { id: "utisl-pan", name: "Utisl Pan", color: "text-sky-500" },
  { id: "agri-stack-pdf", name: "Agri Stack PDF", color: "text-emerald-550" },
  { id: "pvc-card-print", name: "PVC Card Print", color: "text-amber-550" },
  { id: "cm-health-card", name: "CM Health Card", color: "text-lime-600" },
];

export function PaymentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  // View states: null for catalog view, item for full page service configuration view
  const [activeCatalogItem, setActiveCatalogItem] =
    useState<ServiceCatalogItem | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Pricing configuration persistent matrix
  const [pricingConfig, setPricingConfig] = useLocalStorage<
    Record<string, SubService[]>
  >("thuruvan_service_pricing_matrix_v2", DEFAULT_SUB_SERVICES);

  // Active pricing rows in editing mode (full page config view)
  const [editingRows, setEditingRows] = useState<SubService[]>([]);

  // Search filter for service cards
  const filteredCatalog = useMemo(() => {
    return servicesCatalog.filter((item) => {
      const matchName = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchSub = item.subName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchName || matchSub;
    });
  }, [searchTerm]);

  const handleCardClick = (item: ServiceCatalogItem) => {
    setActiveCatalogItem(item);
    // Initialize editing rows from persistent storage or default
    const existing = pricingConfig[item.id] ||
      DEFAULT_SUB_SERVICES[item.id] || [
        {
          id: `${item.id}-default`,
          name: item.name,
          adminPrice: 0,
          distributorPrice: 0,
          retailerPrice: 0,
          needCoordinator: false,
        },
      ];
    setEditingRows(JSON.parse(JSON.stringify(existing))); // deep copy
  };

  // Modify individual rows inside pricing table
  const handlePriceChange = (
    subServiceId: string,
    field: "adminPrice" | "distributorPrice" | "retailerPrice",
    val: string,
  ) => {
    const numeric = parseFloat(val);
    setEditingRows((prev) =>
      prev.map((row) =>
        row.id === subServiceId
          ? { ...row, [field]: isNaN(numeric) ? 0 : numeric }
          : row,
      ),
    );
  };

  const handleCoordinatorChange = (subServiceId: string, checked: boolean) => {
    setEditingRows((prev) =>
      prev.map((row) =>
        row.id === subServiceId ? { ...row, needCoordinator: checked } : row,
      ),
    );
  };

  // Submit and save configuration (returns back to card view)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCatalogItem) return;

    // Save back to persistent storage
    setPricingConfig((prev) => ({
      ...prev,
      [activeCatalogItem.id]: editingRows,
    }));

    setActiveCatalogItem(null); // Return back to cards grid view
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  return (
    <AppShell activePage="Service Payment">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* CONDITIONALLY RENDER CATALOG GRID OR FULL PAGE CONFIG TABLE */}
        {!activeCatalogItem ? (
          /* CARD GRID CATALOG VIEW */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 dark:border-slate-900/40 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#005c3a] dark:bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  Available E-Seva Utility Payments
                </h3>
              </div>
              <div className="relative max-w-xs w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-555 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search payment category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
                />
              </div>
            </div>

            {filteredCatalog.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredCatalog.map((item) => {
                  return (
                    <article
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      className="bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden hover:translate-y-[-4px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 to-transparent dark:from-slate-900/5 to-transparent pointer-events-none" />

                      {/* Centered High-Fidelity Custom Vector Illustration */}
                      <div className="h-16 w-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {renderServiceImage(item.id, "w-14 h-14")}
                      </div>

                      <div className="space-y-1 mt-4">
                        <h4 className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#005c3a] dark:group-hover:text-emerald-400 transition-colors text-sm leading-snug">
                          {item.name}
                        </h4>
                        {item.subName && (
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
                            {item.subName}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl text-center shadow-sm">
                <AlertCircle
                  size={32}
                  className="text-slate-300 dark:text-slate-700 mb-2"
                />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
                  No Payment Category Found
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  No payment options match your search term &quot;{searchTerm}
                  &quot;.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* FULL PAGE CONFIGURATION MATRIX VIEW ("OPEN NEW PAGE") */
          <div className="w-full bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-md transition-all relative overflow-hidden animate-in fade-in duration-200">
            {/* Glassmorphic Background Accents */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

            {/* Table Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-900/50 pb-4 mb-6 gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Service Payment - {activeCatalogItem.name}
                </h2>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1">
                  Configure service commission prices & coordinator eligibility
                </p>
              </div>
              <button
                onClick={() => setActiveCatalogItem(null)}
                className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors self-start sm:self-auto"
              >
                <ArrowLeft size={13} />
                <span>Back to Catalog</span>
              </button>
            </div>

            {/* Configuration Pricing Form Table */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-900/60 rounded-2xl">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-widest bg-slate-50 dark:bg-slate-950/40">
                      <th className="py-4 px-5 text-center w-20">Sl No</th>
                      <th className="py-4 px-5">Service Name</th>
                      <th className="py-4 px-5 text-center w-36">Admin</th>
                      <th className="py-4 px-5 text-center w-36">
                        Distributor
                      </th>
                      <th className="py-4 px-5 text-center w-36">Retailer</th>
                      <th className="py-4 px-5 text-center w-40">
                        Need Coordinator
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {editingRows.map((row, index) => {
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors"
                        >
                          {/* Sl No */}
                          <td className="py-4 px-5 text-center font-bold text-slate-400 dark:text-slate-500">
                            {index + 1}
                          </td>

                          {/* Service Name */}
                          <td className="py-4 px-5 font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                            {row.name}
                          </td>

                          {/* Admin Input */}
                          <td className="py-4 px-5 text-center">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-[10px]">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                  row.adminPrice === 0 ? "0.00" : row.adminPrice
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    row.id,
                                    "adminPrice",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-7 pr-3 py-1.5 text-center border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-[#0a0f18]/30 font-extrabold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a] dark:focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </td>

                          {/* Distributor Input */}
                          <td className="py-4 px-5 text-center">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-[10px]">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                  row.distributorPrice === 0
                                    ? "0.00"
                                    : row.distributorPrice
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    row.id,
                                    "distributorPrice",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-7 pr-3 py-1.5 text-center border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-[#0a0f18]/30 font-extrabold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a] dark:focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </td>

                          {/* Retailer Input */}
                          <td className="py-4 px-5 text-center">
                            <div className="relative inline-block w-full">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-[10px]">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                  row.retailerPrice === 0
                                    ? "0.00"
                                    : row.retailerPrice
                                }
                                onChange={(e) =>
                                  handlePriceChange(
                                    row.id,
                                    "retailerPrice",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-7 pr-3 py-1.5 text-center border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-[#0a0f18]/30 font-extrabold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a] dark:focus:border-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </td>

                          {/* Need Coordinator Checkbox */}
                          <td className="py-4 px-5 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={row.needCoordinator}
                                onChange={(e) =>
                                  handleCoordinatorChange(
                                    row.id,
                                    e.target.checked,
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 border border-slate-350 dark:border-slate-700 rounded-md flex items-center justify-center transition-all peer-checked:bg-[#005c3a] peer-checked:border-[#005c3a] dark:peer-checked:bg-emerald-600 dark:peer-checked:border-emerald-600 peer-checked:shadow-sm">
                                <svg
                                  className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3.5"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  ></path>
                                </svg>
                              </div>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Submit button at center bottom */}
              <div className="flex justify-center border-t border-slate-100 dark:border-slate-900/50 pt-6">
                <button
                  type="submit"
                  className="px-12 py-4 rounded-xl bg-[#005c3a] hover:bg-[#004d30] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUCCESS NOTIFICATION TOAST */}
        {showSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 dark:bg-emerald-600 border border-emerald-450 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-250">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider leading-none">
                Pricing Matrix Saved!
              </p>
              <p className="text-[10px] font-bold opacity-90 mt-1.5">
                Service pricing matrix and coordinator status updated
                successfully.
              </p>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
