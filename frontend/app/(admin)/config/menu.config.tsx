import { ReactNode } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart,
  FileStack
} from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  iconOnly? : ReactNode;
  roles: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  // ADMIN pages
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Accounts",
    path: "/pages/admin/users",
    icon: <ShoppingCart size={18} />,
    iconOnly: <ShoppingCart size={30} />,
    roles: [ "ADMIN"]
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

  // STAFF

  {
    label: "Dashboard",
    path: "/pages/doctor/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },
  {
    label: "Consultations",
    path: "/pages/doctor/consultation",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },
  {
    label: "Request",
    path: "/pages/doctor/consultation",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["DOCTOR"]
  },

  // LAB

  {
    label: "Dashboard",
    path: "/labdashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["LAB", "LABORATORY"]
  },

  {
    label: "Laboratory Records",
    path: "/labrecords",
    icon: <FileStack size={18} />,
    iconOnly: <FileStack size={30} />,
    roles: ["LAB", "LABORATORY, DOCTOR"]
  },

  // STAFF
  {
    label: "Dashboard",
    path: "/registration",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["STAFF"]
  },

  // CASHIER
  {
    label: "Billing",
    path: "/billing",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["CASHIER", "ADMIN"]
  },



];
