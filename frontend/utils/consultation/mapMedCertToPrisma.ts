import { todayPH } from "../Date";
import { MedCertFormValues } from "@/schemas/consultation.schema";

export function mapMedCertToPrisma(
    form: MedCertFormValues,
    patient_id: number,
    doctorId: number,
) {
    return {
        mcr_id: form.mcr_id ?? 0,
        purpose: form?.purpose ?? '',
        physician: doctorId ?? 0,
        patient_id: patient_id ?? 0,
        result_date: todayPH(),
        recommendation: form.recommendation ?? '',
        impression: form.impression ?? '',
    };
}