"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import ExternalLabRequestDocument from "@/components/Modal/LabModal/ExternalLabRequestDocument";
import Button from "@/components/ui/Button";
import RoleGuard from "@/guards/RoleGuard";
import { readExternalLabRequestPrintDraft } from "@/utils/lab-request-print";

export default function ExternalLabRequestPrintContent() {
    const searchParams = useSearchParams();
    const hasAutoTriggeredPrint = useRef(false);
    const draftId = searchParams.get("draft");
    const shouldAutoPrint = searchParams.get("autoprint") === "1";
    const draft = useSyncExternalStore(
        () => () => { },
        () => (draftId ? readExternalLabRequestPrintDraft(draftId) : null),
        () => undefined
    );

    useEffect(() => {
        if (!draft || !shouldAutoPrint || hasAutoTriggeredPrint.current) {
            return;
        }

        hasAutoTriggeredPrint.current = true;

        const printTimer = window.setTimeout(() => {
            window.print();
        }, 450);

        return () => window.clearTimeout(printTimer);
    }, [draft, shouldAutoPrint]);

    return (
        <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "STAFF"]}>
            <div className="min-h-screen bg-[#eef4f3] px-4 py-6 print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-5xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b7c76]">
                                Laboratory Print View
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-[#133d37]">
                                Print External Laboratory Request
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="secondary" onClick={() => window.close()}>
                                Go Back
                            </Button>
                            <Button type="button" onClick={() => window.print()} disabled={!draft}>
                                Print Request
                            </Button>
                        </div>
                    </div>

                    {draft ? (
                        <ExternalLabRequestDocument request={draft} />
                    ) : (
                        <div className="rounded-3xl border border-[#f0c6c0] bg-white px-6 py-10 text-center text-sm text-[#9a4f45]">
                            Unable to load the external laboratory request draft. Reopen the request form and try
                            again.
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
