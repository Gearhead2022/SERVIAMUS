import { PrescriptionValues } from "@/schemas/consultation.schema";

export function mapPrescriptionToPrisma(
    data: PrescriptionValues,
    patientId: number,
    consultId: number,
    doctorId: number,
    followup_id: number | null,
) {
    return {
        // ─── IDENTIFIERS ───────────────────
        consultation_id: consultId,
        followup_id: followup_id ?? null,
        patient_id: patientId,
        doctor_id: doctorId,
        // ─── NOTES ─────────────────────────
        gen_notes: data.gen_notes ?? "",
        issued_date: data.issued_date ?? "",

        // ─── MEDICINES ─────────────────────
        medicines: data.medicines.map((medicine) => ({
            medicine_name:
                medicine.medicine_name ?? "",

            strength:
                medicine.strength ?? "",

            brand_name:
                medicine.brand_name ?? "",

            quantity:
                medicine.quantity ?? "",

            instruction:
                medicine.instruction ?? "",
        })),
    };
}