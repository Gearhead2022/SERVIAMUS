"use client";

import PatientDeletionRequestsPanel from "@/components/Admin/PatientDeletionRequestsPanel";
import RoleGuard from "@/guards/RoleGuard";

export default function PatientDeletionRequestsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <main className="min-h-full bg-[#eef2f7] p-5 md:p-7">
        <div className="mx-auto max-w-6xl space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Administration</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Patient record controls</h1>
          </div>
          <PatientDeletionRequestsPanel />
        </div>
      </main>
    </RoleGuard>
  );
}
