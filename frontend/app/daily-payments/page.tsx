"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { DailyPaymentsPage } from "../../src/screens/payments/DailyPaymentsPage";

export default function DailyPaymentsRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DailyPaymentsPage />
    </ProtectedRoute>
  );
}
