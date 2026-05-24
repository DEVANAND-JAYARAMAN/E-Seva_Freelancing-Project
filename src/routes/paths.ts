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
  STATUS: "/status",
  PDF: "/pdf",
  USERS: "/users",
  PERMISSION: "/permission",
  SETTINGS: "/settings",
  PANCARD: "/pancard",
  DISTRIBUTORS: "/distributors",
  RETAILERS: "/retailers",
  CRM: "/crm",
  BILLING: "/billing",

  // Fallbacks
  NOT_FOUND: "/404",
} as const;

export type PathKeys = keyof typeof PATHS;
export type PathValues = (typeof PATHS)[PathKeys];
