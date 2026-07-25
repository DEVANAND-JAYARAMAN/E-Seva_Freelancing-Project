"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { PaymentsPage } from "../../src/screens/PaymentsPage";

export default function PaymentsRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PaymentsPage />
    </ProtectedRoute>
  );
}
