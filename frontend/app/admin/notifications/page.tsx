"use client";

import { ProtectedRoute } from "../../../src/routes/ProtectedRoute";
import { AdminNotificationsPage } from "../../../src/screens/admin/AdminNotificationsPage";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminNotificationsPage />
    </ProtectedRoute>
  );
}
