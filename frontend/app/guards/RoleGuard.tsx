"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  children
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      // router.replace("/pages/admin/register");
      return;
    }

    const hasAccess = user?.roles.some((role : string) =>
      allowedRoles.includes(role)
    );

    if (!hasAccess) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  return <>{children}</>;
}
