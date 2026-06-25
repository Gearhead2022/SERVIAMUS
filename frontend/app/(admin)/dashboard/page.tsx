"use client";

import RoleGuard from "@/guards/RoleGuard";
import {
    Users, Receipt,
    Stethoscope, TrendingUp, TrendingDown,
    ArrowUpRight, UserCheck, UserX, FlaskConical, ShieldCheck,
    CheckCircle2, Banknote,
    CreditCard, Smartphone, Building2, BarChart3,
    ChevronRight, Hourglass, ClipboardList, PhilippinePeso,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formattedIsoPH, formattedIsoTimePH } from "@/utils/Date";
import { useDashboardStats } from "@/hooks/admin/useAdmin";
import { formatCurrency } from "@/utils/Date";
import Card from "@/components/ui/Card";

// ── Mock data ──────────────────────────────────────────────────────────────
// Replace these with your real hooks when available

type WeeklyRequest = {
    day: string;
    consultation: number;
    lab: number;
    cert: number;
};

type WeeklyStackedChartProps = {
    data: WeeklyRequest[];
};

type RequestTypeBreakdownUI = {
    label: string;
    value: number;
    pct: number;
    color: string;
    bg: string;
};

type LabCategoryStat = {
    label: string;
    count: number;
    color: string;
    bg: string;
};

type UserCategory = {
    label: string;
    color: string;
    bg: string;
    role: string;
    count: number;
    active: number;
    icon: React.ElementType;
};

function CardHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-5 py-4 flex items-center justify-between gap-3"
            style={{ borderBottom: "1px solid #f0f3fa" }}>
            {children}
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8a99b8" }}>
            {children}
        </p>
    );
}

function DeltaChip({ delta, pct }: { delta: number; pct: number }) {
    const up = delta >= 0;
    return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: up ? "#f0fdf4" : "#fdf0f2", color: up ? "#166534" : "#c8102e" }}>
            {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {pct.toFixed(1)}%
        </span>
    );
}

// Horizontal bar
function HBar({ pct, color }: { pct: number; color: string }) {
    return (
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f3fa" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
    );
}

// ── Stacked bar chart (weekly) ─────────────────────────────────────────────

