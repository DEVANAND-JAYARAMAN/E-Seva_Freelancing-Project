"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { ServiceCard } from "./ServiceCard";

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
}

// Reusable custom vectors designed to look like "real images related to the heading"
function renderServiceImage(id: string, className = "w-14 h-14") {
  switch (id) {
    case "pdf-services":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
          {/* Main Paper */}
          <path d="M14 6C14 4.89543 14.8954 4 16 4H38L50 16V56C50 57.1046 49.1046 58 48 58H16C14.8954 58 14 57.1046 14 56V6Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
          {/* Folded Corner */}
          <path d="M38 4V16H50L38 4Z" fill="#E5E7EB" />
          <path d="M38 16L50 16" stroke="#D1D5DB" strokeWidth="1.5" />
          {/* PDF Red Badge Card */}
          <rect x="10" y="24" width="34" height="22" rx="3" fill="url(#pdfGrad)" />
          {/* PDF text */}
          <text x="27" y="38" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.5">PDF</text>
          {/* Red line details */}
          <rect x="27" y="41" width="10" height="1.5" fill="#FECACA" rx="0.5" />
        </svg>
      );
    case "nsdl-pan":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="panGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* PAN Card Body */}
          <rect x="4" y="14" width="56" height="36" rx="4" fill="url(#panGrad)" stroke="#B45309" strokeWidth="1.5" />
          {/* Passport Photo Box */}
          <rect x="8" y="20" width="11" height="13" rx="1.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.75" />
          <circle cx="13.5" cy="25" r="2.5" fill="#D97706" />
          <path d="M9 31C9 28.5 12 28.5 13.5 29.5C15 28.5 18 28.5 18 31H9Z" fill="#D97706" />
          {/* Gold Chip */}
          <rect x="23" y="20" width="8" height="6" rx="1" fill="#FBBF24" stroke="#92400E" strokeWidth="0.5" />
          <line x1="27" y1="20" x2="27" y2="26" stroke="#92400E" strokeWidth="0.5" />
          <line x1="23" y1="23" x2="31" y2="23" stroke="#92400E" strokeWidth="0.5" />
          {/* Card Text lines */}
          <rect x="35" y="20" width="20" height="2" rx="0.5" fill="#FEF3C7" />
          <rect x="35" y="25" width="16" height="2" rx="0.5" fill="#FEF3C7" />
          <rect x="23" y="29" width="28" height="2" rx="0.5" fill="#FEF3C7" />
          {/* Signature Box */}
          <rect x="23" y="34" width="22" height="4" rx="0.5" fill="white" />
          <path d="M25 36C28 35 29 37 32 35.5C35 34 38 37 41 36" stroke="#1E3A8A" strokeWidth="0.75" strokeLinecap="round" />
          {/* NSDL Emblem logo */}
          <circle cx="50" cy="38" r="4" fill="#92400E" opacity="0.6" />
          <text x="50" y="40" fill="white" fontSize="4.5" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">PAN</text>
        </svg>
      );
    case "software-keys":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="softGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#softGrad)" />
          {/* Inner holographic disk representation */}
          <circle cx="32" cy="32" r="20" fill="none" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="32 8" />
          <circle cx="32" cy="32" r="14" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1" />
          {/* Shiny Key Graphic */}
          <circle cx="32" cy="32" r="6" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          <path d="M35 35L44 44M44 44L41 47M44 44L47 41" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" />
          <text x="32" y="16" fill="white" fontSize="6.5" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">SOFTWARE</text>
        </svg>
      );
    case "msme":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="msmeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Certificate Boarder */}
          <rect x="6" y="6" width="52" height="52" rx="4" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
          <rect x="9" y="9" width="46" height="46" fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 1" />
          {/* Lion Capital Ashoka Emblem Graphic representation */}
          <path d="M32 14C30 14 29 16 29 18C29 20 30 21 32 21C34 21 35 20 35 18C35 16 34 14 32 14Z" fill="#D97706" />
          <rect x="30" y="21" width="4" height="6" fill="#D97706" />
          <path d="M27 23C27 23 29 26 32 26C35 26 37 23 37 23" stroke="#D97706" strokeWidth="1.5" />
          {/* Certificate lines */}
          <rect x="16" y="32" width="32" height="2" rx="0.5" fill="#92400E" />
          <rect x="20" y="37" width="24" height="2" rx="0.5" fill="#92400E" />
          <rect x="14" y="42" width="36" height="2" rx="0.5" fill="#92400E" />
          {/* MSME Bold text badge */}
          <rect x="18" y="46" width="28" height="8" rx="1.5" fill="#B45309" />
          <text x="32" y="52" fill="white" fontSize="6.5" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">MSME</text>
        </svg>
      );
    case "ration-card":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          {/* Card Body */}
          <rect x="8" y="8" width="48" height="48" rx="4" fill="url(#rationGrad)" stroke="#064E3B" strokeWidth="1.5" />
          {/* Rice crop vector graphic */}
          <path d="M32 16C32 20 28 24 28 28C28 32 32 36 32 36C32 36 36 32 36 28C36 24 32 20 32 16Z" fill="#A7F3D0" opacity="0.4" />
          <path d="M32 14V42" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" />
          {/* Stalk details */}
          <circle cx="28" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="36" cy="22" r="2.5" fill="#A7F3D0" />
          <circle cx="27" cy="29" r="2.5" fill="#A7F3D0" />
          <circle cx="37" cy="29" r="2.5" fill="#A7F3D0" />
          {/* Bottom Banner */}
          <rect x="12" y="44" width="40" height="7" rx="1.5" fill="#064E3B" />
          <text x="32" y="49.5" fill="#A7F3D0" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">TNEB RATION</text>
        </svg>
      );
    case "gst":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#gstGrad)" stroke="#F59E0B" strokeWidth="1" />
          {/* Gold Seal */}
          <circle cx="32" cy="32" r="20" fill="url(#sealGrad)" stroke="#B45309" strokeWidth="1.5" />
          {/* Seal spikes */}
          <circle cx="32" cy="32" r="17" stroke="white" strokeWidth="1" strokeDasharray="3 2" />
          <text x="32" y="38" fill="#451A03" fontSize="16" fontWeight="black" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif">GST</text>
          <text x="32" y="45" fill="#451A03" fontSize="4" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">TAX SYSTEM</text>
        </svg>
      );
    case "aadhaar-card-address":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="aadhaarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF5" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          {/* Card Frame */}
          <rect x="4" y="12" width="56" height="40" rx="4" fill="url(#aadhaarGrad)" stroke="#D97706" strokeWidth="1.5" />
          {/* Flag Tricolor header band */}
          <rect x="4" y="12" width="56" height="3" fill="#FF9933" />
          <rect x="4" y="15" width="56" height="3" fill="#FFFFFF" />
          <rect x="4" y="18" width="56" height="3" fill="#138808" />
          {/* Ashoka wheel in tricolor */}
          <circle cx="32" cy="16.5" r="1.2" fill="#000080" />
          {/* Fingerprint logo in center */}
          <path d="M32 23C28.5 23 26 25.5 26 29C26 32.5 28.5 35 32 35C35.5 35 38 32.5 38 29C38 25.5 35.5 23 32 23Z" fill="none" stroke="#EF4444" strokeWidth="1.2" />
          <path d="M29 29C29 27 30 25.5 32 25.5C34 25.5 35 27 35 29M27.5 31C27.5 28 29.5 26.5 32 26.5C34.5 26.5 36.5 28 36.5 31" stroke="#EF4444" strokeWidth="0.8" />
          {/* Aadhaar Text */}
          <text x="32" y="44" fill="#B45309" fontSize="6.5" fontWeight="extrabold" textAnchor="middle" fontFamily="sans-serif">AADHAAR</text>
          {/* Bottom Bar */}
          <rect x="4" y="47" width="56" height="5" fill="#EF4444" />
        </svg>
      );
    case "can-edit":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="10" width="48" height="44" rx="5" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
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
          <circle cx="38" cy="42" r="10" fill="#3B82F6" stroke="white" strokeWidth="1.5" />
          <path d="M38 36V42H43" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "rto-services":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rtoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="52" height="44" rx="4" fill="url(#rtoGrad)" stroke="#C2410C" strokeWidth="1.5" />
          {/* steering wheel logo */}
          <circle cx="32" cy="28" r="12" fill="none" stroke="white" strokeWidth="2.5" />
          <circle cx="32" cy="28" r="3" fill="white" />
          <line x1="32" y1="16" x2="32" y2="40" stroke="white" strokeWidth="2.5" />
          <line x1="20" y1="28" x2="44" y2="28" stroke="white" strokeWidth="2.5" />
          {/* Bottom badge */}
          <rect x="16" y="44" width="32" height="6" rx="1" fill="#7C2D12" />
          <text x="32" y="48.5" fill="white" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">RTO SERVICE</text>
        </svg>
      );
    case "registration-dept":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" rx="8" fill="url(#regGrad)" />
          {/* Open Register book vector */}
          <path d="M16 16C16 16 24 18 32 18C40 18 48 16 48 16V46C48 46 40 48 32 48C24 48 16 46 16 46V16Z" fill="white" />
          <line x1="32" y1="18" x2="32" y2="48" stroke="#BE185D" strokeWidth="2" />
          <line x1="20" y1="24" x2="28" y2="24" stroke="#BE185D" strokeWidth="1.5" />
          <line x1="20" y1="30" x2="28" y2="30" stroke="#BE185D" strokeWidth="1.5" />
          <line x1="36" y1="24" x2="44" y2="24" stroke="#BE185D" strokeWidth="1.5" />
          <line x1="36" y1="30" x2="44" y2="30" stroke="#BE185D" strokeWidth="1.5" />
          {/* Ribbon marker */}
          <path d="M31 18V38L33 36L35 38V18H31Z" fill="#F59E0B" />
        </svg>
      );
    case "voter-id":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="voteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Card Body */}
          <rect x="8" y="10" width="48" height="44" rx="4" fill="url(#voteGrad)" stroke="#0369A1" strokeWidth="1.5" />
          {/* Hologram badge */}
          <circle cx="44" cy="20" r="5" fill="#E0F2FE" opacity="0.7" />
          <circle cx="44" cy="20" r="3" fill="#0284C7" />
          {/* Passport Photo */}
          <rect x="14" y="16" width="16" height="20" rx="1" fill="white" stroke="#0369A1" strokeWidth="0.75" />
          <circle cx="22" cy="23" r="3.5" fill="#0EA5E9" />
          <path d="M16 32C16 29 19 29 22 29C25 29 28 29 28 32H16Z" fill="#0EA5E9" />
          {/* Voter Card Details */}
          <rect x="14" y="40" width="36" height="3" fill="#E0F2FE" rx="0.5" />
          <rect x="14" y="46" width="28" height="3" fill="#E0F2FE" rx="0.5" />
          <text x="44" y="32" fill="white" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">VOTE</text>
        </svg>
      );
    case "fssai":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fssaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#65A30D" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="52" height="52" rx="10" fill="url(#fssaiGrad)" />
          {/* Green circular seal */}
          <circle cx="32" cy="32" r="20" fill="white" stroke="#4D7C0F" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="16" fill="none" stroke="#A3E635" strokeWidth="1" strokeDasharray="3 2" />
          {/* Heart / Leaf representing healthy food */}
          <path d="M32 20C32 20 25 23 25 28C25 33 32 37 32 37C32 37 39 33 39 28C39 23 32 20 32 20Z" fill="#65A30D" />
          <path d="M29 29L31 31L35 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "certificate-courses":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          {/* Rolled Scroll / Certificate Vector */}
          <rect x="12" y="10" width="40" height="44" rx="2" fill="white" stroke="url(#certGrad)" strokeWidth="2.5" />
          <rect x="18" y="16" width="28" height="32" fill="#ECFEFF" />
          {/* Red seal inside scroll */}
          <circle cx="32" cy="32" r="6" fill="#EF4444" />
          <path d="M30 35L27 44L32 40L37 44L34 35H30Z" fill="#EF4444" />
          {/* Lines inside scroll */}
          <line x1="22" y1="22" x2="42" y2="22" stroke="#0891B2" strokeWidth="2" />
          <line x1="22" y1="27" x2="38" y2="27" stroke="#0891B2" strokeWidth="1.5" />
        </svg>
      );
    case "employment-services":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="empGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="52" height="52" rx="12" fill="url(#empGrad)" />
          {/* Handshake vector */}
          <circle cx="32" cy="32" r="20" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M18 34C20 30 26 30 30 34" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 34C44 30 38 30 34 34" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 34L34 34" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="25" r="3" fill="#F59E0B" />
          <circle cx="40" cy="25" r="3" fill="#F59E0B" />
        </svg>
      );
    case "insurance-scheme":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="insGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect x="8" y="10" width="48" height="44" rx="4" fill="#ECFDF5" stroke="url(#insGrad)" strokeWidth="2" />
          {/* Shield representation */}
          <path d="M32 18L44 23V32C44 38 38 43 32 46C26 43 20 38 20 32V23L32 18Z" fill="url(#insGrad)" />
          <path d="M27 32L31 35L37 29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "police-verification":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="10" width="48" height="44" rx="4" fill="#EFF6FF" stroke="#1E3A8A" strokeWidth="2" />
          {/* Police Badge / Star Emblem vector */}
          <path d="M32 16L35 23H43L37 27L39 34L32 30L25 34L27 27L21 23H29L32 16Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="32" cy="26" r="3" fill="#F59E0B" />
          <rect x="18" y="42" width="28" height="5" rx="1" fill="#1E3A8A" />
          <text x="32" y="46" fill="white" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">VERIFIED</text>
        </svg>
      );
    case "patta-service":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pattaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" rx="6" fill="#F0FDF4" stroke="url(#pattaGrad)" strokeWidth="2.5" />
          {/* Map Land grid */}
          <path d="M14 24H50M24 14V42M38 14V42M14 34H50" stroke="#86EFAC" strokeWidth="1" />
          {/* Land survey pins */}
          <circle cx="24" cy="24" r="3.5" fill="#EF4444" stroke="white" strokeWidth="1" />
          <circle cx="38" cy="34" r="3.5" fill="#EF4444" stroke="white" strokeWidth="1" />
          <rect x="14" y="45" width="36" height="6" rx="1" fill="url(#pattaGrad)" />
          <text x="32" y="49.5" fill="white" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PATTA SERVICE</text>
        </svg>
      );
    case "utisl-pan":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="utiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
          <rect x="4" y="14" width="56" height="36" rx="4" fill="url(#utiGrad)" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="8" y="20" width="11" height="13" rx="1.5" fill="#E0F2FE" />
          <circle cx="13.5" cy="25" r="2.5" fill="#0369A1" />
          <path d="M9 31C9 28.5 12 28.5 13.5 29.5C15 28.5 18 28.5 18 31H9Z" fill="#0369A1" />
          <circle cx="50" cy="24" r="4.5" fill="#E0F2FE" opacity="0.8" />
          <text x="50" y="26.5" fill="#0369A1" fontSize="6.5" fontWeight="black" textAnchor="middle" fontFamily="Impact">UTI</text>
          <rect x="23" y="20" width="22" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="25" width="18" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="30" width="28" height="2" rx="0.5" fill="#E0F2FE" />
          <rect x="23" y="35" width="20" height="4" rx="0.5" fill="white" />
        </svg>
      );
    case "pstm-certificate":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pstmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" rx="6" fill="#FAF5FF" stroke="url(#pstmGrad)" strokeWidth="2.5" />
          {/* Certificate Award shield vector */}
          <path d="M22 18H42V38L32 32L22 38V18Z" fill="#E9D5FF" />
          <circle cx="32" cy="26" r="6" fill="url(#pstmGrad)" stroke="#C084FC" strokeWidth="1" />
          <rect x="16" y="44" width="32" height="6" rx="1.5" fill="url(#pstmGrad)" />
          <text x="32" y="48.5" fill="white" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PSTM CERT</text>
        </svg>
      );
    default:
      return null;
  }
}

