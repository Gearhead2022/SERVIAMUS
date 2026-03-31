"use client";

import { useState } from "react";
import { Lock, User, CircleUser, Eye, EyeOff, BadgeCheck, Hash, FileDigit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { registerSchema } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useRegister";
import { useAuthRoles } from "@/hooks/useAuthRoles";

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ── Shared styles ── */
const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

const inputBase =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";

const inputErr =
  "border-[#c8102e] focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.1)]";

const iconWrap =
  "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b0bcd4]";

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
  label,
  error,
  icon,
  children,
  span2 = false,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      <div className={icon ? "relative" : ""}>
        {icon && <span className={iconWrap}>{icon}</span>}
        {children}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export default function POSRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutateAsync: registerUser, isPending } = useRegister();
  const { data: roles, isLoading: roleLoading } = useAuthRoles();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: { role_id: 0 },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser({
      name: data.name,
      username: data.username,
      password: data.password,
      role_id: data.role_id,
      title: data.title,
      license_no: data.license_no,
      ptr_no: data.ptr_no,
    });
  };

  return (
    <div
      className="min-h-screen flex items-right justify-right px-6 font-['DM_Sans']"
      style={{
        background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e3d5c 100%)",
      }}
    >
      <div className="w-full max-w-[70%]">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div
            className="px-8 py-6 flex items-center gap-4"
            style={{ background: "linear-gradient(90deg, #0f2244 0%, #1a3560 100%)" }}
          >
            <div className="w-11 h-11 rounded-xl bg-[#c8102e] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#c8102e]/30">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.523 0 10 2.239 10 5v1H2v-1c0-2.761 4.477-5 10-5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-['DM_Serif_Display'] text-xl text-white tracking-wide">
                User Registration
              </h1>
              <p className="text-white/70 text-xs mt-0.5 font-light">
                Create a new system account
              </p>
            </div>
          </div>

          {/* Section label */}
          <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-8 py-3 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7da0]">
              Account Information
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-6 space-y-0">

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

              {/* Name */}
              <Field label="Full Name" error={errors.name?.message}
                icon={<User size={15} />}>
                <input
                  {...register("name")}
                  placeholder="e.g. Dr. Maria Santos"
                  className={`${inputBase} pl-9 ${errors.name ? inputErr : ""}`}
                />
              </Field>

              {/* Username */}
              <Field label="Username" error={errors.username?.message}
                icon={<CircleUser size={15} />}>
                <input
                  {...register("username")}
                  placeholder="system username"
                  className={`${inputBase} pl-9 ${errors.username ? inputErr : ""}`}
                />
              </Field>

              {/* Password */}
              <Field label="Password" error={errors.password?.message}
                icon={<Lock size={15} />}>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`${inputBase} pl-9 pr-10 ${errors.password ? inputErr : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0bcd4] hover:text-[#6b7da0] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm Password" error={errors.confirm_password?.message}
                icon={<Lock size={15} />}>
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirm_password")}
                  placeholder="••••••••"
                  className={`${inputBase} pl-9 pr-10 ${errors.confirm_password ? inputErr : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b0bcd4] hover:text-[#6b7da0] transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>

              {/* Role */}
              <Field label="Role" error={errors.role_id?.message} span2>
                <select
                  {...register("role_id", { valueAsNumber: true })}
                  disabled={roleLoading}
                  className={`${inputBase} appearance-none bg-[image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7da0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] pr-9 ${errors.role_id ? inputErr : ""} ${roleLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <option value={0}>— Select a role —</option>
                  {roles?.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </Field>

            </div>

            {/* Professional Details section */}
            <div className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7da0]">
                  Professional Details
                </span>
                <span className="flex-1 h-px bg-[#dce3ef]" />
                <span className="text-[10px] text-[#b0bcd4]">Optional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

                {/* Title */}
                <Field label="Title / Designation" error={errors.title?.message}
                  icon={<BadgeCheck size={15} />}>
                  <input
                    {...register("title")}
                    placeholder="e.g. MD, RN, RMT"
                    className={`${inputBase} pl-9 ${errors.title ? inputErr : ""}`}
                  />
                </Field>

                {/* License No */}
                <Field label="License No." error={errors.license_no?.message}
                  icon={<Hash size={15} />}>
                  <input
                    {...register("license_no")}
                    placeholder="License number"
                    className={`${inputBase} pl-9 ${errors.license_no ? inputErr : ""}`}
                  />
                </Field>

                {/* PTR No */}
                <Field label="PTR No." error={errors.ptr_no?.message}
                  icon={<FileDigit size={15} />}>
                  <input
                    {...register("ptr_no")}
                    placeholder="PTR number"
                    className={`${inputBase} pl-9 ${errors.ptr_no ? inputErr : ""}`}
                  />
                </Field>

              </div>
            </div>

            {/* Divider + Submit */}
            <div className="pt-6 border-t border-[#dce3ef] mt-6 flex items-center justify-between">
              <p className="text-[11px] text-[#b0bcd4]">
                All required fields must be completed.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isPending
                    ? "#6b7da0"
                    : "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)",
                  boxShadow: isPending ? "none" : "0 4px 16px rgba(15,34,68,0.25)",
                }}
              >
                {isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Registering…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register Account
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Below-card note */}
        <p className="text-center text-white/20 text-xs mt-4">
          Accounts are inactive until approved by an administrator.
        </p>
      </div>
    </div>
  );
}