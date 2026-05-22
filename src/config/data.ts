import {
  CircleDollarSign,
  Home,
  UserCheck,
  Users,
  Wallet,
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
  { label: "Dashboard", href: "/", icon: Home },
];

export const stats: StatCard[] = [
  { label: "Today Payment", value: "50.00", change: "+12%", tone: "mint" },
  { label: "Pending", value: "20", change: "8 urgent", tone: "amber" },
  { label: "In Process", value: "0", change: "Clear", tone: "sky" },
  { label: "Approved", value: "2575", change: "+34", tone: "green" },
  { label: "Projected", value: "215", change: "Review", tone: "rose" },
  { label: "Resubmit", value: "32", change: "Follow up", tone: "violet" },
];

export const walletCards: WalletCard[] = [
  { label: "Main Wallet", value: "2895.00", icon: Wallet },
  { label: "API Wallet", value: "4.00", icon: CircleDollarSign },
  { label: "Wallet Request", value: "0", icon: UserCheck },
  { label: "Customers", value: "0", icon: Users },
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
