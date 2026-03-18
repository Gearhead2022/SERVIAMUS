"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import SidebarMenu from "@/app/components/SidebarMenu";
import Header from "@/app/components/Header";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAuthReady} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      // router.replace("/");
      router.replace("/pages/admin/register");
    }
  }, [isAuthenticated, isAuthReady, router]);

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

 return (
  <div className="flex h-screen bg-[#fff] overflow-hidden">
    <SidebarMenu />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-[#daedea]">
        {children}
      </main>
    </div>
  </div>
);
}
