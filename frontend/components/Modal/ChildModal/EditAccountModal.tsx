"use client";

import { useEffect } from "react";
import { User, CircleUser, BadgeCheck, Hash, FileDigit, X, RefreshCw, Save, ToggleLeft, ToggleRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useAuthRoles } from "@/hooks/useAuthRoles";
import { useUpdateUser } from "@/hooks/useRegister";
import { UserRole } from "@/hooks/admin/useAdmin";

// ── Schema ────────────────────────────────────────────────────────────────────
// Adjust to match your actual edit schema — no password fields for edit

const editUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    role_id: z.number().min(1, "Please select a role"),
    title: z.string().optional(),
    license_no: z.string().optional().nullable(),
    ptr_no: z.string().optional().nullable(),
    is_active: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export type EditableUser = {
    user_id: number;
    name: string;
    username: string;
    title?: string | null;
    license_no?: string | null;
    ptr_no?: string | null;
    is_active: boolean;
    role: UserRole | null;
};

// ── Shared style tokens ───────────────────────────────────────────────────────

const labelCls = "block text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8] mb-1.5";

const inputBase =
    "w-full bg-[#f0f3fa] border-[1.5px] border-[#dce3ef] rounded-xl px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.08)] focus:bg-white placeholder:text-[#b0bcd4]";

const inputErr =
    "border-[#c8102e] focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.08)]";

const iconWrap =
    "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b0bcd4]";

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 text-[11px] text-[#c8102e] flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {message}
        </p>
    );
}

