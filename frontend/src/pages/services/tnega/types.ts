export interface TnegaCustomer {
  id: string;
  applicantName: string;
  dob: string;
  gender: string;
  phone: string;
  district: string;
  taluk: string;
  vao: string;
  photo?: string; // stored filename or data URL
  photoFile?: File | null;
  aadhaarNo: string;
  aadhaarCard?: string; // stored filename or data URL
  aadhaarCardFile?: File | null;
  smartCardNo: string;
  smartCard?: string; // stored filename or data URL
  smartCardFile?: File | null;
  signature?: string; // stored filename or data URL
  signatureFile?: File | null;
  address: string;
  status: "Active" | "Suspended";
  createdDate: string;
}

export interface TnegaStatsData {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
}
