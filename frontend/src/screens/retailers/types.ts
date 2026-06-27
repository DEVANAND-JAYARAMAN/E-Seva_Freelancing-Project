export interface Retailer {
  id: string;
  name: string;
  shopName: string;
  email: string;
  phone: string;
  city: string;
  balance: number;
  status: "Active" | "Suspended";
  createdDate: string;
  aadhaarNo?: string;
  rawPassword?: string;
}

export interface RetailerStatsData {
  totalRetailers: number;
  activeRetailers: number;
  suspendedRetailers: number;
  totalBalance: number;
}
