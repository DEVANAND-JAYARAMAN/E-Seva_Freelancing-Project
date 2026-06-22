export type TicketStatus =
  | "Pending"
  | "Resubmit"
  | "Processing"
  | "Rejected"
  | "Approved";

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
  formData?: Record<string, string>;
  documents?: string[];
}

export interface StatusStatsData {
  pendingCount: number;
  resubmitCount: number;
  processingCount: number;
  rejectedCount: number;
  approvedCount: number;
  totalCount: number;
}
