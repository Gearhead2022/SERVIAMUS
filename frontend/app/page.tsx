"use client";

import { useState } from "react";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useLogin";
import { loginSchema } from "@/schemas/auth.schema";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-[11px] text-[#ff6b6b] flex items-center gap-1.5">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}

export default function POSLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: mLogin, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginFormValues) => {
    await mLogin(data);
  };

  return (
    <div className="min-h-screen flex font-['DM_Sans'] overflow-hidden">

      {/* ══════════════════════════════════════
          LEFT — Photo panel (desktop only)
      ══════════════════════════════════════ */}
      <div className="hidden lg:block relative w-1/2 flex-shrink-0">

        {/* Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/serviamus.jpeg')" }}
        />

        {/* Deep vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,20,44,0.35) 0%, rgba(10,20,44,0.15) 40%, rgba(10,20,44,0.72) 100%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-3/4"
          style={{
            background: "linear-gradient(to top, rgba(8,16,36,0.85) 0%, transparent 100%)",
          }}
        />

        {/* Content over photo */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">

          {/* Top: logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-none flex items-center justify-center shadow-lg shadow-white/50">
              <img src="../images/serviamus2.png" alt="" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold tracking-wide">Serviamus</p>
              <p className="text-white/70 text-[10px] tracking-widest uppercase">Medical Clinic & Laboratory</p>
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="font-['DM_Serif_Display'] text-white text-6xl leading-[1.12]">
              Clinic &<br />
              Laboratory<br />
              <span className="text-black text-[20px] bg-white/60 p-2 rounded-sm font-semibold uppercase tracking-[0.3em]">
                Management System
              </span>
            </h1>

            <p className="text-white/75 text-sm leading-relaxed max-w-[260px]">
              Unified patient records, consultations, and lab requests — all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Patient Registry", "Consultations", "Lab Requests", "Records"].map((f) => (
                <span
                  key={f}
                  className="text-[10.5px] font-medium text-white/70 border border-white/[0.1] bg-white/[0.20] backdrop-blur-sm px-3 py-1 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>

            <p className="text-white/15 text-[10px] pt-2">
              © {new Date().getFullYear()} Serviamus. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Dark form panel
      ══════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col justify-center px-10 lg:px-16 xl:px-24 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(2, 10, 22, 1), rgba(2, 10, 22, 1), rgba(2, 10, 22, 0.5))" }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Top-right glow */}
        <div
          className="absolute top-0 right-0 w-200 h-200 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(74, 105, 151, 0.5), transparent 70%)",
          }}
        />
        {/* Bottom-left accent glow */}
        <div
          className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(circle at bottom left, rgba(202, 170, 176, 0.07), transparent 70%)",
          }}
        />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12">
          <div className="w-20 h-20 rounded-2xl bg-none flex items-center justify-center">
            <img src="../images/serviamus.jpeg" className="rounded-[100%]" alt="" />
          </div>
          <span className="font-['DM_Serif_Display'] text-white text-[3rem]">Serviamus
            <br /><p className="text-sm">Clinic & Laboratory Management</p>
          </span>
        </div>

        {/* Form content */}
        <div className="relative z-10 w-full max-w-md mx-auto bg-none p-0 sm:p-10 sm:bg-white/15 rounded-4xl">

          {/* Heading */}
          <div className="mb-10">
         
            <h2 className="font-['DM_Serif_Display'] text-white text-[1.5rem] leading-tight">
              Welcome back...
            </h2>
            <p className="text-white/60 text-sm mt-2.5">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/75 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  {...register("username")}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all ${
                    errors.username
                      ? "bg-[#c8102e]/10 border border-[#c8102e]/50 focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.12)]"
                      : "bg-white/[0.05] border border-white/[0.08] focus:border-white/25 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  }`}
                />
              </div>
              <FieldError message={errors.username?.message} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/75 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all ${
                    errors.password
                      ? "bg-[#c8102e]/10 border border-[#c8102e]/50 focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.12)]"
                      : "bg-white/[0.05] border border-white/[0.08] focus:border-white/25 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "0.5rem", paddingBottom: "3rem" }}>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center border border-2 border-white/20 justify-center gap-2.5 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                style={{
                  padding: "0.875rem 1.5rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  color: "white",
                  background: isPending
                    ? "#8a99b8"
                    : "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)",
                  boxShadow: isPending
                    ? "none"
                    : "0 4px 20px rgba(15,34,68,0.25)",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"  />
                  </>
                )}
              </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}