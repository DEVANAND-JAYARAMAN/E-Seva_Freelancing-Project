/**
 * Static route paths definition for centralized route management
 */
export const PATHS = {
  // Auth Routes
  LOGIN: "/",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Application Routes
  DASHBOARD: "/dashboard",
  WALLETS: "/wallets",
  PAYMENTS: "/payments",
  SERVICES: "/services",
  MSME: "/services/msme",
  RATION_CARD: "/services/ration-card",
  STATUS: "/status",
  PDF: "/pdf",
  USERS: "/users",
  PERMISSION: "/permission",
  SETTINGS: "/settings",
  PANCARD: "/pancard",
  CAN_EDIT: "/services/can-edit",
  AADHAAR_ADDRESS: "/services/aadhaar-card-address",
  UTISL_PAN: "/services/utisl-pan",
  EMPLOYMENT_SERVICES: "/services/employment-services",
  FSSAI: "/services/fssai",
  VOTER_ID: "/services/voter-id",
  REGISTRATION_DEPT: "/services/registration-dept",
  RTO_SERVICES: "/services/rto-services",
  DISTRIBUTORS: "/distributors",
  RETAILERS: "/retailers",
  BILLING: "/billing",
  AGRI_STACK: "/services/agri-stack-pdf",
  PVC_CARD: "/services/pvc-card-print",
  HEALTH_CARD: "/services/cm-health-card",
  SOFTWARE_KEYS: "/services/software-keys",
  GST: "/services/gst",
  POLICE_VERIFICATION: "/services/police-verification",
  CERTIFICATE_COURSES: "/services/certificate-courses",
  DHARSAN: "/services/dharsan",
  TNEGA: "/services/tnega",

  // Fallbacks
  NOT_FOUND: "/404",
} as const;

export type PathKeys = keyof typeof PATHS;
export type PathValues = (typeof PATHS)[PathKeys];
