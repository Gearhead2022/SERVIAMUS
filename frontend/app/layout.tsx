// app/layout.tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

import ClientProviders from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/context/AuthContext";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCLMS SYSTEM",
  description: "Main layout",
  icons: "/images/serviamus.jpeg",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ClientProviders>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
