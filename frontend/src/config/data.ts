import {
  CircleDollarSign,
  Home,
  UserCheck,
  Users,
  Wallet,
  Activity,
  CreditCard,
  FileText,
  Cpu,
  Fingerprint,
  Building2,
  Store,
  Receipt,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

export type StatCard = {
  label: string;
  value: string;
  change: string;
  tone: "mint" | "amber" | "sky" | "green" | "rose" | "violet";
};

export type WalletCard = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type ServiceItem = {
  name: string;
  status: string;
  time: string;
  amount: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Services Status", href: "/status", icon: Activity },
  { label: "Our Service", href: "/services", icon: Cpu },
  { label: "Service Payment", href: "/payments", icon: CreditCard },
  { label: "PDF Services", href: "/pdf-service", icon: FileText },
  { label: "Distributors", href: "/distributors", icon: Building2 },
  { label: "Retailers", href: "/retailers", icon: Store },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Wallet", href: "/wallets", icon: Wallet },
  { label: "Server Control", href: "/admin", icon: Server },
];

export const stats: StatCard[] = [
  { label: "Today Payment", value: "50.00", change: "+12%", tone: "mint" },
  { label: "Approved", value: "2575", change: "+34", tone: "green" },
  { label: "Projected", value: "215", change: "Review", tone: "rose" },
  { label: "Resubmit", value: "32", change: "Follow up", tone: "violet" },
  { label: "Rejected", value: "0", change: "Declined", tone: "rose" },
];

export const walletCards: WalletCard[] = [
  { label: "Main Wallet", value: "2895.00", icon: Wallet },
  { label: "Wallet Request", value: "0", icon: UserCheck },
  { label: "Customers", value: "0", icon: Users },
  { label: "Retailers", value: "0", icon: Store },
  { label: "Distributors", value: "0", icon: Building2 },
];

export const services: ServiceItem[] = [
  {
    name: "Aadhaar address update",
    status: "Approved",
    time: "2 min ago",
    amount: "200.00",
  },
  {
    name: "PAN card service",
    status: "Pending",
    time: "9 min ago",
    amount: "120.00",
  },
  {
    name: "Retailer onboarding",
    status: "In process",
    time: "18 min ago",
    amount: "0.00",
  },
  {
    name: "Wallet payment request",
    status: "Resubmit",
    time: "42 min ago",
    amount: "500.00",
  },
];

// Rich types for Wallets and Payments implementation
export type WalletTransaction = {
  id: string;
  date: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  reference: string;
  status: "Success" | "Pending" | "Failed";
  walletType: "Main" | "API";
};

export type PaymentRequest = {
  id: string;
  retailerId: string;
  retailerName: string;
  shopName: string;
  amount: number;
  paymentMode: "UPI";
  utrNumber: string;
  status: "Pending" | "Approved" | "Resubmit" | "Rejected";
  requestDate: string;
  walletType: "Main" | "API";
  remarks?: string;
  adminNotes?: string;
};

// Seed mockup data for Wallet and Payment requests
export const initialTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    date: "2026-05-23 09:30 AM",
    type: "credit",
    description: "Wallet Recharge Approved (UTR: 629810458129)",
    amount: 1500.0,
    reference: "629810458129",
    status: "Success",
    walletType: "Main",
  },
  {
    id: "tx-2",
    date: "2026-05-23 09:45 AM",
    type: "debit",
    description: "PAN Card Application Charge",
    amount: 120.0,
    reference: "PAN-889104",
    status: "Success",
    walletType: "Main",
  },
  {
    id: "tx-3",
    date: "2026-05-23 10:02 AM",
    type: "debit",
    description: "Aadhaar Address Update Charge",
    amount: 200.0,
    reference: "ADR-665123",
    status: "Success",
    walletType: "Main",
  },
  {
    id: "tx-5",
    date: "2026-05-22 04:12 PM",
    type: "credit",
    description: "Recharge Request (UTR: 881029471923)",
    amount: 500.0,
    reference: "881029471923",
    status: "Success",
    walletType: "Main",
  },
];

export const initialPaymentRequests: PaymentRequest[] = [
  {
    id: "req-1",
    retailerId: "ret-1",
    retailerName: "Deva",
    shopName: "Jayaraman Multi Services",
    amount: 2500.0,
    paymentMode: "UPI",
    utrNumber: "771092837482",
    status: "Pending",
    requestDate: "2026-05-23 10:30 AM",
    walletType: "Main",
    remarks: "Added money for bulk PAN applications",
  },
  {
    id: "req-3",
    retailerId: "ret-3",
    retailerName: "Priya Sharma",
    shopName: "Priya Online E-Seva",
    amount: 500.0,
    paymentMode: "UPI",
    utrNumber: "991827364510",
    status: "Resubmit",
    requestDate: "2026-05-22 02:42 PM",
    walletType: "Main",
    remarks: "Emergency load",
    adminNotes:
      "Screenshot uploaded is blurry, please re-upload clear payment slip.",
  },
];
