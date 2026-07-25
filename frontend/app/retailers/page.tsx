"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { RetailersPage } from "../../src/screens/retailers/RetailersPage";

export default function RetailersRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <RetailersPage />
    </ProtectedRoute>
  );
}
