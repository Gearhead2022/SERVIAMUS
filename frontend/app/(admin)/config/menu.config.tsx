import { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  FlaskConical,
  UserPlus,
  ListTodo,
  Clock3,
  ReceiptText,
  WalletCards,
  BriefcaseMedical,
  FilePlusCorner,
  Paperclip
} from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  icon?: ReactNode;
  iconOnly?: ReactNode;
  roles: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  // ───────────────── ADMIN ─────────────────
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    iconOnly: <LayoutDashboard size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Accounts",
    path: "/register",
    icon: <Users size={18} />,
    iconOnly: <Users size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Services",
    path: "/services",
    icon: <BriefcaseMedical size={18} />,
    iconOnly: <BriefcaseMedical size={30} />,
    roles: ["ADMIN"]
  },
  {
    label: "Encoding",
    path: "/encoding",
    icon: <FilePlusCorner size={18} />,
    iconOnly: <FilePlusCorner size={30} />,
    roles: ["ENCODER"]
  },
  // {
  //   label: "Settings",
  //   path: "/pages/admin/setting",
  //   icon: <Settings size={18} />,
  //   iconOnly: <Settings size={30} />,
  //   roles: ["ADMIN"]
  // },

  // ───────────────── DOCTOR ─────────────────
  {
    label: "Queue & Dashboard",
    path: "/docDashboard",
    icon: <ClipboardList size={18} />,
    iconOnly: <ClipboardList size={30} />,
    roles: ["DOCTOR"]
  },
  {
    label: "History & Records",
    path: "/historyRecords",
    icon: <History size={18} />,
    iconOnly: <History size={30} />,
    roles: ["DOCTOR", "ADMIN"]
  },
  {
    label: "External Lab References",
    path: "/externalLabReferences",
    icon: <Paperclip size={18} />,
    iconOnly: <Paperclip size={30} />,
    roles: ["DOCTOR"]
  },

  // ───────────────── LAB ─────────────────
  {
    label: "Dashboard",
    path: "/labdashboard",
    icon: <LayoutDashboard size={18} />,
    iconOnly: <LayoutDashboard size={30} />,
    roles: ["LAB", "LABORATORY"]
  },
  {
    label: "Laboratory Records",
    path: "/labrecords",
    icon: <FlaskConical size={18} />,
    iconOnly: <FlaskConical size={30} />,
    roles: ["LAB", "LABORATORY", "ENCODER", "ADMIN"]
  },

  // ───────────────── STAFF ─────────────────
  {
    label: "Registry & Request",
    path: "/registration",
    icon: <UserPlus size={18} />,
    iconOnly: <UserPlus size={30} />,
    roles: ["STAFF", "DOCTOR", "ADMIN"]
  },
  {
    label: "Request List",
    path: "/requestList",
    icon: <ListTodo size={18} />,
    iconOnly: <ListTodo size={30} />,
    roles: ["STAFF", "ADMIN"]
  },
  {
    label: "Queue",
    path: "/queue",
    icon: <Clock3 size={18} />,
    iconOnly: <Clock3 size={30} />,
    roles: ["ADMIN"]
  },

  // ───────────────── CASHIER ─────────────────
  {
    label: "Billing",
    path: "/billing",
    icon: <ReceiptText size={18} />,
    iconOnly: <ReceiptText size={30} />,
    roles: ["CASHIER", "ADMIN"]
  },
  {
    label: "Payment Records",
    path: "/payment",
    icon: <WalletCards size={18} />,
    iconOnly: <WalletCards size={30} />,
    roles: ["CASHIER", "ADMIN"]
  },
];
