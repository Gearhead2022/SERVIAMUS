"use client";

import { useEffect, useRef } from "react";
import {
    useNotifications,
    useMarkAllAsRead,
    useMarkAsRead,
} from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileText, CheckCircle, XCircle, Bell, Info } from "lucide-react";

type Notification = {
    notif_id: number;
    user_Id: number;
    type: "NEW_REQUEST" | "APPROVED" | "REJECTED" | "SYSTEM";
    title: string;
    message: string;
    entity?: string;
    entity_id?: number;
    is_read: boolean;
    created_at?: string;
};

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

const typeConfig: Record<
    Notification["type"],
    {
        label: string;
        icon: React.ReactNode;
        iconBg: string;
        iconColor: string;
        badgeBg: string;
        badgeText: string;
    }
> = {
    NEW_REQUEST: {
        label: "New request",
        icon: <FileText size={13} />,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-700",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700",
    },
    APPROVED: {
        label: "Approved",
        icon: <CheckCircle size={13} />,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-700",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-700",
    },
    REJECTED: {
        label: "Rejected",
        icon: <XCircle size={13} />,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-700",
        badgeBg: "bg-orange-50",
        badgeText: "text-orange-700",
    },
    SYSTEM: {
        label: "System",
        icon: <Info size={13} />,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-700",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-700",
    },
};

function timeAgo(dateStr?: string): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

function resolveNotificationPath(
    notification: Notification,
    roles: string[] = []
) {
    if (notification.entity === "billing") {
        return "/billing";
    }

    if (notification.entity === "lab") {
      return "/labdashboard";
    }

    if (notification.entity === "lab-attachment") {
        return roles.includes("DOCTOR") ? "/externalLabReferences" : "/labdashboard";
    }

    if (notification.entity === "patient-deletion") {
        return "/patient-deletion-requests";
    }

    if (notification.entity === "consultation") {
        return "/docDashboard";
    }

    if (notification.entity === "request") {
        if (roles.includes("LAB") || roles.includes("LABORATORY")) {
            return "/labdashboard";
        }

        if (roles.includes("DOCTOR")) {
            return "/docDashboard";
        }

        if (roles.includes("CASHIER")) {
            return "/billing";
        }

        if (roles.includes("STAFF")) {
            return "/registration";
        }

        return "/dashboard";
    }

    return null;
}

export default function NotificationDropdown({ open, setOpen }: Props) {
    const router = useRouter();
    const { user } = useAuth();

    const { data = [], isLoading } = useNotifications(user?.user_id ?? 0);
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutateAsync: markAllAsRead } = useMarkAllAsRead();

    const unreadCount = data.filter((n: Notification) => !n.is_read).length;

    const handleClick = (n: Notification) => {
        markAsRead(n.notif_id);

        const targetPath = resolveNotificationPath(n, user?.roles ?? []);

        if (targetPath) {
            router.push(targetPath);
        }

        setOpen(false);
    };

    const handleMarkAllRead = async () => {
        if (!user?.user_id || unreadCount === 0) {
            return;
        }

        await markAllAsRead();
    };

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setOpen]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => {
                            void handleMarkAllRead();
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="max-h-[360px] overflow-y-auto">
                {isLoading && (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && data.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                        <Bell size={24} className="opacity-40" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                )}

                {!isLoading &&
                    data.map((n: Notification) => {
                        const cfg = typeConfig[n.type];
                        return (
                            <div
                                key={n.notif_id}
                                onClick={() => handleClick(n)}
                                className={`flex gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50 ${!n.is_read ? "bg-gray-50/70" : "bg-white"
                                    }`}
                            >
                                {/* Icon */}
                                <div className="shrink-0 mt-0.5">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}
                                    >
                                        {cfg.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-0.5">
                                        <span className="text-[13px] font-medium text-gray-900 leading-snug">
                                            {n.title}
                                        </span>
                                        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed truncate">
                                        {n.message}
                                    </p>
                                    <span
                                        className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}
                                    >
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Unread dot */}
                                <div className="shrink-0 mt-1.5 w-2">
                                    {!n.is_read && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Footer */}
            {data.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