function WeeklyStackedChart({ data, }: WeeklyStackedChartProps) {
    const maxTotal = Math.max(...data.map((d) => d.consultation + d.lab + d.cert));
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return (
        <div className="flex items-end gap-2 h-[250px] pt-2">
            {data.map((d, i) => {
                const total = d.consultation + d.lab + d.cert;
                const isToday = i === todayIdx;
                const scale = total / maxTotal;
                return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold tabular-nums"
                            style={{ color: isToday ? "#c8102e" : "#8a99b8" }}>
                            {total}
                        </span>
                        <div className="w-full flex flex-col-reverse rounded-lg overflow-hidden transition-all"
                            style={{ height: `${Math.max(scale * 150, 6)}px`, opacity: isToday ? 1 : 0.75 }}>
                            <div style={{ flex: d.consultation, background: "#0f2244" }} />
                            <div style={{ flex: d.lab, background: "#7c4dab" }} />
                            <div style={{ flex: d.cert, background: "#0e7c7b" }} />
                        </div>
                        <span className="text-[9px] font-semibold"
                            style={{ color: isToday ? "#0f2244" : "#b0bcd4" }}>
                            {d.day}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────

const AdminDashboard = () => {
    const { user } = useAuth();

    const {
        data,
        isLoading,
        error,
    } = useDashboardStats();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !data) {
        return <div>Failed to load dashboard</div>;
    }

    const OVERVIEW_STATS = [
        {
            label: "Patients",
            value: data.patients.total,
            delta: data.patients.patientDelta,
            deltaPct: data.patients.patientDeltaPct,
            icon: Users,
            color: "#0f2244",
            bg: "#eef1f9",
            bar: "#0f2244",
        },

        {
            label: "Requests",
            value: data.requests.total,
            delta: data.requests.requestDelta,
            deltaPct: data.requests.requestDeltaPct,
            icon: ClipboardList,
            color: "#7c4dab",
            bg: "#f3eefb",
            bar: "#7c4dab",
        },

        {
            label: "Revenue This Month",
            value: data.revenue.current,
            delta: data.revenue.revenueDelta,
            deltaPct: data.revenue.revenueDeltaPct,
            icon: PhilippinePeso,
            color: "#0e7c7b",
            bg: "#e0f4f4",
            bar: "#0e7c7b",
        },

        {
            label: "Collection Rate",
            value: data.billing.collectionRate,
            delta: data.billing.collectionRateDelta,
            deltaPct: data.billing.collectionRateDeltaPct,
            icon: TrendingUp,
            color: "#c8102e",
            bg: "#fdf0f2",
            bar: "#c8102e",
        }
    ];

    const REVENUE_NREAKDOWN = [
        { label: "Total Billed", value: data.billing.totalBilled.toLocaleString(), color: "#0f2244", bg: "#eef1f9" },
        { label: "Collected", value: data.billing.totalCollected.toLocaleString(), color: "#166534", bg: "#f0fdf4" },
        { label: "Pending", value: data.billing.totalPending.toLocaleString(), color: "#c8102e", bg: "#fdf0f2" },
    ];

    const REQUEST_STATUS_BREAKDOWN = [
        { label: "Serving", value: data.requests.serving, pct: 81, color: "#166534", bg: "#f0fdf4", dot: "#22c55e" },
        { label: "Done", value: data.requests.done, pct: 81, color: "#166534", bg: "#f0fdf4", dot: "#22c55e" },
        { label: "Waiting", value: data.requests.pending, pct: 12, color: "#92400e", bg: "#fffbeb", dot: "#f59e0b" },
        { label: "Cancelled", value: data.requests.cancelled, pct: 7, color: "#475569", bg: "#f1f5f9", dot: "#94a3b8" },
    ];

    const PAYMENT_METHOD_BREAKDOWN = [
        { label: "Cash", value: data.paymentMethods.CASH, count: 298, color: "#166534", bg: "#f0fdf4", icon: Banknote },
        { label: "GCash", value: data.paymentMethods.GCASH, count: 141, color: "#1d4ed8", bg: "#eff6ff", icon: Smartphone },
        { label: "Card", value: data.paymentMethods.CARD, count: 89, color: "#7c4dab", bg: "#f3eefb", icon: CreditCard },
        { label: "Bank Transfer", value: data.paymentMethods.BANK_TRANSFER, count: 28, color: "#0e7c7b", bg: "#e0f4f4", icon: Building2 },
    ];

    const REQUEST_TYPE_META = {
        CONSULTATION: {
            color: "#0f2244",
            bg: "#eef1f9",
        },
        LABORATORY: {
            color: "#7c4dab",
            bg: "#f3eefb",
        },
        CERTIFICATE: {
            color: "#0e7c7b",
            bg: "#e0f4f4",
        },
    };

    const REQUEST_TYPE_BREAKDOWN =
        data?.requestTypeBreakdown?.map((item: RequestTypeBreakdownUI) => ({
            ...item,
            ...REQUEST_TYPE_META[
            item.label as keyof typeof REQUEST_TYPE_META
            ],
        })) ?? [];

    const LAB_CATEGORY_META = {
        "Clinical Chemistry": {
            color: "#7c4dab",
            bg: "#f3eefb",
        },

        Hematology: {
            color: "#c8102e",
            bg: "#fdf0f2",
        },

        "Clinical Microscopy": {
            color: "#0e7c7b",
            bg: "#e0f4f4",
        },

        Serology: {
            color: "#1d4ed8",
            bg: "#eff6ff",
        },

        OTHER: {
            color: "#0f2244",
            bg: "#eef1f9",
        },
    };

    const USER_STATS_META = {
        DOCTOR: { label: "Doctors", color: "#0f2244", bg: "#eef1f9", icon: Stethoscope, },
        NURSE: { label: "Nurses/Staff", color: "#0e7c7b", bg: "#e0f4f4", icon: UserCheck, },
        CASHIER: { label: "Cashiers", color: "#166534", bg: "#f0fdf4", icon: Receipt, },
        LAB_TECH: { label: "Lab Tech", color: "#7c4dab", bg: "#f3eefb", icon: FlaskConical, },
    }

    const LAB_CATEGORY_STATS =
        (data?.labCategoryStats ?? []).map(
            (item: LabCategoryStat) => ({
                ...item,

                ...(LAB_CATEGORY_META[
                    item.label as keyof typeof LAB_CATEGORY_META
                ] ?? LAB_CATEGORY_META.OTHER),
            })
        );

    const USER_STATS =
        (data?.userStats ?? []).map((user: UserCategory) => ({
            ...user,
            ...(USER_STATS_META[
                user.role as keyof typeof USER_STATS_META
            ] ?? {
                label: user.role,
                color: "#64748b",
                bg: "#f1f5f9",
                icon: Users,
            }),
        }));

    console.log('data', data);

    const totalLabCount = LAB_CATEGORY_STATS.reduce(
        (sum: number, item: LabCategoryStat) =>
            sum + item.count,
        0
    );

    const BILLING_STATS = {
        totalBilled: data.billing.totalBilling,
        collected: data.billing.paidBilling,
        pending: data.billing.pendingBilling,
        collectionRate: data.billing.collectionRate,
    };

    const WEEKLY_REQUESTS: WeeklyRequest[] =
        data?.weeklyRequests ?? [];

    const totalUsers = (data?.userStats ?? []).reduce(
        (sum: number, item: UserCategory) => sum + item.count,
        0
    );

    const activeUsers = (data?.userStats ?? []).reduce(
        (sum: number, item: UserCategory) => sum + item.active,
        0
    );

    return (
        <RoleGuard allowedRoles={["ADMIN"]}>
            <div className="min-h-screen font-['DM_Sans']"
                style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>

                {/* ── Page header ── */}
                <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between gap-6 flex-wrap">
                    <div>
                        <h1 className="font-['DM_Serif_Display'] text-3xl text-black tracking-wide leading-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-black/55 text-sm mt-0.5">
                            {formattedIsoPH()} &nbsp;·&nbsp;
                            <span className="font-mono">{formattedIsoTimePH()}</span>
                            &nbsp;·&nbsp; {user?.name ?? "Administrator"}
                        </p>
                    </div>
                </div>

                <div className="px-8 py-2 space-y-5">

                    {/* <SummaryCards items={items} /> */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {OVERVIEW_STATS.map(({ label, value, delta, deltaPct, icon: Icon, color, bg, bar }) => (
                            <Card key={label}>
                                <div className="h-[3px]" style={{ background: bar }} />
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                                            <Icon size={17} style={{ color }} />
                                        </div>
                                        <DeltaChip delta={delta} pct={deltaPct} />
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>
                                        {label === "Revenue This Month"
                                            ? formatCurrency(value)
                                            : value.toLocaleString()}
                                    </p>
                                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: "#6b7da0" }}>{label}</p>
                                    <p className="text-[10.5px] mt-1.5 flex items-center gap-1"
                                        style={{ color: delta >= 0 ? "#166534" : "#c8102e" }}>
                                        <ArrowUpRight size={10} />
                                        {Math.abs(delta).toLocaleString()} vs last month
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* ── Row 2: Weekly chart + Breakdown cards ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                        {/* Weekly stacked bar */}
                        <Card className="xl:col-span-2">
                            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #0f2244 33%, #7c4dab 66%, #0e7c7b 100%)" }} />
                            <CardHeader>
                                <div>
                                    <SectionLabel>Weekly Activity</SectionLabel>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                                        Requests by type this week
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {[
                                        { label: "Consultation", color: "#0f2244" },
                                        { label: "Laboratory", color: "#7c4dab" },
                                        { label: "Certificate", color: "#0e7c7b" },
                                    ].map(({ label, color }) => (
                                        <div key={label} className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                                            <span className="text-[10px] font-semibold" style={{ color: "#8a99b8" }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardHeader>
                            <div className="px-5 pb-5 pt-3">
                                <WeeklyStackedChart data={WEEKLY_REQUESTS} />
                            </div>
                        </Card>

                        {/* Request breakdown */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "#0f2244" }} />
                            <CardHeader>
                                <div>
                                    <SectionLabel>Requests This Month</SectionLabel>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>614 total</p>
                                </div>
                                <BarChart3 size={14} style={{ color: "#b0bcd4" }} />
                            </CardHeader>
                            <div className="px-5 py-4 space-y-3">
                                {REQUEST_TYPE_BREAKDOWN.map((item: RequestTypeBreakdownUI) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                                <span className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.value}</span>
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                                    style={{ background: item.bg, color: item.color }}>{item.pct}%</span>
                                            </div>
                                        </div>
                                        <HBar pct={item.pct} color={item.color} />
                                    </div>
                                ))}

                                <div className="pt-3" style={{ borderTop: "1px solid #f0f3fa" }}>
                                    <SectionLabel>By Status</SectionLabel>
                                    <div className="mt-2.5 space-y-2.5">
                                        {REQUEST_STATUS_BREAKDOWN.map(({ label, value, pct, color, dot }) => (
                                            <div key={label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                                                    <span className="text-[11.5px] font-semibold" style={{ color: "#1a2a45" }}>{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <HBar pct={pct} color={dot} />
                                                    <span className="text-[11px] font-bold w-6 text-right" style={{ color }}>{value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ── Row 3: Revenue + Lab categories + Users ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                        {/* Revenue / Billing */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "#166534" }} />
                            <CardHeader>
                                <div>
                                    <SectionLabel>Billing Overview</SectionLabel>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>This month</p>
                                </div>
                                <TrendingUp size={14} style={{ color: "#166534" }} />
                            </CardHeader>
                            <div className="px-5 py-4">

                                {/* Collection rate */}
                                <div className="rounded-2xl px-4 py-4 mb-4 text-center"
                                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 60%, #166534 100%)" }}>
                                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                                        style={{ color: "rgba(255,255,255,0.5)" }}>
                                        Collection Rate
                                    </p>
                                    <p className="text-3xl font-bold text-white mt-0.5"
                                        style={{ fontFamily: "'DM Serif Display', serif" }}>
                                        {BILLING_STATS.collectionRate}%
                                    </p>
                                    <div className="mt-2 h-1.5 rounded-full overflow-hidden"
                                        style={{ background: "rgba(255,255,255,0.15)" }}>
                                        <div className="h-full rounded-full"
                                            style={{ width: `${BILLING_STATS.collectionRate}%`, background: "linear-gradient(to right, #22c55e, #4ade80)" }} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {REVENUE_NREAKDOWN.map(({ label, value, color, bg }) => (
                                        <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                                            style={{ background: bg }}>
                                            <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
                                            <span className="font-bold text-[13.5px]" style={{ color, fontFamily: "'DM Serif Display', serif" }}>
                                                {formatCurrency(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment methods */}
                                <div className="mt-4">
                                    <SectionLabel>Payment Methods</SectionLabel>
                                    <div className="mt-2.5 space-y-2">
                                        {PAYMENT_METHOD_BREAKDOWN.map(({ label, value, color, bg, icon: Icon }) => (
                                            <div key={label} className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: bg }}>
                                                    <Icon size={12} style={{ color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between mb-0.5">
                                                        <span className="text-[11px] font-semibold" style={{ color: "#1a2a45" }}>{label}</span>
                                                        <span className="text-[11px] font-bold" style={{ color }}>{formatCurrency(value)}</span>
                                                    </div>
                                                    <HBar pct={Math.round(value / BILLING_STATS.collected * 100)} color={color} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Lab category breakdown */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "#7c4dab" }} />
                            <CardHeader>
                                <div>
                                    <SectionLabel>Laboratory Tests</SectionLabel>
                                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>
                                        {totalLabCount} tests this month
                                    </p>
                                </div>
                                <FlaskConical size={14} style={{ color: "#7c4dab" }} />
                            </CardHeader>
                            <div className="px-5 py-4 space-y-3">
                                {LAB_CATEGORY_STATS.map((item: LabCategoryStat) => {
                                    const pct =
                                        totalLabCount > 0
                                            ? Math.round(
                                                (item.count / totalLabCount) * 100
                                            )
                                            : 0;
                                    return (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                        style={{ background: item.bg }}>
                                                        <FlaskConical size={10} style={{ color: item.color }} />
                                                    </div>
                                                    <span className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.count}</span>
                                                    <span className="text-[10px] w-8 text-right" style={{ color: "#8a99b8" }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <HBar pct={pct} color={item.color} />
                                        </div>
                                    );
                                })}

                                {/* Lab pending / done summary */}
                                <div className="mt-4 grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid #f0f3fa" }}>
                                    {[
                                        { label: "Completed", value: 377, icon: CheckCircle2, color: "#065050", bg: "#e0f4f4" },
                                        { label: "Still Pending", value: 12, icon: Hourglass, color: "#92400e", bg: "#fffbeb" },
                                    ].map(({ label, value, icon: Icon, color, bg }) => (
                                        <div key={label} className="rounded-xl px-3 py-3 flex flex-col items-center text-center"
                                            style={{ background: bg }}>
                                            <Icon size={16} style={{ color }} className="mb-1.5" />
                                            <p className="text-xl font-bold" style={{ color, fontFamily: "'DM Serif Display', serif" }}>
                                                {value}
                                            </p>
                                            <p className="text-[10px] font-semibold mt-0.5" style={{ color }}>{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Users + Recent activity */}
                        <Card>
                            <div className="h-[3px]" style={{ background: "#0e7c7b" }} />
                            <CardHeader>
                                <div>
                                    <SectionLabel>System Users</SectionLabel>
                                    <p
                                        className="font-semibold text-sm mt-0.5"
                                        style={{ color: "#0f2244" }}
                                    >
                                        {totalUsers} total · {activeUsers} active
                                    </p>
                                </div>
                                <ShieldCheck size={14} style={{ color: "#0e7c7b" }} />
                            </CardHeader>
                            <div className="px-5 py-4 space-y-2.5">
                                {USER_STATS.map((user: UserCategory) => (
                                    <div key={user.role} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                        style={{ background: user.bg }}>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: user.color + "20" }}>
                                            <ChevronRight size={14} style={{ color: user.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[12.5px]" style={{ color: "#1a2a45" }}>{user.role}</p>
                                            <p className="text-[10.5px]" style={{ color: user.color }}>
                                                {user.active} active / {user.count} total
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold" style={{ color: user.color, fontFamily: "'DM Serif Display', serif" }}>
                                                {user.count}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Patient stats */}
                                <div className="pt-3" style={{ borderTop: "1px solid #f0f3fa" }}>
                                    <SectionLabel>Patient Stats</SectionLabel>
                                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                                        {[
                                            { label: "New This Month", value: 128, color: "#0e7c7b", bg: "#e0f4f4", icon: UserCheck },
                                            { label: "No-shows", value: 44, color: "#c8102e", bg: "#fdf0f2", icon: UserX },
                                        ].map(({ label, value, color, bg, icon: Icon }) => (
                                            <div key={label} className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                                                style={{ background: bg }}>
                                                <Icon size={14} style={{ color }} />
                                                <div>
                                                    <p className="text-[15px] font-bold" style={{ color, fontFamily: "'DM Serif Display', serif" }}>
                                                        {value}
                                                    </p>
                                                    <p className="text-[9.5px] font-semibold" style={{ color }}>{label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
};

export default AdminDashboard;