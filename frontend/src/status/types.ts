export type TicketStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface StatusTicket {
  id: string;
  transactionId: string;
  serviceName: string;
  retailerName: string;
  amount: number;
  status: TicketStatus;
  createdDate: string;
  lastUpdated: string;
  remarks?: string;
  userRole?: "Retailer" | "Distributor";
  customerName?: string;
  mobileNumber?: string;
  formData?: Record<string, string>;
  documents?: string[];
  ackFiles?: string[];
}

export interface StatusStatsData {
  pendingCount: number;
  resubmitCount: number;
  processingCount: number;
  rejectedCount: number;
  approvedCount: number;
  totalCount: number;
}
