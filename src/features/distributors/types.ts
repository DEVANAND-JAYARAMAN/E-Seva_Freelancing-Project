export interface Distributor {
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
}

export interface DistributorStatsData {
  totalDistributors: number;
  activeDistributors: number;
  suspendedDistributors: number;
  totalBalance: number;
}
