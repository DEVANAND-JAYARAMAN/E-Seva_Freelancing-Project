export type TicketStatus =
  | "Pending"
  | "Process"
  | "Resubmit"
  | "Approved"
  | "Rejected";

export interface StatusTicket {
  id: string;
  transactionId: string;
  serviceName: string;
  retailerName: string;
  retailerMobile?: string;
  amount: number;
  status: TicketStatus;
  createdDate: string;
  lastUpdated: string;
  remarks?: string;
  userRole?: "Retailer" | "Distributor";
  customerName?: string;
  /** Applicant name from submitted form (e.g. formData.applicantName). */
  applicantName?: string;
  mobileNumber?: string;
  formData?: Record<string, string>;
  documents?: string[];
  ackFiles?: string[];
  ackText?: string;
}

export interface StatusStatsData {
  pendingCount: number;
  resubmitCount: number;
  processingCount: number;
  rejectedCount: number;
  approvedCount: number;
  totalCount: number;
}
