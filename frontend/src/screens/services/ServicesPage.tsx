"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { PATHS } from "../../routes/paths";
import {
  Plus,
  Home,
  Search,
  Settings,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../store/context/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ServiceCard } from "./ServiceCard";
import {
  ServicePaymentScreen,
  ServiceSuccessScreen,
} from "../../components/ServicePaymentScreen";
import { AddServiceModal } from "./AddServiceModal";

// Service item interface
export interface EService {
  id: string;
  name: string;
  subName?: string;
  color: string;
  bgColor: string;
  glowColor: string;
  category: "Top" | "All";
  formFields: string[];
  price?: {
    retailer: string | number;
    distributor: string | number;
    officialCost?: string | number;
  };
  customImage?: string;
}

// Reusable custom vectors designed to look like "real images related to the heading"
function renderServiceImage(id: string, className = "w-14 h-14") {
  switch (id) {
    case "pdf-services":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
          {/* Main Paper */}
          <path
            d="M14 6C14 4.89543 14.8954 4 16 4H38L50 16V56C50 57.1046 49.1046 58 48 58H16C14.8954 58 14 57.1046 14 56V6Z"
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />
          {/* Folded Corner */}
          <path d="M38 4V16H50L38 4Z" fill="#E5E7EB" />
          <path d="M38 16L50 16" stroke="#D1D5DB" strokeWidth="1.5" />
          {/* PDF Red Badge Card */}
          <rect
            x="10"
            y="24"
            width="34"
            height="22"
            rx="3"
            fill="url(#pdfGrad)"
          />
          {/* PDF text */}
          <text
            x="27"
            y="38"
            fill="white"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="0.5"
          >
            PDF
          </text>
          {/* Red line details */}
          <rect x="27" y="41" width="10" height="1.5" fill="#FECACA" rx="0.5" />
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
          {/* Inner holographic disk representation */}
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
          {/* Shiny Key Graphic */}
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
          {/* Certificate Boarder */}
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
          {/* Lion Capital Ashoka Emblem Graphic representation */}
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
          {/* Certificate lines */}
          <rect x="16" y="32" width="32" height="2" rx="0.5" fill="#92400E" />
          <rect x="20" y="37" width="24" height="2" rx="0.5" fill="#92400E" />
          <rect x="14" y="42" width="36" height="2" rx="0.5" fill="#92400E" />
          {/* MSME Bold text badge */}
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
          {/* Card Body */}
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
          {/* Rice crop vector graphic */}
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
          {/* Stalk details */}
          <circle cx="28" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="36" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="27" cy="29" r="2.5" fill="#A7F3D0" />
          <circle cx="37" cy="29" r="2.5" fill="#A7F3D0" />
          {/* Bottom Banner */}
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
          {/* Gold Seal */}
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="url(#sealGrad)"
            stroke="#B45309"
            strokeWidth="1.5"
          />
          {/* Seal spikes */}
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
          {/* Card Frame */}
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
          {/* Flag Tricolor header band */}
          <rect x="4" y="12" width="56" height="3" fill="#FF9933" />
          <rect x="4" y="15" width="56" height="3" fill="#FFFFFF" />
          <rect x="4" y="18" width="56" height="3" fill="#138808" />
          {/* Ashoka wheel in tricolor */}
          <circle cx="32" cy="16.5" r="1.2" fill="#000080" />
          {/* Fingerprint logo in center */}
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
          {/* Aadhaar Text */}
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
          {/* Bottom Bar */}
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
          {/* Header */}
          <rect x="8" y="10" width="48" height="12" rx="1" fill="#10B981" />
          <circle cx="16" cy="16" r="2.5" fill="white" />
          <circle cx="48" cy="16" r="2.5" fill="white" />
          {/* Calendar Grid representation */}
          <rect x="14" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="28" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="42" y="28" width="8" height="8" rx="1" fill="#A7F3D0" />
          <rect x="14" y="40" width="8" height="8" rx="1" fill="#A7F3D0" />
          {/* Clock icon in bottom corner */}
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
          {/* steering wheel logo */}
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
          {/* Bottom badge */}
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
          {/* Open Register book vector */}
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
          {/* Ribbon marker */}
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
          {/* Card Body */}
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
          {/* Hologram badge */}
          <circle cx="44" cy="20" r="5" fill="#E0F2FE" opacity="0.7" />
          <circle cx="44" cy="20" r="3" fill="#0284C7" />
          {/* Passport Photo */}
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
          {/* Voter Card Details */}
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
          {/* Green circular seal */}
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
          {/* Heart / Leaf representing healthy food */}
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
          {/* Rolled Scroll / Certificate Vector */}
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
          {/* Red seal inside scroll */}
          <circle cx="32" cy="32" r="6" fill="#EF4444" />
          <path d="M30 35L27 44L32 40L37 44L34 35H30Z" fill="#EF4444" />
          {/* Lines inside scroll */}
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
          {/* Handshake vector */}
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
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
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft yellow square card matching user uploaded design */}
          <rect
            width="100"
            height="100"
            rx="12"
            fill="#FEFDF0"
            stroke="#FEF3C7"
            strokeWidth="1"
          />

          {/* Blue Circular Emblem frame */}
          <circle
            cx="50"
            cy="45"
            r="28"
            fill="#1E3A8A"
            stroke="#3B82F6"
            strokeWidth="1"
          />
          <circle cx="50" cy="45" r="25" fill="#FEFDF0" />

          {/* Srivilliputhur Temple Tower (Detailed Path Representation) */}
          <path d="M50 24L46 30H54L50 24Z" fill="#D97706" />
          <rect x="47" y="30" width="6" height="12" fill="#B45309" />
          <rect x="44" y="36" width="12" height="1" fill="#92400E" />
          <rect x="42" y="38" width="16" height="1" fill="#92400E" />
          <rect x="40" y="42" width="20" height="8" fill="#D97706" />
          <path d="M48 50C48 46 52 46 52 50H48Z" fill="#FEFDF0" />

          {/* Flag Tricolor under Tower */}
          <rect x="34" y="50" width="32" height="1.5" fill="#FF9933" />
          <rect x="34" y="51.5" width="32" height="1.5" fill="#FFFFFF" />
          <rect x="34" y="53" width="32" height="1.5" fill="#138808" />

          {/* Outer text path representation (TAMIL NADU POLICE) */}
          <path
            id="servicesTextPath"
            d="M26 45C26 31.7 36.7 21 50 21C63.3 21 74 31.7 74 45"
            fill="none"
          />
          <text
            fontSize="5.5"
            fontWeight="bold"
            fill="#1E3A8A"
            letterSpacing="0.2"
          >
            <textPath
              href="#servicesTextPath"
              startOffset="50%"
              textAnchor="middle"
            >
              TAMIL NADU POLICE
            </textPath>
          </text>

          {/* Red Ribbon Banner reading "TRUTH ALONE TRIUMPHS" */}
          <path
            d="M22 68C32 75 68 75 78 68L74 58C64 64 36 64 26 58L22 68Z"
            fill="#DC2626"
          />
          <path d="M22 68L26 58H18L22 68Z" fill="#991B1B" />
          <path d="M78 68L74 58H82L78 68Z" fill="#991B1B" />

          <text
            x="50"
            y="65"
            fill="#FFFFFF"
            fontSize="4.2"
            fontWeight="black"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            TRUTH ALONE TRIUMPHS
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
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="12"
            fill="#F0FDF4"
            stroke="url(#tnegaGrad)"
            strokeWidth="2"
          />
          <path
            d="M24 16H42C43.1046 16 44 16.8954 44 18V46C44 47.1046 43.1046 48 42 48H24C22.8954 48 22 47.1046 22 46V18C22 16.8954 22.8954 16 24 16Z"
            fill="white"
            stroke="#16A34A"
            strokeWidth="1.5"
          />
          <path
            d="M20 20V48C20 49.1046 20.8954 50 22 50H40"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="22"
            x2="38"
            y2="22"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="26"
            x2="38"
            y2="26"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="30"
            x2="34"
            y2="30"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="34"
            x2="34"
            y2="34"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="38"
            x2="34"
            y2="38"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="42"
            x2="34"
            y2="42"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="38"
            cy="36"
            r="5"
            fill="#DCFCE7"
            stroke="#16A34A"
            strokeWidth="1"
          />
          <path d="M36 39L38 33L40 39Z" fill="#16A34A" />
        </svg>
      );
    case "dharsan":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="dharsanGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          </defs>
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="12"
            fill="#FFFBEB"
            stroke="url(#dharsanGrad)"
            strokeWidth="2"
          />
          <circle cx="32" cy="30" r="16" fill="url(#haloGrad)" opacity="0.6" />
          <path
            d="M18 46V30C18 22.268 24.268 16 32 16C39.732 16 46 22.268 46 30V46"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="30" r="1.5" fill="#EA580C" />
          <circle cx="46" cy="30" r="1.5" fill="#EA580C" />
          <circle
            cx="32"
            cy="16"
            r="2.5"
            fill="#FBBF24"
            stroke="#EA580C"
            strokeWidth="1"
          />
          <path
            d="M32 24C33.6569 24 35 22.6569 35 21C35 19.3431 33.6569 18 32 18C30.3431 18 29 19.3431 29 21C29 22.6569 30.3431 24 32 24Z"
            fill="#9A3412"
          />
          <path
            d="M26 46C26 38 29 34 32 34C35 34 38 38 38 46H26Z"
            fill="#9A3412"
          />
          <line
            x1="39"
            y1="22"
            x2="39"
            y2="44"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M37 22L39 17L41 22Z"
            fill="#FBBF24"
            stroke="#EA580C"
            strokeWidth="0.75"
          />
          <path
            d="M28 46C28 44.5 29.5 43.5 32 43.5C34.5 43.5 36 44.5 36 46H28Z"
            fill="#EA580C"
          />
          <path
            d="M32 43.5C32.5 42 32 41 32 41C32 41 31.5 42 32 43.5Z"
            fill="#EF4444"
          />
        </svg>
      );
    case "pancard":
      return (
        <svg
          className={className}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="panGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          {/* Card background */}
          <rect
            x="4"
            y="14"
            width="56"
            height="36"
            rx="5"
            fill="url(#panGrad)"
          />
          {/* Chip */}
          <rect
            x="10"
            y="22"
            width="12"
            height="10"
            rx="2"
            fill="#FBBF24"
            opacity="0.9"
          />
          <line
            x1="10"
            y1="27"
            x2="22"
            y2="27"
            stroke="#B45309"
            strokeWidth="0.8"
          />
          <line
            x1="16"
            y1="22"
            x2="16"
            y2="32"
            stroke="#B45309"
            strokeWidth="0.8"
          />
          {/* PAN text */}
          <text
            x="32"
            y="30"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="2"
          >
            PAN
          </text>
          {/* Card number dots */}
          <circle cx="12" cy="40" r="1.5" fill="white" opacity="0.6" />
          <circle cx="17" cy="40" r="1.5" fill="white" opacity="0.6" />
          <circle cx="22" cy="40" r="1.5" fill="white" opacity="0.6" />
          <circle cx="27" cy="40" r="1.5" fill="white" opacity="0.6" />
          {/* Name line */}
          <rect
            x="34"
            y="38"
            width="22"
            height="2"
            rx="1"
            fill="white"
            opacity="0.4"
          />
          <rect
            x="34"
            y="43"
            width="14"
            height="2"
            rx="1"
            fill="white"
            opacity="0.3"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [editingService, setEditingService] = useState<EService | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<EService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<
    "form" | "payment" | "success"
  >("form");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDeleteService = async (serviceId?: string) => {
    const idToDelete = serviceId || editingService?.id;
    if (!idToDelete) return;

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this service? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic/${idToDelete}`,
            {
              method: "DELETE",
            },
          );
          if (response.ok) {
            setServicesList((prev) => prev.filter((s) => s.id !== idToDelete));
            setEditModalOpen(false);
            setEditingService(null);
            Swal.fire({
              title: "Deleted!",
              text: "Service has been deleted successfully.",
              icon: "success",
              confirmButtonColor: "#005C3A",
            });
          } else {
            Swal.fire({
              title: "Failed!",
              text: "Failed to delete service.",
              icon: "error",
              confirmButtonColor: "#005C3A",
            });
          }
        } catch (e) {
          console.error(e);
          Swal.fire({
            title: "Error!",
            text: "Error deleting service.",
            icon: "error",
            confirmButtonColor: "#005C3A",
          });
        }
      }
    });
  };

  const handleSaveService = async (
    updatedName: string,
    customImage: string | null,
  ) => {
    if (!editingService) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic/${editingService.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: updatedName,
            retailerCharge: Number(editingService.price?.retailer) || 0,
            distributorCharge: Number(editingService.price?.distributor) || 0,
            officialCost: Number(editingService.price?.officialCost) || 0,
            formFields: editingService.formFields,
          }),
        },
      );

      if (response.ok) {
        setServicesList((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  name: updatedName,
                  customImage: customImage || s.customImage,
                }
              : s,
          ),
        );
      } else {
        console.error("Failed to update service in backend");
        Swal.fire({
          title: "Error!",
          text: "Failed to update service.",
          icon: "error",
          confirmButtonColor: "#005C3A",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Error!",
        text: "Error connecting to backend.",
        icon: "error",
        confirmButtonColor: "#005C3A",
      });
    }

    setEditModalOpen(false);
    setEditingService(null);
  };

  const togglePermission = (
    serviceId: string,
    role: "retailer" | "distributor",
  ) => {
    setPermissions((prev) => {
      const current = prev[serviceId] || ["retailer", "distributor"];
      const updated = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return {
        ...prev,
        [serviceId]: updated,
      };
    });
  };

  // List of all 19 services customizer from localStorage
  const [servicesList, setServicesList] = useState<EService[]>([
    // Top Services Group
    {
      id: "pdf-services",
      name: "PDF Services",
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10 dark:shadow-rose-950/20",
      category: "Top",
      formFields: ["pdfType", "fileUpload", "customerMobile", "remarks"],
      price: { retailer: 150, distributor: 150 },
    },

    // All Services Group
    {
      id: "software-keys",
      name: "Software Keys",
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: ["softwareType", "quantity", "customerEmail"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "msme",
      name: "MSME",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-600",
      glowColor: "shadow-blue-600/10",
      category: "All",
      formFields: ["enterpriseName", "ownerName", "aadhaarNo", "businessType"],
      price: { retailer: 100, distributor: 100 },
    },
    {
      id: "ration-card",
      name: "Ration Card",
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["rationType", "headOfFamily", "membersCount", "address"],
      price: { retailer: 50, distributor: 50 },
    },
    {
      id: "gst",
      name: "GST",
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-600",
      glowColor: "shadow-amber-600/10",
      category: "All",
      formFields: ["gstType", "tradeName", "ownerName", "panNo", "state"],
      price: { retailer: 1500, distributor: 1500 },
    },
    {
      id: "aadhaar-card-address",
      name: "Adhaar Card (Adress Correction)",
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10",
      category: "All",
      formFields: ["aadhaarNo", "fullName", "newAddress", "addressProof"],
      price: { retailer: 200, distributor: 200 },
    },
    {
      id: "can-edit",
      name: "CAN EDIT",
      color: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
      glowColor: "shadow-indigo-500/10",
      category: "All",
      formFields: ["canNo", "fullName", "dob", "fieldsToEdit"],
      price: { retailer: 30, distributor: 30 },
    },
    {
      id: "rto-services",
      name: "RTO Services",
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-500",
      glowColor: "shadow-orange-500/10",
      category: "All",
      formFields: ["rtoType", "vehicleNumber", "ownerName", "licenseNo"],
      price: { retailer: 60, distributor: 60 },
    },
    {
      id: "registration-dept",
      name: "பதிவு துறை",
      subName: "Registration Dept",
      color: "text-pink-500 dark:text-pink-400",
      bgColor: "bg-pink-500",
      glowColor: "shadow-pink-500/10",
      category: "All",
      formFields: ["documentType", "partiesNames", "stampValue", "district"],
      price: { retailer: 400, distributor: 400 },
    },
    {
      id: "voter-id",
      name: "Voter ID",
      color: "text-cyan-500 dark:text-cyan-400",
      bgColor: "bg-cyan-500",
      glowColor: "shadow-cyan-500/10",
      category: "All",
      formFields: ["voterType", "epicNo", "fullName", "constituency"],
      price: { retailer: 60, distributor: 60 },
    },
    {
      id: "fssai",
      name: "FSSAI",
      color: "text-lime-500 dark:text-lime-400",
      bgColor: "bg-lime-500",
      glowColor: "shadow-lime-500/10",
      category: "All",
      formFields: ["fssaiType", "foodBusinessName", "ownerName", "address"],
      price: { retailer: 300, distributor: 300 },
    },
    {
      id: "certificate-courses",
      name: "Certificate Courses",
      color: "text-teal-500 dark:text-teal-400",
      bgColor: "bg-teal-500",
      glowColor: "shadow-teal-500/10",
      category: "All",
      formFields: ["courseName", "studentName", "qualification", "mobile"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "employment-services",
      name: "EMPLOYMENT SERVICES",
      color: "text-slate-500 dark:text-slate-400",
      bgColor: "bg-slate-500",
      glowColor: "shadow-slate-500/10",
      category: "All",
      formFields: ["registrationNo", "candidateName", "dob", "qualification"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "police-verification",
      name: "Police Verification",
      color: "text-violet-500 dark:text-violet-400",
      bgColor: "bg-violet-500",
      glowColor: "shadow-violet-500/10",
      category: "All",
      formFields: ["applicantName", "purpose", "aadhaarNo", "district"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "utisl-pan",
      name: "Utisl Pan",
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: ["applicantName", "dob", "aadhaarNo", "couponNumber"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "agri-stack-pdf",
      name: "Agri Stack PDF",
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["farmerId", "aadhaarNo", "customerMobile", "aadhaarUpload"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "pvc-card-print",
      name: "PVC CARD PRINT(ALL TYPE)",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500",
      glowColor: "shadow-amber-500/10",
      category: "All",
      formFields: ["pvcCardType", "fileUpload", "customerMobile"],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "cm-health-card",
      name: "CM Health Card",
      color: "text-lime-600 dark:text-lime-500",
      bgColor: "bg-lime-600",
      glowColor: "shadow-lime-600/10",
      category: "All",
      formFields: [
        "rationCardNo",
        "applicantName",
        "aadhaarNo",
        "customerMobile",
        "incomeCertificateUpload",
      ],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "tnega",
      name: "TNEGA",
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-600",
      glowColor: "shadow-emerald-600/10",
      category: "Top",
      formFields: [
        "applicantName",
        "serviceType",
        "aadhaarNo",
        "customerMobile",
      ],
      price: { retailer: 60, distributor: 60 },
    },
    {
      id: "dharsan",
      name: "Dharsan",
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: [
        "devoteeName",
        "ticketsCount",
        "bookingDate",
        "customerMobile",
      ],
      price: { retailer: 150, distributor: 150 },
    },
    {
      id: "pancard",
      name: "PanCard",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-600",
      glowColor: "shadow-blue-600/10",
      category: "All",
      formFields: ["panType", "applicantName", "dob", "mobile"],
      price: { retailer: 120, distributor: 120 },
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDynamicServices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic`,
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const dynamicServices: EService[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            color: "text-blue-500 dark:text-blue-400",
            bgColor: "bg-blue-500",
            glowColor: "shadow-blue-500/10",
            category: "All",
            formFields: d.formFields,
            price: {
              retailer: d.retailerCharge,
              distributor: d.distributorCharge,
            },
          }));

          setServicesList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const existingNames = new Set(
              prev.map((p) => p.name.trim().toLowerCase()),
            );
            const newServices = dynamicServices.filter(
              (d) =>
                !existingIds.has(d.id) &&
                !existingNames.has(d.name.trim().toLowerCase()),
            );
            return [...prev, ...newServices];
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch dynamic services", error);
    }
  };

  useEffect(() => {
    fetchDynamicServices();
  }, []);

  const handleAddService = async (newService: EService) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/services/dynamic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newService.name,
            retailerCharge: Number(newService.price?.retailer) || 0,
            distributorCharge: Number(newService.price?.distributor) || 0,
            formFields: newService.formFields,
          }),
        },
      );

      if (response.ok) {
        const createdData = await response.json();
        setServicesList((prev) => [
          ...prev,
          { ...newService, id: createdData.id || newService.id },
        ]);
      } else {
        console.error("Failed to add dynamic service via API");
        // Fallback to local storage only if API fails, or just show error. Let's add it anyway.
        setServicesList((prev) => [...prev, newService]);
      }
    } catch (error) {
      console.error("Failed to call API, adding locally", error);
      setServicesList((prev) => [...prev, newService]);
    }

    setIsAddModalOpen(false);
  };

  // Filter list based on role permissions from localStorage matrix
  const allowedServicesList = useMemo(() => {
    if (!user || user.role === "admin") return servicesList;
    return servicesList.filter((s) => {
      const allowedRoles = permissions[s.id];
      // Default to allowed if no permissions entry exists yet
      if (!allowedRoles) return true;
      return allowedRoles.includes(user.role);
    });
  }, [servicesList, user, permissions]);

  // Live filter based on search inputs
  const filteredServices = useMemo(() => {
    return allowedServicesList.filter((s) => {
      const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSub = s.subName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchName || matchSub;
    });
  }, [searchTerm, allowedServicesList]);

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
    if (service.id === "pdf-services") {
      router.push(PATHS.PDF);
      return;
    }
    if (service.id === "msme") {
      router.push(PATHS.MSME);
      return;
    }
    if (service.id === "utisl-pan") {
      router.push(PATHS.UTISL_PAN);
      return;
    }
    if (service.id === "employment-services") {
      router.push(PATHS.EMPLOYMENT_SERVICES);
      return;
    }
    if (service.id === "fssai") {
      router.push(PATHS.FSSAI);
      return;
    }
    if (service.id === "voter-id") {
      router.push(PATHS.VOTER_ID);
      return;
    }
    if (service.id === "registration-dept") {
      router.push(PATHS.REGISTRATION_DEPT);
      return;
    }
    if (service.id === "rto-services") {
      router.push(PATHS.RTO_SERVICES);
      return;
    }
    if (service.id === "can-edit") {
      router.push(PATHS.CAN_EDIT);
      return;
    }
    if (service.id === "aadhaar-card-address") {
      router.push(PATHS.AADHAAR_ADDRESS);
      return;
    }
    if (service.id === "software-keys") {
      router.push(PATHS.SOFTWARE_KEYS);
      return;
    }
    if (service.id === "ration-card") {
      router.push(PATHS.RATION_CARD);
      return;
    }
    if (service.id === "gst") {
      router.push(PATHS.GST);
      return;
    }
    if (service.id === "police-verification") {
      router.push(PATHS.POLICE_VERIFICATION);
      return;
    }
    if (service.id === "certificate-courses") {
      router.push(PATHS.CERTIFICATE_COURSES);
      return;
    }
    if (service.id === "agri-stack-pdf") {
      router.push(PATHS.AGRI_STACK);
      return;
    }
    if (service.id === "pvc-card-print") {
      router.push(PATHS.PVC_CARD);
      return;
    }
    if (service.id === "cm-health-card") {
      router.push(PATHS.HEALTH_CARD);
      return;
    }
    if (service.id === "dharsan") {
      router.push(PATHS.DHARSAN);
      return;
    }
    if (service.id === "tnega") {
      router.push(PATHS.TNEGA);
      return;
    }
    if (service.id === "pancard") {
      router.push(PATHS.PANCARD);
      return;
    }

    // Dynamic Services fallback
    router.push(`/services/dynamic_service?id=${service.id}`);
  };

  // Form field value change
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

    // Proceed to payment phase
    setPaymentPhase("payment");
  };

  const handlePaymentSuccess = async (customerWhatsApp?: string) => {
    if (user && selectedService) {
      try {
        const payload = new FormData();
        payload.append("retailerId", user.id);
        payload.append("retailerName", user.name || "Unknown");
        payload.append("retailerMobile", user.phone || "");
        payload.append("serviceId", selectedService.id);
        payload.append("serviceName", selectedService.name);
        payload.append("cost", String(selectedService.price?.retailer || 0));
        payload.append("customerWhatsApp", customerWhatsApp || "");
        payload.append(
          "walletType",
          user.role === "distributor" ? "Distributor" : "Retailer",
        );
        payload.append("formData", JSON.stringify(formData));

        if (typeof selectedFiles !== "undefined") {
          selectedFiles.forEach((file: File) => {
            payload.append("documents", file);
          });
        }

        const apiUrl =
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}`.replace(
            /\/api$/,
            "",
          );
        const res = await fetch(`${apiUrl}/api/services/request`, {
          method: "POST",
          body: payload,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          Swal.fire(
            "Error",
            errData.error || "Failed to submit request",
            "error",
          );
          return;
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to connect to backend", "error");
        return;
      }
    }

    setPaymentPhase("success");
    setTimeout(() => {
      setIsModalOpen(false);
      setPaymentPhase("form");
      setFormData({});
      setSelectedFiles([]);
    }, 3000);
  };

  return (
    <AppShell activePage="Our Service">
      <section className="flex flex-col gap-6 w-full pb-8">
        {/* Navigation Breadcrumb Mock Address Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold w-full md:w-auto">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider">
              Services Directory
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Show/Hide Toggle Button for Admin */}
            {user?.role === "admin" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none border border-slate-200 dark:border-slate-800 whitespace-nowrap ${
                    isManageMode
                      ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                      : "bg-slate-50 dark:bg-transparent text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <span>
                    {isManageMode ? "Exit Manage Mode" : "Show/Hide Services"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none border border-transparent bg-[#005c3a] hover:bg-[#004d30] text-white whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              </div>
            )}

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
                className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
              />
            </div>
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
              {topServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  subName={service.subName}
                  icon={
                    service.customImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={service.customImage}
                        alt=""
                        className="w-14 h-14 object-contain rounded-xl"
                      />
                    ) : (
                      renderServiceImage(service.id, "w-14 h-14")
                    )
                  }
                  onClick={() => handleServiceClick(service)}
                  price={service.price}
                  isManageMode={isManageMode}
                  allowedRoles={
                    permissions[service.id] || ["retailer", "distributor"]
                  }
                  onToggleRole={(role) => togglePermission(service.id, role)}
                  isAdmin={user?.role === "admin"}
                  onEditClick={() => {
                    setEditingService(service);
                    setEditModalOpen(true);
                  }}
                  onDeleteClick={() => handleDeleteService(service.id)}
                />
              ))}
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
              {allServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  subName={service.subName}
                  icon={
                    service.customImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={service.customImage}
                        alt=""
                        className="w-14 h-14 object-contain rounded-xl"
                      />
                    ) : (
                      renderServiceImage(service.id, "w-14 h-14")
                    )
                  }
                  onClick={() => handleServiceClick(service)}
                  price={service.price}
                  isManageMode={isManageMode}
                  allowedRoles={
                    permissions[service.id] || ["retailer", "distributor"]
                  }
                  onToggleRole={(role) => togglePermission(service.id, role)}
                  isAdmin={user?.role === "admin"}
                  onEditClick={() => {
                    setEditingService(service);
                    setEditModalOpen(true);
                  }}
                  onDeleteClick={() => handleDeleteService(service.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl text-center shadow-sm">
            <AlertCircle
              size={32}
              className="text-slate-300 dark:text-slate-700 mb-2"
            />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              No Utility Services Found
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              No services match your search term &quot;{searchTerm}&quot;.
              Please clear or adjust filters.
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
            <div className="relative w-full max-w-md bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 z-10 p-6 flex flex-col gap-5">
              {/* Form Success State Screen */}
              {paymentPhase === "success" ? (
                <ServiceSuccessScreen serviceName={selectedService.name} />
              ) : paymentPhase === "payment" ? (
                <div className="py-2">
                  <ServicePaymentScreen
                    serviceName={selectedService.name}
                    retailerCharge={
                      Number(selectedService.price?.retailer) || 0
                    }
                    formData={formData}
                    files={selectedFiles}
                    onBack={() => setPaymentPhase("form")}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shrink-0"
                      >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 hidden sm:block">
                          {renderServiceImage(selectedService.id, "w-10 h-10")}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                            {selectedService.name}
                          </h4>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            Create E-Seva Application
                          </p>
                        </div>
                      </div>
                    </div>
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
                        field === "gstType" ||
                        field === "pvcCardType"
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
                          pvcCardType: [
                            "Aadhaar Smart Card PVC",
                            "PAN Smart Card PVC",
                            "Voter ID Smart Card PVC",
                            "Health Smart Card PVC",
                            "Driving License Smart Card PVC",
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
                              className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-[#0a0f18]/30 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
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
                            className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005c3a]/15 bg-slate-50 dark:bg-[#0a0f18]/30 transition-all ${
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

                    <div className="space-y-1.5 mt-2">
                      <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Upload Supporting Documents (Optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        className="w-full text-xs"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedFiles(Array.from(e.target.files));
                          }
                        }}
                      />
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

        {/* EDIT SERVICE DETAILS MODAL */}
        {editModalOpen && editingService && (
          <EditServiceModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditingService(null);
            }}
            service={editingService}
            onSave={handleSaveService}
          />
        )}

        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddService}
        />
      </section>
    </AppShell>
  );
}

type EditServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: EService;
  onSave: (name: string, customImage: string | null) => void;
  onDelete?: () => void;
};

function EditServiceModal({
  isOpen,
  onClose,
  service,
  onSave,
}: EditServiceModalProps) {
  const [name, setName] = useState(service.name);
  const [officialCost, setOfficialCost] = useState(
    String(service.price?.officialCost || "0"),
  );
  const [customImage, setCustomImage] = useState<string | null>(
    service.customImage || null,
  );

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-slate-50 dark:bg-[#090d16] border-2 border-black dark:border-white rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Edit Card Details
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Plus size={14} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Official Cost (₹)
            </label>
            <input
              type="number"
              value={officialCost}
              onChange={(e) => setOfficialCost(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18]/30 focus:outline-none focus:ring-2 focus:ring-[#005c3a]/25 text-xs font-semibold focus:border-[#005c3a] text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Service Image / Icon
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {customImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customImage}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </>
                ) : (
                  <div className="text-[10px] font-bold text-slate-350">
                    Default
                  </div>
                )}
              </div>
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                <Upload size={16} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-50 dark:border-slate-900/50 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-855 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const prevPrice = service.price || {
                retailer: 0,
                distributor: 0,
              };
              service.price = {
                ...prevPrice,
                officialCost: Number(officialCost),
              };
              onSave(name, customImage);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#005c3a] dark:bg-emerald-600 hover:bg-[#004d30] dark:hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
