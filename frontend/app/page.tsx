"use client";

import { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLogin } from "./hooks/useLogin";
import { loginSchema } from "@/app/schemas/auth.schema";
import { z } from "zod";

/* =====================
   TYPES
===================== */
type LoginFormValues = z.infer<typeof loginSchema>;

export default function POSLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: mLogin, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit"
  });

  const onSubmit = async (data: LoginFormValues) => {
    await mLogin(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-700 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-xl font-bold text-white mb-2">Serviamus Laboratory & Clinic System</h1>
            <p className="text-white/100 text-sm">Sign in to your account</p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/80" />
                </div>
                <input
                  type="text"
                  {...register("username")}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/80" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-tr from-gray-400 via-gray-600 to-gray-700 text-white py-3 rounded-xl font-semibold ring-1 ring-white disabled:opacity-50"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/100 text-sm">
              Don&apos;t have an account?{" "}
              <span className="font-semibold">Contact Admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
