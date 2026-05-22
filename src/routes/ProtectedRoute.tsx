"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../store/context/AuthContext";
import { PATHS } from "./paths";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "retailer" | "distributor" | "customer">;
};

/**
 * Route protection guard that restricts access based on authentication status and roles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(PATHS.LOGIN);
    } else if (!isLoading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      // User is authenticated but doesn't have the required role
      router.replace(PATHS.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Loading state placeholder with premium design
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b13]">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#005c3a]/10 dark:border-emerald-500/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#005c3a] dark:border-t-emerald-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Securing Workspace...
        </p>
      </div>
    );
  }

  // Render children only when fully authenticated and authorized
  if (isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>;
  }

  return null;
}
