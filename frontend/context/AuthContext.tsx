"use client";

import {
  createContext,
  useContext,
  useState
} from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  user_id: number;
  roles: string[];
  username: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });

  const [isAuthReady] = useState(true);

  const login = (token: string, user: AuthUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    setIsAuthenticated(true);

    const admin_user = user.roles.includes('ADMIN');
    const doctor_user = user.roles.includes('DOCTOR');
    const laboratory_user = user.roles.includes('LAB') || user.roles.includes('LABORATORY');
    const staff_user = user.roles.includes('STAFF');
    const cashier_user = user.roles.includes('CASHIER');

    if (admin_user) {
      router.replace("/dashboard"); 
    }

    if (doctor_user) {
      router.replace("/docDashboard");
    }

    if (laboratory_user) {
      router.replace("/labdashboard");
    }

    if (staff_user) {
      router.replace("/registration");
    }

    if (cashier_user) {
      router.replace("/billing");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    router.replace("/");

    console.log('logout')
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
