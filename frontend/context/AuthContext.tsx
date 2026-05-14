"use client";

import {
  createContext,
  useContext,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types/AuthTypes";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Safe user parsing (FIXED ERROR HERE)
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("user");

    try {
      if (!storedUser || storedUser === "undefined") return null;
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Auth based on user existence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("user");
  });

  const [isAuthReady] = useState(true);

  // CLEAN login (NO TOKEN)
  const login = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    setIsAuthenticated(true);

    const normalizedRoles = user.roles.map((role) => role.trim().toUpperCase());

    // Clean role routing (no duplicates, first match wins)
    if (normalizedRoles.includes("ADMIN")) return router.replace("/dashboard");
    if (normalizedRoles.includes("DOCTOR")) return router.replace("/docDashboard");
    if (normalizedRoles.includes("LAB") || normalizedRoles.includes("LABORATORY")) {
      return router.replace("/labdashboard");
    }
    if (normalizedRoles.includes("STAFF")) return router.replace("/registration");
    if (normalizedRoles.includes("CASHIER")) return router.replace("/billing");

    // fallback
    router.replace("/");
  };

  const logout = async () => {
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    try {
      //  Clear backend cookie
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_LAN_URL}/authentication/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthReady,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
