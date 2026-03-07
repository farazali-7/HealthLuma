import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageCircle,
  CreditCard,
  Users,
  Settings,
  Pill,
  Megaphone,
  BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Exact match for active state (use on root routes like /dashboard, /doctor) */
  exact?: boolean;
}

export interface SidebarConfig {
  groupLabel: string;
  primary: NavItem[];
  secondary: NavItem[];
}

export const patientSidebarConfig: SidebarConfig = {
  groupLabel: "My Care",
  primary: [
    { title: "Dashboard",     href: "/dashboard",              icon: LayoutDashboard, exact: true },
    { title: "Appointments",  href: "/dashboard/appointments", icon: Calendar },
    { title: "Records",       href: "/dashboard/records",      icon: FileText },
    { title: "AI Assistant",  href: "/dashboard/ai",           icon: MessageCircle },
    { title: "Billing",       href: "/dashboard/billing",      icon: CreditCard },
    { title: "Family",        href: "/dashboard/family",       icon: Users },
  ],
  secondary: [
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};

export const doctorSidebarConfig: SidebarConfig = {
  groupLabel: "Practice",
  primary: [
    { title: "Dashboard",       href: "/doctor",                  icon: LayoutDashboard, exact: true },
    { title: "Appointments",    href: "/doctor/appointments",     icon: Calendar },
    { title: "Patients",        href: "/doctor/patients",         icon: Users },
    { title: "Prescriptions",   href: "/doctor/prescriptions",    icon: Pill },
    { title: "Medical Records", href: "/doctor/records",          icon: FileText },
    { title: "Announcements",   href: "/doctor/announcements",    icon: Megaphone },
    { title: "Billing",         href: "/doctor/billing",          icon: CreditCard },
    { title: "Analytics",       href: "/doctor/analytics",        icon: BarChart2 },
  ],
  secondary: [
    { title: "Clinic Settings", href: "/doctor/settings", icon: Settings },
  ],
};
