"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SidebarMenu from "@/components/SidebarMenu";
import Header from "@/components/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthReady, router]);

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fff]">
      <SidebarMenu />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#daedea]">
          {children}
        </main>
      </div>
    </div>
  );
}
