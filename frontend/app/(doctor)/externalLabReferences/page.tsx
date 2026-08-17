"use client";

import ExternalLabAttachmentWorkspace from "@/components/Modal/LabModal/ExternalLabAttachmentWorkspace";
import RoleGuard from "@/guards/RoleGuard";

export default function ExternalLabReferencesPage() {
  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>
      <main className="min-h-full bg-[#daedea] p-5 md:p-7">
        <ExternalLabAttachmentWorkspace
          description="Locate a patient to view supporting results that were produced by another laboratory. These files are references only and are separate from in-clinic result encoding."
          title="External laboratory references"
        />
      </main>
    </RoleGuard>
  );
}
