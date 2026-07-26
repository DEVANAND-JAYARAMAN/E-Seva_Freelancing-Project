"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { PartnersPage } from "../../src/screens/dashboard/PartnersOverview";

export default function PartnersRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PartnersPage />
    </ProtectedRoute>
  );
}
