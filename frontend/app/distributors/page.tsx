"use client";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { DistributorsPage } from "../../src/screens/distributors/DistributorsPage";

export default function DistributorsRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DistributorsPage />
    </ProtectedRoute>
  );
}
