"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
    name?: string
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

  const login = async (
    email: string,
    token: string,
    role?: "admin" | "retailer" | "distributor" | "customer",
    name?: string
  ) => {
    setIsLoading(true);
    try {
      const userData: User = {
        id: "",
        name: name || email,
        email,
        role: role || "retailer",
        walletBalance: 0,
      };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateWallet = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: newBalance };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateWallet,
      }}
    >
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
