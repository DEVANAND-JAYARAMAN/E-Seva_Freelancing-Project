"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "retailer" | "distributor" | "customer";
  walletBalance: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    token: string,
    role?: "admin" | "retailer" | "distributor" | "customer",
    name?: string,
  ) => Promise<void>;
  logout: () => void;
  updateWallet: (newBalance: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial check of local auth state on mount
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (
      email: string,
      token: string,
      role?: "admin" | "retailer" | "distributor" | "customer",
      name?: string,
    ) => {
      setIsLoading(true);
      
      try {
        if (token === "mock_token") {
          const realUser: User = {
            id: `local-mock-${Date.now()}`,
            name: name || "Local User",
            email: email,
            role: role || "retailer",
            walletBalance: 0,
          };
          localStorage.setItem("token", "mock_local_token_123");
          localStorage.setItem("user", JSON.stringify(realUser));
          setUser(realUser);
          return;
        }

        const apiUrl = `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/(?:\/api|\/)+$/, "")}/api`;
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password: token }),
        });

        if (!res.ok) {
          let errorMsg = "Login failed";
          if (res.status === 502 || res.status === 504 || res.status === 503) {
            errorMsg = "Server is currently offline. Please navigate to /admin to start the server.";
          } else {
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch (e) {
              errorMsg = `Server error: ${res.status} ${res.statusText}`;
            }
          }
          throw new Error(errorMsg);
        }

        const data = await res.json();

        const realUser: User = {
          id: data.user.id,
          name: data.user.fullName,
          email: data.user.email,
          role: data.role,
          walletBalance: 0,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(realUser));
        setUser(realUser);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateWallet = useCallback((newBalance: number) => {
    setUser((prevUser) => {
      if (prevUser) {
        const updatedUser = { ...prevUser, walletBalance: newBalance };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  }, []);

  const authContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateWallet,
    }),
    [user, isLoading, login, logout, updateWallet],
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
