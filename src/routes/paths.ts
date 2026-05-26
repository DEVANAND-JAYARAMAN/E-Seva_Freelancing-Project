/**
 * Static route paths definition for centralized route management
 */
export const PATHS = {
  // Auth Routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Application Routes
  DASHBOARD: "/",
  WALLETS: "/wallets",
  PAYMENTS: "/payments",
  SERVICES: "/services",
  MSME: "/services/msme",
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
  CRM: "/crm",
  BILLING: "/billing",

  // Fallbacks
  NOT_FOUND: "/404",
} as const;

export type PathKeys = keyof typeof PATHS;
export type PathValues = (typeof PATHS)[PathKeys];
