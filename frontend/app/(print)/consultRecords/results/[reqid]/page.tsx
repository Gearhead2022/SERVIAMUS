"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import RoleGuard from "@/guards/RoleGuard";
import ConsultResultDocument from "@/components/Modal/NestedModal/ModalPreview/MedicalFormPreview";
import Button from "@/components/ui/Button";

import { useConsultationPrint, useConsultationRxPrint, useFollowupPrint, useMedicalCertificatePrint } from "@/hooks/Consultation/useConsultation";
import { getApiErrorMessage } from "@/utils/api-error";
import SweetAlert from "@/utils/SweetAlert";

import {
    downloadConsultationResultPdf,
    getConsultationResultPdfFileName,
} from "@/utils/consultation/consultPDF";

function PrintPageSkeleton() {
    return (
        <div className="animate-pulse rounded-[28px] border border-[#c8e4de] bg-white p-6 shadow-sm">
            <div className="mx-auto max-w-[8in] space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                    <div className="h-14 w-14 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                        <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[52px] rounded-2xl border border-slate-200 bg-slate-50"
                        />
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="h-3 w-32 rounded-full bg-slate-200" />
                    <div className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
                </div>

                <div className="space-y-3">
                    <div className="h-3 w-40 rounded-full bg-slate-200" />
                    <div className="h-32 rounded-2xl border border-slate-200 bg-slate-50" />
                </div>
            </div>
        </div>
    );
}

const getPdfErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim()) {
        return `${fallback} (${error.message})`;
    }
    return fallback;
};

