export type TempCredential = {
  role: "admin" | "retailer" | "distributor";
  name: string;
  pass: string;
};

/**
 * Demo-only shortcuts. Do NOT use emails that real accounts may register
 * (e.g. admin@gmail.com) — that forces admin UI and breaks retailer login.
 */
export const tempLogins: Record<string, TempCredential> = {
  "admin@eseva.com": {
    role: "admin",
    name: "System Admin",
    pass: "password123",
  },
  "retailer@gmail.com": {
    role: "retailer",
    name: "Retailer Partner",
    pass: "123456",
  },
  "retailor@gmail.com": {
    role: "retailer",
    name: "Retailer Partner",
    pass: "123456",
  },
  "distributor@gmail.com": {
    role: "distributor",
    name: "Distributor Network",
    pass: "123456",
  },
};

export const RESERVED_ADMIN_EMAILS = new Set([
  "admin@eseva.com",
  "admin@gmail.com",
]);
