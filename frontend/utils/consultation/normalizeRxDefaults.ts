import { PatientProps } from "@/types/PatientTypes";
import { PrescriptionValues } from "@/schemas/consultation.schema";
import {
    ConsultationProps,
    PrescriptionProps,
} from "@/types/ConsultationTypes";
import { RegisterPayload } from "@/types/AuthTypes";

const EMPTY_MED = () => ({
    medicine_name: "",
    strength: "",
    form: "",
    dose: "",
    frequency: "",
    route: "",
    duration: "",
    quantity: "",
    instruction: "",
});

export function normalizePrescriptionDefaults(
    patient?: PatientProps,
    prescription?: PrescriptionProps,
    consult?: ConsultationProps,
    doctor?: RegisterPayload
): PrescriptionValues {
    return {
        patient_id: patient?.patient_id ?? 0,
        consultation_id: consult?.consultation_id ?? 0,

        // IMPORTANT: DO NOT force doctor here
        doctor_id: doctor?.user_id ?? 0,

        gen_notes: prescription?.gen_notes ?? "",
        issued_date: new Date().toISOString() ?? "",

        medicines: prescription?.medicines?.length
            ? prescription.medicines.map(m => ({
                medicine_name: m.medicine_name ?? "",
                strength: m.strength ?? "",
                form: m.form ?? "",
                dose: m.dose ?? "",
                frequency: m.frequency ?? "",
                route: m.route ?? "",
                duration: m.duration ?? "",
                quantity: m.quantity ?? "",
                instruction: m.instruction ?? "",
            }))
            : [EMPTY_MED()],
    };
}