export default function ConsultationResultPrintPage() {
    const params = useParams<{ reqid: string }>();
    const searchParams = useSearchParams();

    const reqid = Number(params.reqid);
    const doctorId = Number(searchParams.get("doctorId"));
    const patientName = searchParams.get("patientName") ?? '';
    const type =
        (searchParams.get("type") as "consult-result" | "prescription" | "med-cert" | "followup-result") ??
        "consult-result";

    const template =
        (searchParams.get("template") as "temp-1" | "default") ??
        "default";

    const { data: consultationData, error: consultationError, isLoading: consultationLoading } = useConsultationPrint(reqid);
    const { data: prescriptionData, error: prescriptionError, isLoading: prescriptionLoading } = useConsultationRxPrint(reqid);
    const { data: medicalCertificateData, error: medCertError, isLoading: medCertLoading } = useMedicalCertificatePrint(reqid);
    const { data: followupData, error: followupError, isLoading: followupLoading } = useFollowupPrint(reqid);

    const documentRef = useRef<HTMLDivElement | null>(null);

    const hasAutoTriggeredPrint = useRef(false);
    const hasAutoDownloaded = useRef(false);
    const shouldCloseAfterPrint = useRef(false);

    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    console.log("PRINT FORM", prescriptionData);

    const printConfigs = {
        "consult-result": {
            data: consultationData,
            loading: consultationLoading,
            error: consultationError,
            fileName: consultationData
                ? getConsultationResultPdfFileName('consult-result', consultationData, patientName)
                : "consultation-result.pdf",
        },

        "prescription": {
            data: prescriptionData,
            loading: prescriptionLoading,
            error: prescriptionError,
            fileName: prescriptionData
                ? getConsultationResultPdfFileName('prescription', prescriptionData, patientName)
                : "prescription.pdf",
        },

        "med-cert": {
            data: medicalCertificateData,
            loading: medCertLoading,
            error: medCertError,
            fileName: medicalCertificateData
                ? getConsultationResultPdfFileName('med-cert', medicalCertificateData, patientName)
                : "medical-certificate.pdf",
        },

        "followup-result": {
            data: followupData,
            loading: followupLoading,
            error: followupError,
            fileName: followupData
                ? getConsultationResultPdfFileName('followup-result', followupData, patientName)
                : "medical-followup.pdf",
        },
    } as const;

    const currentPrint = printConfigs[type];

    useEffect(() => {
        const handleAfterPrint = () => {
            setIsPrinting(false);

            if (shouldCloseAfterPrint.current) {
                shouldCloseAfterPrint.current = false;
                // window.close();
            }
        };

        window.addEventListener("afterprint", handleAfterPrint);

        return () => window.removeEventListener("afterprint", handleAfterPrint);
    }, []);

    const handleDownloadPdf = useCallback(async () => {
        if (!currentPrint.data || !documentRef.current) {
            SweetAlert.errorAlert(
                "Download Failed",
                "The printable consultation result is not ready yet."
            );
            return;
        }

        try {
            setIsDownloadingPdf(true);

            await downloadConsultationResultPdf({
                element: documentRef.current,
                fileName: currentPrint.fileName,
                type
            });
        } catch (error) {
            console.error("Consultation PDF download failed.", error);

            SweetAlert.errorAlert(
                "Download Failed",
                getPdfErrorMessage(
                    error,
                    "Unable to create the consultation PDF. Please try again."
                )
            );
        } finally {
            setIsDownloadingPdf(false);
        }
    }, [currentPrint, type]);

    const handlePrintPage = useCallback(
        (closeAfterPrint = false) => {
            if (!currentPrint.data || !documentRef.current) {
                SweetAlert.errorAlert(
                    "Print Failed",
                    "The printable consultation result is not ready yet."
                );
                return;
            }

            shouldCloseAfterPrint.current = closeAfterPrint;

            setIsPrinting(true);

            window.requestAnimationFrame(() => {
                window.print();
            });
        },
        [currentPrint]
    );

    useEffect(() => {
        if (
            !currentPrint.data ||
            !documentRef.current ||
            searchParams.get("download") !== "1" ||
            hasAutoDownloaded.current ||
            isDownloadingPdf ||
            isPrinting
        ) {
            return;
        }

        hasAutoDownloaded.current = true;

        const timer = window.setTimeout(() => {
            void handleDownloadPdf();
        }, 450);

        return () => window.clearTimeout(timer);
    }, [
        handleDownloadPdf,
        isDownloadingPdf,
        isPrinting,
        currentPrint.data,
        searchParams,
    ]);

    useEffect(() => {
        if (
            !currentPrint.data ||
            !documentRef.current ||
            searchParams.get("autoprint") !== "1" ||
            hasAutoTriggeredPrint.current ||
            isDownloadingPdf ||
            isPrinting
        ) {
            return;
        }

        hasAutoTriggeredPrint.current = true;

        const timer = window.setTimeout(() => {
            handlePrintPage(true);
        }, 450);

        return () => window.clearTimeout(timer);
    }, [
        handlePrintPage,
        isDownloadingPdf,
        isPrinting,
        currentPrint.data,
        searchParams,
    ]);

    return (
        <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "CONSULTATION"]}>
            <div className="min-h-screen bg-[#eef4f3] px-4 py-6 print:bg-white print:px-0 print:py-0">
                <div className="mx-auto max-w-5xl space-y-4">

                    {/* HEADER */}
                    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b7c76]">
                                Consultation Print View
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-[#133d37]">
                                Print Consultation Result
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => window.close()}
                            >
                                Go Back
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleDownloadPdf}
                                disabled={isDownloadingPdf || isPrinting}
                            >
                                {isDownloadingPdf ? "Downloading PDF..." : "Download PDF"}
                            </Button>

                            <Button
                                type="button"
                                onClick={() => handlePrintPage()}
                                disabled={isDownloadingPdf || isPrinting}
                            >
                                {isPrinting ? "Opening Print..." : "Print Result"}
                            </Button>
                        </div>
                    </div>

                    {/* BODY */}
                    {currentPrint.loading ? (
                        <PrintPageSkeleton />
                    ) : currentPrint.error ? (
                        <div className="rounded-3xl border border-[#f0c6c0] bg-white px-6 py-10 text-center text-sm text-[#9a4f45]">
                            {getApiErrorMessage(
                                currentPrint.error,
                                "Unable to load the printable consultation result."
                            )}
                        </div>
                    ) : type === "prescription" ? (
                        prescriptionData ? (
                            <div ref={documentRef}>
                                <ConsultResultDocument
                                    type="prescription"
                                    form={prescriptionData}
                                    doctorId={doctorId}
                                    template={template}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
                                No prescription record found.
                            </div>
                        )
                    ) : type === "med-cert" ? (
                        medicalCertificateData ? (
                            <div ref={documentRef}>
                                <ConsultResultDocument
                                    type="med-cert"
                                    form={medicalCertificateData}
                                    doctorId={doctorId}
                                    template={template}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
                                No prescription record found.
                            </div>
                        )
                    ) : type === "consult-result" ? (
                        consultationData ? (
                            <div ref={documentRef}>
                                <ConsultResultDocument
                                    type={type}
                                    form={consultationData}
                                    doctorId={doctorId}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
                                No consultation record found.
                            </div>
                        )
                    ) : type === "followup-result" ? (
                        followupData ? (
                            <div ref={documentRef}>
                                <ConsultResultDocument
                                    type={'followup-result'}
                                    form={followupData}
                                    doctorId={doctorId}
                                    isSaved={true}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
                                No follow up record found.
                            </div>
                        )
                    ) : (
                        <div className="rounded-3xl border border-[#c8e4de] bg-white px-6 py-10 text-center text-sm text-[#5f8a83]">
                            No follow up record found.
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}