function Field({
    label, error, icon, children, span2 = false,
}: {
    label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode; span2?: boolean;
}) {
    return (
        <div className={span2 ? "md:col-span-2" : ""}>
            <label className={labelCls}>{label}</label>
            <div className={icon ? "relative" : ""}>{icon && <span className={iconWrap}>{icon}</span>}{children}</div>
            <FieldError message={error} />
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EditUserModal({
    user,
    role_id,
    onClose,
    onSuccess,
}: {
    user: EditableUser;
    role_id: number;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const { mutateAsync: updateUser, isPending } = useUpdateUser(); // adjust to your hook
    const { data: roles, isLoading: roleLoading } = useAuthRoles();

    const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

    const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        mode: "onSubmit",
        defaultValues: {
            name: user.name,
            username: user.username,
            role_id: role_id,
            title: user.title ?? "",
            license_no: user.license_no ?? "",
            ptr_no: user.ptr_no ?? "",
            is_active: user.is_active,
        },
    });

    const watchedActive = watch("is_active");

    const onSubmit = async (data: EditUserFormValues) => {
        await updateUser({
            user_id: user.user_id,
            data: {
                name: data.name,
                username: data.username,
                role_id: data.role_id,
                title: data.title ?? undefined,
                license_no: data.license_no ?? undefined,
                ptr_no: data.ptr_no ?? undefined,
                is_active: data.is_active,
            },
        });
        onSuccess?.();
        onClose();
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[50] flex items-center justify-center p-4"
            style={{ background: "rgba(15,34,68,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl"
                style={{ boxShadow: "0 32px 96px rgba(15,34,68,0.28)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Gradient hero ── */}
                <div
                    className="relative px-6 py-6 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)" }}
                >
                    {/* Decorative blobs */}
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: "rgba(14,124,123,0.18)" }} />

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                    >
                        <X size={14} />
                    </button>

                    <div className="relative z-10 flex items-center gap-4">
                        {/* Clinic logo */}
                        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_8px_24px_rgba(15,34,68,0.18)] flex-shrink-0">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                                priority
                            />
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                                Serviamus Medical Clinic and Laboratory
                            </p>
                            <h2 className="text-white text-lg leading-tight"
                                style={{ fontFamily: "'DM Serif Display', serif" }}>
                                Edit User Account
                            </h2>
                            <p className="text-[12px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Updating details for this user
                            </p>
                        </div>

                        {/* User identity chip */}
                        <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[12px] flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.18)", color: "white", fontFamily: "'DM Serif Display', serif" }}>
                                {initials}
                            </div>
                            <div>
                                <p className="text-[12.5px] font-semibold text-white leading-tight">{user.name}</p>
                                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    @{user.username}
                                    {user.role?.role_name && <> · {user.role.role_name}</>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Account Information */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>
                                Account Information
                            </p>
                            <span className="flex-1 h-px" style={{ background: "#f0f3fa" }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <Field label="Full Name" error={errors.name?.message} icon={<User size={14} />}>
                                <input {...register("name")} placeholder="e.g. Dr. Maria Santos"
                                    className={`${inputBase} pl-9 ${errors.name ? inputErr : ""}`} />
                            </Field>

                            <Field label="Username" error={errors.username?.message} icon={<CircleUser size={14} />}>
                                <input {...register("username")} placeholder="system username"
                                    className={`${inputBase} pl-9 ${errors.username ? inputErr : ""}`} />
                            </Field>

                            <Field label="Role" error={errors.role_id?.message}>
                                <select {...register("role_id", { valueAsNumber: true })} disabled={roleLoading}
                                    className={`${inputBase} appearance-none bg-[image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7da0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] pr-9 ${errors.role_id ? inputErr : ""} ${roleLoading ? "opacity-60 cursor-not-allowed" : ""}`}>
                                    <option value={0}>— Select a role —</option>
                                    {roles?.map((role) => (
                                        <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Account status toggle */}
                            <div>
                                <label className={labelCls}>Account Status</label>
                                <button
                                    type="button"
                                    onClick={() => setValue("is_active", !watchedActive, { shouldDirty: true })}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                                    style={{
                                        border: `1.5px solid ${watchedActive ? "#b0dede" : "#dce3ef"}`,
                                        background: watchedActive ? "#f0fdf9" : "#f8f9fc",
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        {watchedActive
                                            ? <ToggleRight size={18} style={{ color: "#0e7c7b" }} />
                                            : <ToggleLeft size={18} style={{ color: "#94a3b8" }} />
                                        }
                                        <span className="text-[13px] font-semibold"
                                            style={{ color: watchedActive ? "#065050" : "#64748b" }}>
                                            {watchedActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <span className="text-[10.5px] font-medium"
                                        style={{ color: watchedActive ? "#0e7c7b" : "#94a3b8" }}>
                                        {watchedActive ? "User can log in" : "Login disabled"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>
                                Professional Details
                            </p>
                            <span className="flex-1 h-px" style={{ background: "#f0f3fa" }} />
                            <span className="text-[10px]" style={{ color: "#b0bcd4" }}>Optional</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                            <Field label="Title / Designation" error={errors.title?.message} icon={<BadgeCheck size={14} />}>
                                <input {...register("title")} placeholder="e.g. MD, RN, RMT"
                                    className={`${inputBase} pl-9 ${errors.title ? inputErr : ""}`} />
                            </Field>
                            <Field label="License No." error={errors.license_no?.message} icon={<Hash size={14} />}>
                                <input {...register("license_no")} placeholder="License number"
                                    className={`${inputBase} pl-9 ${errors.license_no ? inputErr : ""}`} />
                            </Field>
                            <Field label="PTR No." error={errors.ptr_no?.message} icon={<FileDigit size={14} />}>
                                <input {...register("ptr_no")} placeholder="PTR number"
                                    className={`${inputBase} pl-9 ${errors.ptr_no ? inputErr : ""}`} />
                            </Field>
                        </div>
                    </div>

                    {/* Unsaved changes notice */}
                    {isDirty && (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <ShieldCheck size={13} style={{ color: "#d97706" }} />
                            <p className="text-[11.5px] font-medium" style={{ color: "#92400e" }}>
                                You have unsaved changes.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #f0f3fa" }}>
                        <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                            Password can be reset separately.
                        </p>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                                style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isPending || !isDirty}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: isPending || !isDirty
                                        ? "#b0bcd4"
                                        : "linear-gradient(135deg, #0f2244 0%, #0e7c7b 100%)",
                                    boxShadow: isPending || !isDirty ? "none" : "0 4px 14px rgba(15,34,68,0.2)",
                                }}>
                                {isPending
                                    ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
                                    : <><Save size={13} /> Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
