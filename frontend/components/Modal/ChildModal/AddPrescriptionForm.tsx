"use client";

import {
    Plus, Trash2, Pill, Printer, AlertCircle
} from "lucide-react";
import { useEffect } from "react";
import { PatientProps } from "@/types/PatientTypes";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useForm, UseFormRegister, useFieldArray, FieldErrors, Controller, Control, FieldArrayWithId } from "react-hook-form";
import { PrescriptionValues, prescriptionSchema } from "@/schemas/consultation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConsultationById, usePrescription } from "@/hooks/Consultation/useConsultation";
import { PrescriptionProps } from "@/types/ConsultationTypes";

interface MedicineEntry {
    presc_id: string;
    medicine_name: string;
    strength: string;
    form: string;
    dose: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
    quantity: string;
}

interface PrescriptionModalProps {
    patient: PatientProps | undefined;
    consult_id: number,
    onClose: () => void;
    doctor?: { id: number; name: string; title?: string; licenseNo?: string; ptrNo?: string };
}

//   CONSTANTS
const FORMS = ["Tablet", "Capsule", "Syrup/Suspension", "Drops", "Cream/Ointment", "Patch", "Injection", "Inhaler", "Suppository"];
const ROUTES = ["Oral", "Topical", "Sublingual", "Intravenous", "Intramuscular", "Subcutaneous", "Rectal", "Ophthalmic", "Otic", "Nasal"];
const FREQS = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 6 hours", "Every 8 hours", "Every 12 hours", "As needed (PRN)", "Before meals", "After meals", "At bedtime", "Once weekly"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months", "Continuous", "Until finished"];

const EMPTY_MED = (): MedicineEntry => ({
    presc_id: Math.random().toString(36).slice(2),
    medicine_name: "", strength: "", form: "Tablet", dose: "1 tablet",
    frequency: "Twice daily", duration: "7 days", route: "Oral",
    instructions: "", quantity: "",
});

//   SMALL HELPERS
const labelCls = "block text-[10.5px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className={labelCls}>{label}</label>
            {children}
        </div>
    );
}

