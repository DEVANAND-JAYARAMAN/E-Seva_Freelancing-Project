"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { BillingPage } from "../../src/screens/billing/BillingPage";

export default function BillingRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <BillingPage />
    </ProtectedRoute>
  );
}
