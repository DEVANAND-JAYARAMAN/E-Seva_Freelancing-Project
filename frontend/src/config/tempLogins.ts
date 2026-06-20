export type TempCredential = {
  role: "admin" | "retailer" | "distributor";
  name: string;
  pass: string;
};

export const tempLogins: Record<string, TempCredential> = {
  "admin@eseva.com": {
    role: "admin",
    name: "System Admin",
    pass: "password123",
  },
  "admin@gmail.com": {
    role: "admin",
    name: "Admin User",
    pass: "123456",
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
