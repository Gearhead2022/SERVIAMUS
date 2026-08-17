"use client";

import {
  createContext,
  useContext,
  useEffect,
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

  // Read browser-only state after hydration so the server and the browser's
  // first render produce the same markup.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    try {
      const parsedUser =
        storedUser && storedUser !== "undefined"
          ? (JSON.parse(storedUser) as AuthUser)
          : null;

      setUser(parsedUser);
      setIsAuthenticated(Boolean(parsedUser));
    } catch {
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  // CLEAN login (NO TOKEN)
  const login = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    setIsAuthenticated(true);

    const normalizedRoles = user.roles.map((role) => role.trim().toUpperCase());

    // Clean role routing (no duplicates, first match wins)
    if (normalizedRoles.includes("ADMIN")) return router.replace("/dashboard");
    if (normalizedRoles.includes("ENCODER")) return router.replace("/encoding");
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
