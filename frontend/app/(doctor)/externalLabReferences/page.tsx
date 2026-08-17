"use client";

import ExternalLabResultWorklist from "@/components/Doctor/ExternalLabResultWorklist";
import RoleGuard from "@/guards/RoleGuard";

export default function ExternalLabReferencesPage() {
  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>
      <main className="min-h-full bg-[#daedea] p-5 md:p-7">
        <ExternalLabResultWorklist />
      </main>
    </RoleGuard>
  );
}
