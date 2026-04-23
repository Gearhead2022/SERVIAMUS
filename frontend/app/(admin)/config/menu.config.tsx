import { ReactNode } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart,
  Newspaper
} from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  iconOnly?: ReactNode;
  roles: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  // ADMIN pages
  {
    label: "Dashboard",
    path: "/pages/admin/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Accounts",
    path: "/pages/admin/users",
    icon: <ShoppingCart size={18} />,
    iconOnly: <ShoppingCart size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Services",
    path: "/pages/admin/services",
    icon: <Package size={18} />,
    iconOnly: <Package size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <BarChart size={18} />,
    iconOnly: <BarChart size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Settings",
    path: "/pages/admin/setting",
    icon: <Users size={18} />,
    iconOnly: <Users size={30} />,
    roles: ["ADMIN"]
  },

  // DOCTOR

  {
    label: "Queue & Dashboard",
    path: "/docDashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },
  {
    label: "Registry & Request",
    path: "/patientHistoryList",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },
  {
    label: "History & Records",
    path: "/historyRecords",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },

  // LAB

  {
    label: "Dashboard",
    path: "/pages/doctor/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["LAB"]
  },

  // STAFF
  {
    label: "Dashboard",
    path: "/pages/doctor/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["STAFF"]
  },

  // CASHIER
  {
    label: "Billing",
    path: "/pages/cashier/billing",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["CASHIER"]
  },



];
