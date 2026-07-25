"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { DailyPaymentsPage } from "../../src/screens/payments/DailyPaymentsPage";

/** Alias matching reference site path /onlinepayment */
export default function OnlinePaymentRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DailyPaymentsPage />
    </ProtectedRoute>
  );
}
