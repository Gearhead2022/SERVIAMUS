import { PrescriptionProps } from "@/types/ConsultationTypes";
import { PatientProps } from "@/types/PatientTypes";
import { PrescriptionValues } from "@/schemas/consultation.schema";

export function mapPrescriptionRecordToForm(
    prescription: PrescriptionProps,
    patient?: PatientProps
): PrescriptionValues {
    return {
        consultation_id: prescription.consultation_id,
        patient_id: patient?.patient_id ?? 0,
        followup_id: prescription.followup_id ?? null,
        doctor_id: prescription.doctor_id ?? 0,
        gen_notes: prescription.gen_notes ?? "",
        issued_date: prescription.issued_date ?? "",

        medicines: (prescription.medicines ?? []).map((m) => ({
            item_id: m.item_id,
            medicine_name: m.medicine_name ?? "",
            strength: m.strength ?? "",
            brand_name: m.brand_name ?? "",
            quantity: m.quantity ?? "",
            instruction: m.instruction ?? "",
        })),
    };
}