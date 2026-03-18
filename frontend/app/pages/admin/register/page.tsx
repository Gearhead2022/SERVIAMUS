"use client";

import { useState } from "react";
import { Lock, User, CircleUser, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { registerSchema } from "@/app/schemas/auth.schema";
import { useRegister } from "@/app/hooks/useRegister";
import { useAuthRoles } from "@/app/hooks/useAuthRoles";

/* =====================
   TYPES
===================== */
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function POSRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: registerUser, isPending } = useRegister();
  const { data: roles, isLoading: roleLoading } = useAuthRoles();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      role_id: 0
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser({
      name: data.name,
      username: data.username,
      password: data.password,
      role_id: data.role_id
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-700 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              POS System
            </h1>
            <p className="text-white/100 text-sm">
              Create a new account
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            noValidate
          >
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 block">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/80" />
                </div>
                <input
                  {...register("name")}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/60"
                  placeholder="Full name"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CircleUser className="h-5 w-5 text-white/80" />
                </div>
                <input
                  {...register("username")}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/60"
                  placeholder="Username"
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
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/60"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 text-white/60"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 block">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/60"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/80 block">
                Role
              </label>
              <select
                {...register("role_id", { valueAsNumber: true })}
                disabled={roleLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/60"
              >
                <option value={0}>Select role</option>
                {roles?.map(role => (
                  <option
                    key={role.role_id}
                    value={role.role_id}
                    className="bg-gray-800"
                  >
                    {role.role_name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-sm text-red-400">
                  {errors.role_id.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-3 bg-gradient-to-tr from-gray-400 via-gray-600 to-gray-700 text-white rounded-xl font-semibold ring-1 ring-white disabled:opacity-50"
              >
                {isPending ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
