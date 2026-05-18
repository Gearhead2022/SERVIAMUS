import { MedCertRequestProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { todayPH } from "../Date";

export function normalizeMedCertDefaults(
    mcrId: number,
    patient?: PatientProps,
    requestEntry?: MedCertRequestProps,
) {
    return {
        mcr_id: mcrId ?? 0,
        purpose: requestEntry?.purpose ?? '',
        physician: requestEntry?.physician ?? 0,
        patient_id: patient?.patient_id ?? 0,
        result_date: todayPH(),
    };
}