export function ServicesPage() {
  const router = useRouter();
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
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10 dark:shadow-rose-950/20",
      category: "Top",
      formFields: ["pdfType", "fileUpload", "customerMobile", "remarks"],
    },
    {
      id: "nsdl-pan",
      name: "NSDL PAN",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500",
      glowColor: "shadow-amber-500/10 dark:shadow-amber-950/20",
      category: "Top",
      formFields: ["panType", "applicantName", "dob", "aadhaarNo", "aadhaarUpload"],
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
    },
    {
      id: "msme",
      name: "MSME",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-600",
      glowColor: "shadow-blue-600/10",
      category: "All",
      formFields: ["enterpriseName", "ownerName", "aadhaarNo", "businessType"],
    },
    {
      id: "ration-card",
      name: "Ration Card",
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["rationType", "headOfFamily", "membersCount", "address"],
    },
    {
      id: "gst",
      name: "GST",
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-600",
      glowColor: "shadow-amber-600/10",
      category: "All",
      formFields: ["gstType", "tradeName", "ownerName", "panNo", "state"],
    },
    {
      id: "aadhaar-card-address",
      name: "Adhaar Card (Adress Correction)",
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500",
      glowColor: "shadow-rose-500/10",
      category: "All",
      formFields: ["aadhaarNo", "fullName", "newAddress", "addressProof"],
    },
    {
      id: "can-edit",
      name: "CAN EDIT",
      color: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
      glowColor: "shadow-indigo-500/10",
      category: "All",
      formFields: ["canNo", "fullName", "dob", "fieldsToEdit"],
    },
    {
      id: "rto-services",
      name: "RTO Services",
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
      color: "text-pink-500 dark:text-pink-400",
      bgColor: "bg-pink-500",
      glowColor: "shadow-pink-500/10",
      category: "All",
      formFields: ["documentType", "partiesNames", "stampValue", "district"],
    },
    {
      id: "voter-id",
      name: "Voter ID",
      color: "text-cyan-500 dark:text-cyan-400",
      bgColor: "bg-cyan-500",
      glowColor: "shadow-cyan-500/10",
      category: "All",
      formFields: ["voterType", "epicNo", "fullName", "constituency"],
    },
    {
      id: "fssai",
      name: "FSSAI",
      color: "text-lime-500 dark:text-lime-400",
      bgColor: "bg-lime-500",
      glowColor: "shadow-lime-500/10",
      category: "All",
      formFields: ["fssaiType", "foodBusinessName", "ownerName", "address"],
    },
    {
      id: "certificate-courses",
      name: "Certificate Courses",
      color: "text-teal-500 dark:text-teal-400",
      bgColor: "bg-teal-500",
      glowColor: "shadow-teal-500/10",
      category: "All",
      formFields: ["courseName", "studentName", "qualification", "mobile"],
    },
    {
      id: "employment-services",
      name: "EMPLOYMENT SERVICES",
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
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/10",
      category: "All",
      formFields: ["schemeType", "primaryApplicant", "dob", "nomineeName"],
    },
    {
      id: "police-verification",
      name: "Police Verification",
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
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-600",
      glowColor: "shadow-green-600/10",
      category: "All",
      formFields: ["district", "taluk", "village", "surveyNo", "subdivisionNo"],
    },
    {
      id: "utisl-pan",
      name: "Utisl Pan",
      color: "text-sky-500 dark:text-sky-400",
      bgColor: "bg-sky-500",
      glowColor: "shadow-sky-500/10",
      category: "All",
      formFields: ["applicantName", "dob", "aadhaarNo", "couponNumber"],
    },
    {
      id: "pstm-certificate",
      name: "PSTM Certificate",
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
      const matchSub = s.subName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchSub;
    });
  }, [searchTerm]);

  const topServices = useMemo(() => filteredServices.filter((s) => s.category === "Top"), [filteredServices]);
  const allServices = useMemo(() => filteredServices.filter((s) => s.category === "All"), [filteredServices]);

  // Open interactive form drawer
  const handleServiceClick = (service: EService) => {
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
      } else if (field === "aadhaarNo" && val.replace(/\s/g, "").length !== 12) {
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
            <span 
              className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider"
            >
              Services Directory
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Search Bar inside Breadcrumb */}
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 pointer-events-none" />
              <input
                type="text"
                placeholder="Search utility services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
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
                  icon={renderServiceImage(service.id, "w-12 h-12")}
                  onClick={() => handleServiceClick(service)}
                  layout="horizontal"
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
                  icon={renderServiceImage(service.id, "w-14 h-14")}
                  onClick={() => handleServiceClick(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#090d16] border border-slate-100 dark:border-slate-900/60 rounded-3xl text-center shadow-sm">
            <AlertCircle size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              No Utility Services Found
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              No services match your search term &quot;{searchTerm}&quot;. Please clear or adjust filters.
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
                      Your service request for <strong>{selectedService.name}</strong> has been successfully placed. It is now queued for validation.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
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
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>

                  {/* Dynamic Form Generation */}
                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                    {selectedService.formFields.map((field) => {
                      const isError = errors[field];
                      let label = field.replace(/([A-Z])/g, " $1");
                      label = label.charAt(0).toUpperCase() + label.slice(1);

                      // Custom elements mapping
                      if (field === "fileUpload" || field === "aadhaarUpload" || field === "addressProof") {
                        return (
                          <div key={field} className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              {label} (PDF/JPG)
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                              isError
                                ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/10"
                                : "border-slate-200 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                            }`}
                              onClick={() => handleFieldChange(field, "attached_doc_mock.pdf")}
                            >
                              {formData[field] ? (
                                <div className="flex flex-col items-center gap-1 text-[#005c3a] dark:text-emerald-400">
                                  <FileText size={24} />
                                  <span className="text-xs font-bold font-mono">attached_doc_mock.pdf</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                  <Upload size={20} />
                                  <span className="text-xs font-bold">Click to upload document</span>
                                </div>
                              )}
                            </div>
                            {isError && <span className="text-[10px] font-semibold text-rose-500">{isError}</span>}
                          </div>
                        );
                      }

                      if (field === "pdfType" || field === "panType" || field === "rtoType" || field === "voterType" || field === "schemeType" || field === "softwareType" || field === "gstType") {
                        const options: Record<string, string[]> = {
                          pdfType: ["Aadhaar Smart Card Print", "Ration Card Print-out", "Voter ID Card Print", "Community Certificate Print"],
                          panType: ["New PAN Application (Form 49A)", "PAN Correction/Reissue", "Minor to Major PAN Update"],
                          rtoType: ["Learning License (LLR)", "Driving License Renewal", "Address Correction in DL"],
                          voterType: ["New Voter Registration", "Voter Card Correction", "Voter List Verification"],
                          schemeType: ["Central Medical Insurance Scheme", "Farmers Welfare Subsidy Scheme", "Widow Pension Scheme"],
                          softwareType: ["Windows 11 Professional Retail Key", "Office 2021 Professional Plus Key", "Quick Heal Antivirus Total Security 1 Yr"],
                          gstType: ["New GST Registration", "GST Composition Scheme Opt-in", "GST Return Audit Filing"],
                        };

                        return (
                          <div key={field} className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Select {label}
                            </label>
                            <select
                              value={formData[field] || ""}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                              className="w-full px-4 py-2.8 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-[#0a0f18]/30 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-[#005c3a]/15 focus:border-[#005c3a]/50 outline-none transition-all"
                            >
                              <option value="">-- Choose Category --</option>
                              {options[field]?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {isError && <span className="text-[10px] font-semibold text-rose-500">{isError}</span>}
                          </div>
                        );
                      }

                      return (
                        <div key={field} className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {label}
                          </label>
                          <input
                            type={field === "dob" ? "date" : field === "membersCount" || field === "quantity" ? "number" : "text"}
                            value={formData[field] || ""}
                            onChange={(e) => {
                              if (field === "aadhaarNo") {
                                const value = e.target.value.replace(/\D/g, "").substring(0, 12);
                                const parts = value.match(/.{1,4}/g) || [];
                                handleFieldChange(field, parts.join(" "));
                              } else {
                                handleFieldChange(field, e.target.value);
                              }
                            }}
                            placeholder={field === "aadhaarNo" ? "e.g. 1234 5678 9012" : `Enter ${label.toLowerCase()}`}
                            className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005c3a]/15 bg-white dark:bg-[#0a0f18]/30 transition-all ${
                              isError
                                ? "border-rose-400 dark:border-rose-500/50"
                                : "border-slate-200 dark:border-slate-850 focus:border-[#005c3a]"
                            }`}
                          />
                          {isError && <span className="text-[10px] font-semibold text-rose-500">{isError}</span>}
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
