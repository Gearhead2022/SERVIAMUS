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
  iconOnly? : ReactNode;
  roles: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/pages/admin/dashboard",
    icon: <Home size={18} />,
    iconOnly: <Home size={30} />,
    roles: ["ADMIN", "MANAGER", "CASHIER"]
  },
  {
    label: "Sales",
    path: "/pages/admin/sales",
    icon: <ShoppingCart size={18} />,
    iconOnly: <ShoppingCart size={30} />,
    roles: [ "CASHIER"]
  },
  {
    label: "Inventory",
    path: "/pages/admin/inventory",
    icon: <Package size={18} />,
    iconOnly: <Package size={30} />,
    roles: ["ADMIN", "MANAGER"]
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <BarChart size={18} />,
    iconOnly: <BarChart size={30} />,
    roles: ["ADMIN", "MANAGER"]
  },
  {
    label: "Accounts",
    path: "/pages/admin/accountManagement",
    icon: <Users size={18} />,
    iconOnly: <Users size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Items",
    path: "/pages/admin/itemManagement",
    icon: <Newspaper size={18} />,
    iconOnly: <Newspaper size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Production",
    path: "/pages/admin/production",
    icon: <Newspaper size={18} />,
    iconOnly: <Newspaper size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Recipes",
    path: "/pages/admin/recipes",
    icon: <Newspaper size={18} />,
    iconOnly: <Newspaper size={30} />,
    roles: ["ADMIN"]
  }
];
