"use client";

import Button from "@/components/ui/Button";
import MedicalFormPreview from "../NestedModal/ModalPreview/MedicalFormPreview";
import { RequestProps } from "@/types/ConsultationTypes";
import { MedCertFormValues, PrescriptionValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";

type Props = {
    request: RequestProps;
    form: RegisterConsultationFormValues | PrescriptionValues | MedCertFormValues;
    onBack: () => void;
    onDownloadPdf?: () => void;
    onOpenPrintPage: () => void;
    onDone?: () => void;
    backLabel?: string;
    showDoneButton?: boolean;
    onSubmitSuccess?: boolean;
    type: "consult-result" | "prescription" | "med-cert";
    doctorId: number;
};

export default function ConsultResultPreview({
    backLabel = "Back to Edit",
    form,
    onBack,
    onDownloadPdf,
    onDone,
    onOpenPrintPage,
    request,
    showDoneButton = true,
    onSubmitSuccess,
    type,
    doctorId,
}: Props) {

    const template =
        doctorId === 1
            ? "temp-1"
            : "default";

    return (
        <div className={`consult-print-sheet space-y-5 bg-slate-100 p-5 print:bg-white print:p-0 ${type === "med-cert" ? "page-b6" : "page-a4"}`}>
            <div className="rounded-2xl border border-[#d7e7e3] bg-white p-4 print:hidden">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f8a83]">
                            Result Preview
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#143a35]">
                            {request.patient.name} - {request.req_type}
                        </h3>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                                Request
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#173f39]">{request.req_id}</p>
                        </div>
                        <div className="rounded-xl bg-[#f4faf8] px-3 py-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#63867f]">
                                Patient Code
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#173f39]">{request.patient.patient_code ?? 'Unable to display'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <MedicalFormPreview type={type} form={form} doctorId={doctorId} template={template} />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 print:hidden">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onBack}>
                            {backLabel}
                        </Button>
                        {showDoneButton && onDone ? (
                            <Button type="button" variant="primary" onClick={onDone} disabled={onSubmitSuccess}>
                                Done
                            </Button>
                        ) : null}
                        {onDownloadPdf ? (
                            <Button type="button" variant="secondary" onClick={onDownloadPdf} disabled={!onSubmitSuccess}>
                                Download PDF
                            </Button>
                        ) : null}
                        <Button type="button" onClick={onOpenPrintPage} disabled={!onSubmitSuccess}>
                            Print Result
                        </Button>
                    </div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
    );
}