//  MEDICINE CARD
function MedicineCard({
    register,
    index,
    errors,
    isOnly,
    onRemove,
    control,
}: {
    register: UseFormRegister<PrescriptionValues>;
    index: number;
    errors: FieldErrors<PrescriptionValues>;
    isOnly: boolean;
    onRemove: () => void;
    med: FieldArrayWithId<PrescriptionValues>;
    control: Control<PrescriptionValues>
}) {
    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #dce3ef", background: "white" }}>

            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3"
                style={{ background: "#f4f6fb", borderBottom: "1px solid #dce3ef" }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#0f2244" }}>
                        <Pill size={13} style={{ color: "white" }} />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "#0f2244" }}>
                        Rx {index + 1}
                    </span>
                    {/* {med.name && (
                        <span className="text-[12px] font-semibold" style={{ color: "#6b7da0" }}>
                            — {med.name} {med.strength}
                        </span>
                    )} */}
                </div>
                {!isOnly && (
                    <button type="button" onClick={() => onRemove()}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#fdf0f2]"
                        style={{ color: "#c8102e" }}>
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            <div className="p-5 space-y-4">
                {/* Row 1: Name + Strength + Form */}
                <div className="grid grid-cols-12 gap-3">
                    <Field label="Medicine / Generic NameMedicine / Generic Name" className="col-span-5">
                        <Input
                            className="col-span-5"
                            type="text"
                            placeholder="e.g. Amoxicillin, Metformin"
                            {...register(`medicines.${index}.medicine_name`)}
                            error={errors?.medicines?.[index]?.medicine_name?.message}
                        />
                    </Field>
                    <Field label="Strength" className="col-span-3">
                        <Input
                            className="col-span-3"
                            type="text"
                            placeholder="e.g. 500mg"
                            {...register(`medicines.${index}.strength`)}
                            error={errors?.medicines?.[index]?.strength?.message}
                        />
                    </Field>
                    <Field label="Dosage Form" className="col-span-4">
                        <Controller
                            control={control}
                            name={`medicines.${index}.form`}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={errors?.medicines?.[index]?.form?.message}
                                >
                                    <option value="">— Select —</option>
                                    {FORMS.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Field>
                </div>

                {/* Row 2: Dose + Frequency + Route */}
                <div className="grid grid-cols-12 gap-3">
                    <Field label="Dose / Quantity per Take" className="col-span-4">
                        <Input
                            className="col-span-3"
                            type="text"
                            placeholder="e.g. 1 tablet, 5ml"
                            {...register(`medicines.${index}.dose`)}
                            error={errors?.medicines?.[index]?.dose?.message}
                        />
                    </Field>
                    <Field label="Frequency" className="col-span-4">
                        <Controller
                            control={control}
                            name={`medicines.${index}.frequency`}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={errors?.medicines?.[index]?.frequency?.message}
                                >
                                    <option value="">— Select —</option>
                                    {FREQS.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Field>
                    <Field label="Route" className="col-span-4">
                        <Controller
                            control={control}
                            name={`medicines.${index}.route`}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={errors?.medicines?.[index]?.route?.message}
                                >
                                    <option value="">— Select —</option>
                                    {ROUTES.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Field>
                </div>

                {/* Row 3: Duration + Total Qty */}
                <div className="grid grid-cols-12 gap-3">
                    <Field label="Duration" className="col-span-4">
                        <Controller
                            control={control}
                            name={`medicines.${index}.duration`}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    error={errors?.medicines?.[index]?.duration?.message}
                                >
                                    <option value="">— Select —</option>
                                    {DURATIONS.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Field>
                    <Field label="Total Quantity Dispensed" className="col-span-4">
                        <Input
                            className="col-span-4"
                            type="text"
                            placeholder="e.g. 14 tablets, 1 bottle"
                            {...register(`medicines.${index}.quantity`)}
                            error={errors?.medicines?.[index]?.quantity?.message}
                        />
                    </Field>
                    <Field label="Special Instructions" className="col-span-12 mt-0">
                        <Input
                            className="col-span-4"
                            type="text"
                            placeholder="e.g. Take after meals, avoid alcohol, take with full glass of water"
                            {...register(`medicines.${index}.instruction`)}
                            error={errors?.medicines?.[index]?.instruction?.message}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );
}

export default function PrescriptionModal({ patient, consult_id, onClose, doctor = { id: 1, name: "Dr. Maria Santos", title: "General Practitioner", licenseNo: "—", ptrNo: "—" },
}: PrescriptionModalProps) {

    const { mutateAsync: prescription, isPending } = usePrescription(onClose);
    const { data: consultationRecord } = useConsultationById(consult_id);

    const rxDate = new Date().toLocaleDateString("en-PH", {
        month: "long", day: "numeric", year: "numeric",
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PrescriptionValues>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            patient_id: patient?.patient_id ?? 0,
            gen_notes: "",
            medicines: [EMPTY_MED()],
            cons_id: 0,
            doctor_id: doctor.id
        },
    });

    useEffect(() => {
        if (!consultationRecord) return;

        reset((prev) => ({
            ...prev,
            cons_id: consultationRecord.consultation_id,
        }));
    }, [consultationRecord, reset]);

    console.log('error', errors)

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medicines",
    });

    const onSubmit = async (data: PrescriptionValues) => {
        const payload: PrescriptionProps = {
            cons_id: consultationRecord?.consultation_id ?? 0,
            patient_id: patient?.patient_id ?? data.patient_id,
            doctor_id: doctor.id,
            gen_notes: data.gen_notes,

            medicines: data.medicines.map((m) => ({
                medicine_name: m.medicine_name,
                strength: m.strength,

                form: m.form,
                dose: m.dose,
                frequency: m.frequency,
                route: m.route,
                duration: m.duration,

                quantity: m.quantity,
                instruction: m.instruction,
            })),
        };

        await prescription(payload);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div
                    className="relative flex flex-col bg-white rounded-2xl w-full overflow-hidden font-['DM_Sans']"
                    style={{
                        boxShadow: "0 24px 80px rgba(15,34,68,0.28)",
                    }}
                >
                    <div className="flex-shrink-0 flex items-center justify-between px-7 py-3 flex-wrap gap-2"
                        style={{ background: "#f7f8fc", borderBottom: "1px solid #dce3ef" }}>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>Prescribing Physician</p>
                                <p className="text-sm font-bold" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>{doctor.name}</p>
                                {doctor.title && <p className="text-[11px]" style={{ color: "#6b7da0" }}>{doctor.title}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                            {doctor.licenseNo && (
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>License No.</p>
                                    <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{doctor.licenseNo}</p>
                                </div>
                            )}
                            {doctor.ptrNo && (
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>PTR No.</p>
                                    <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{doctor.ptrNo}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#8a99b8" }}>Date</p>
                                <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{rxDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4"
                        style={{ background: "#f4f6fb" }}>

                        {/* Diagnosis note */}
                        <div
                            className="bg-white rounded-2xl p-5"
                            style={{
                                border: "1.5px solid #dce3ef",
                                boxShadow: "0 1px 4px rgba(15,34,68,0.05)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ background: "#eef1f9" }}
                                >
                                    <AlertCircle size={12} style={{ color: "#0f2244" }} />
                                </div>

                                <p
                                    className="text-[11px] font-bold uppercase tracking-wider"
                                    style={{ color: "#0f2244" }}
                                >
                                    Patient Information
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-[10px] text-[#8a99b8] uppercase">Name</p>
                                    <p className="font-semibold text-[#1a2a45]">
                                        {patient?.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-[#8a99b8] uppercase">Patient Code</p>
                                    <p className="font-semibold text-[#1a2a45]">
                                        {patient?.patient_code}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-[#8a99b8] uppercase">Sex</p>
                                    <p className="font-semibold text-[#1a2a45]">
                                        {patient?.sex}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-[#8a99b8] uppercase">Age</p>
                                    <p className="font-semibold text-[#1a2a45]">
                                        {patient?.age}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Medicine cards */}
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <MedicineCard
                                    key={field.id}
                                    register={register}
                                    control={control}
                                    index={index}
                                    errors={errors}
                                    isOnly={fields.length === 1}
                                    onRemove={() => remove(index)}
                                    med={field}
                                />
                            ))}
                        </div>

                        {/* Add medicine button */}
                        <button
                            type="button"
                            onClick={() => append(EMPTY_MED())}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                            style={{
                                background: "white",
                                border: "1.5px dashed #c0ccd8",
                                color: "#6b7da0",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "#0f2244";
                                (e.currentTarget as HTMLButtonElement).style.color = "#0f2244";
                                (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "#c0ccd8";
                                (e.currentTarget as HTMLButtonElement).style.color = "#6b7da0";
                                (e.currentTarget as HTMLButtonElement).style.background = "white";
                            }}
                        >
                            <Plus size={15} />
                            Add Another Medicine
                        </button>

                        {/* General notes */}
                        <div className="bg-white rounded-2xl p-5"
                            style={{ border: "1.5px solid #dce3ef", boxShadow: "0 1px 4px rgba(15,34,68,0.05)" }}>
                            <Textarea
                                label="General Notes / Precautions to Patient"
                                rows={3}
                                placeholder="e.g. Avoid driving while on this medication. Complete the full course. Return to clinic if symptoms persist or worsen. Keep out of reach of children."
                                {...register(`gen_notes`)}
                                error={errors?.gen_notes?.message}
                            />
                        </div>

                        {/* Refill note */}
                        <div className="rounded-xl px-4 py-3 flex items-center gap-2.5"
                            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <AlertCircle size={13} className="flex-shrink-0" style={{ color: "#d97706" }} />
                            <p className="text-[11.5px]" style={{ color: "#92400e" }}>
                                <strong>No Refill</strong> unless a new prescription is issued by the prescribing physician.
                            </p>
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center justify-between px-7 py-4 gap-4 flex-wrap"
                        style={{ borderTop: "1px solid #dce3ef", background: "#f7f8fc" }}>

                        {/* <p className="text-[11px]" style={{ color: "#8a99b8" }}>
                    {medicines.filter((m) => m.name).length} medicine(s) listed
                </p> */}

                        <div className="flex items-center gap-2.5">
                            <button type="button" onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                style={{ color: "#6b7da0", border: "1.5px solid #dce3ef", background: "white" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0f2244"; (e.currentTarget as HTMLButtonElement).style.color = "#0f2244"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#dce3ef"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7da0"; }}>
                                Cancel
                            </button>
                            <button type="button"
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: "#f0f3fa", color: "#0f2244",
                                    border: "1.5px solid #dce3ef",
                                }}>
                                <Printer size={14} /> Print Preview
                            </button>
                            <button
                                type="submit"

                                // disabled={medicines.filter((m) => m.name.trim()).length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-900 hover:bg-red-700 text-sm font-semibold text-white transition-all">
                                <Pill size={14} />
                                Issue Prescription
                            </button>
                        </div>
                    </div>
                </div>
            </form></>
    );
}