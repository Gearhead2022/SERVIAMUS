import { PrescriptionValues } from "@/schemas/consultation.schema";

export function mapPrescriptionToPrisma(
    data: PrescriptionValues,
    patientId: number,
    consultId: number,
    doctorId: number
) {
    return {
        // ─── IDENTIFIERS ───────────────────
        consultation_id: consultId,
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

            form:
                medicine.form ?? "",

            dose:
                medicine.dose ?? "",

            frequency:
                medicine.frequency ?? "",

            route:
                medicine.route ?? "",

            duration:
                medicine.duration ?? "",

            quantity:
                medicine.quantity ?? "",

            instruction:
                medicine.instruction ?? "",
        })),
    };
}