"use client";

import { DynamicServicePage } from "../../../../src/screens/services/dynamic/DynamicServicePage";

export default function Page({ params }: { params: { id: string } }) {
  return <DynamicServicePage serviceId={params.id} />;
}
