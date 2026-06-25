import { MedCertFormValues } from "@/schemas/consultation.schema";
import { PatientProps } from "@/types/PatientTypes";
import { MedicalCertificateProps } from "@/types/ConsultationTypes";

export function mapMedCertRecordToForm(
    cert: MedicalCertificateProps,
    patient?: PatientProps,
    mcr_id?: number,
): MedCertFormValues {
    return {
        mcr_id: mcr_id ?? 0,
        patient_id: patient?.patient_id ?? 0,
        result_date: cert.result_date,
        purpose: cert.purpose ?? "",
        physician: cert.physician,
        recommendation: cert.recommendation ?? "",
        impression: cert.impression ?? "",
    };
}