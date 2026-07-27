"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  apiUrl,
  authFetch,
  clearAuthSession,
  getAuthToken,
  getAuthUserRaw,
  setAuthSession,
  setAuthUserRaw,
} from "../../utils/apiBase";

export type UserRole = "admin" | "retailer" | "distributor" | "customer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletBalance: number;
  phone?: string;
};

/** Normalize API / storage roles. Unknown → retailer (never admin). */
export function normalizeRole(role: unknown): UserRole {
  const r = String(role ?? "")
    .toLowerCase()
    .trim();
  if (
    r === "admin" ||
    r === "retailer" ||
    r === "distributor" ||
    r === "customer"
  ) {
    return r;
  }
  return "retailer";
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    token: string,
    role?: UserRole,
    name?: string,
  ) => Promise<void>;
  logout: () => void;
  updateWallet: (newBalance: number) => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseStoredUser(raw: string): User | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      id: String(parsed.id || ""),
      name: String(parsed.name || ""),
      email: String(parsed.email || ""),
      role: normalizeRole(parsed.role),
      walletBalance: Number(parsed.walletBalance || 0),
      phone: parsed.phone ? String(parsed.phone) : undefined,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always remove old persistent login (browser close used to keep these)
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {
          /* ignore */
        }

        const storedToken = getAuthToken();
        const storedUser = getAuthUserRaw();

        const host =
          typeof window !== "undefined" ? window.location.hostname : "";
        const isLocal = host === "localhost" || host === "127.0.0.1";
        if (
          !isLocal &&
          storedToken &&
          (storedToken === "mock_local_token_123" ||
            storedToken === "mock_token" ||
            !storedToken.includes("."))
        ) {
          clearAuthSession();
          setUser(null);
          return;
        }

        if (storedToken && storedUser) {
          const parsed = parseStoredUser(storedUser);
          if (parsed) {
            setAuthUserRaw(JSON.stringify(parsed));
            setUser(parsed);
          } else {
            clearAuthSession();
          }
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
      role?: UserRole,
      name?: string,
    ) => {
      setIsLoading(true);

      try {
        if (token === "mock_token") {
          const realUser: User = {
            id: `local-mock-${Date.now()}`,
            name: name || "Local User",
            email: email,
            role: normalizeRole(role || "retailer"),
            walletBalance: 0,
          };
          setAuthSession("mock_local_token_123", JSON.stringify(realUser));
          setUser(realUser);
          return;
        }

        const res = await fetch(apiUrl("auth/login"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password: token }),
        });

        if (!res.ok) {
          let errorMsg = "Login failed";
          if (res.status === 502 || res.status === 504 || res.status === 503) {
            errorMsg =
              "Server is currently offline. Start the local backend (port 8080) or ask admin to start the server.";
          } else {
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch {
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
          role: normalizeRole(data.role),
          walletBalance: data.user.walletBalance || 0,
          phone: data.user.mobile || data.user.phone || undefined,
        };

        setAuthSession(data.token, JSON.stringify(realUser));
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
    clearAuthSession();
    setUser(null);
  }, []);

  const updateWallet = useCallback((newBalance: number) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      if (Number(prevUser.walletBalance) === Number(newBalance)) {
        return prevUser;
      }
      const updatedUser = { ...prevUser, walletBalance: newBalance };
      setAuthUserRaw(JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = userRef.current;
    if (!current?.id && !current?.email) return;
    try {
      if (current.role === "admin") {
        const res = await authFetch(apiUrl("admin/dashboard"));
        if (res.ok) {
          const data = await res.json();
          if (typeof data?.adminWalletBalance === "number") {
            updateWallet(Number(data.adminWalletBalance));
          }
        }
        return;
      }

      if (current.id) {
        const balRes = await authFetch(
          `${apiUrl("wallet/balance")}?userId=${encodeURIComponent(current.id)}`,
          { cache: "no-store" },
        );
        if (balRes.ok) {
          const balData = await balRes.json();
          if (typeof balData?.balance === "number") {
            updateWallet(Number(balData.balance));
            return;
          }
        }
      }

      const endpoint =
        current.role === "retailer" ? "retailers" : "distributors";
      const res = await authFetch(apiUrl(endpoint), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const me = (data || []).find(
          (u: any) =>
            (current.id &&
              (u.userId === current.id ||
                u.UserId === current.id ||
                u.id === current.id)) ||
            (current.email &&
              (u.email === current.email || u.Email === current.email)),
        );
        if (me) {
          const balance = me.walletBalance || me.WalletBalance || 0;
          updateWallet(Number(balance));
        }
      }
    } catch (e) {
      console.error("Failed to refresh profile:", e);
    }
  }, [updateWallet]);

  const authContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateWallet,
      refreshProfile,
    }),
    [user, isLoading, login, logout, updateWallet, refreshProfile],
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
