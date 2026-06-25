"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { requestSchema } from "@/schemas/request.schema";
import { RequestProps, UsersProps, VitalSignProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useGetAllUsers, useUpdateRequest } from "@/hooks/Patient/usePatientRegistration";
import Label from "@/components/ui/label";
import { Stethoscope, Clock, User, MapPin, Calendar, Hash } from "lucide-react";
import { todayPH } from "@/utils/Date";

type RequestFormValues = z.infer<typeof requestSchema>;
type Consultation = Extract<RequestFormValues, { req_type: "CONSULTATION" }>;

// ── Shared helpers ────────────────────────────────────────────────────────

function SectionDivider({ label, teal = false }: { label: string; teal?: boolean }) {
    return (
        <div className="flex items-center gap-3 my-1">
            <span
                className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap"
                style={{ color: teal ? "#0e7c7b" : "#8a99b8" }}
            >
                {label}
            </span>
            <span
                className="flex-1 h-px"
                style={{ background: teal ? "#b0dede" : "#eef1f9" }}
            />
        </div>
    );
}

function ReadonlyField({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined;
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <Icon size={10} style={{ color: "#8a99b8" }} />
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>
                    {label}
                </p>
            </div>
            <div
                className="px-3 py-2 rounded-xl text-[13px] font-semibold"
                style={{ background: "#f4f6fb", border: "1.5px solid #eef1f9", color: "#0f2244" }}
            >
                {value ?? "—"}
            </div>
        </div>
    );
}

const VITAL_FIELDS = [
    { key: "bp", label: "BP", unit: "mmHg", ph: "120/80" },
    { key: "temp", label: "Temp", unit: "°C", ph: "36.6" },
    { key: "cr", label: "Pulse", unit: "bpm", ph: "72" },
    { key: "rr", label: "RR", unit: "/min", ph: "16" },
    { key: "wt", label: "Weight", unit: "kg", ph: "60" },
    { key: "ht", label: "Height", unit: "cm", ph: "165" },
];

function VitalsGrid({
    prefix,
    teal,
    register,
    readonly,
}: {
    prefix: string;
    teal?: boolean;
    register: ReturnType<typeof useForm<RequestFormValues>>["register"];
    readonly: boolean;
}) {
    return (
        <div className="grid grid-cols-6 gap-2">
            {VITAL_FIELDS.map((f) => (
                <div key={f.key}>
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider mb-1.5 text-center" style={{ color: "#8a99b8" }}>
                        {f.label}
                        <span className="block text-[8.5px] font-normal">{f.unit}</span>
                    </p>
                    <input
                        type="text"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {...(register as any)(`${prefix ? `${prefix}_` : ""}${f.key}`)}
                        placeholder={f.ph}
                        readOnly={readonly}
                        className="w-full text-center text-[12.5px] font-semibold rounded-xl px-2 py-2.5 outline-none transition"
                        style={{
                            background: readonly ? "#f4f6fb" : (teal ? "#e0f4f4" : "white"),
                            border: `1.5px solid ${readonly ? "#eef1f9" : (teal ? "#b0dede" : "#dce3ef")}`,
                            color: readonly ? "#8a99b8" : "#0f2244",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────

const ConsultationRequestModal: React.FC<{
    request: RequestProps;
    patient: PatientProps;
    vitals: VitalSignProps | undefined;
    onClose: () => void;
}> = ({ request, patient, vitals, onClose }) => {
    const { mutateAsync: updateRequest, isPending } = useUpdateRequest(onClose);
    const { data: UserList } = useGetAllUsers();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            req_type: "CONSULTATION",
            name: patient.name,
            patient_id: patient.patient_id,
            cr: vitals?.cr,
            bp: vitals?.bp,
            temp: vitals?.temp,
            rr: vitals?.rr,
            ht: vitals?.ht,
            wt: vitals?.wt,
            created_at: "",
            patient_code: patient?.patient_code,
            address: patient?.address,
            age: patient?.age?.toString(),
            req_date: todayPH(),
            physician: request.consult?.physician,
        },
    });

    // console.log('patient data from modal', vitals)
    const RequestId = Number(request.req_id);

    const consultErrors = errors as unknown as import("react-hook-form").FieldErrors<Consultation>;

    type Option = { label: string; value: number };
    const options: Option[] = (UserList ?? []).map((u: UsersProps) => ({
        label: `${u.name} ${u.title}`,
        value: u.user_id,
    }));

    const onSubmit = async (data: RequestFormValues) => {
        await updateRequest({ request_id: RequestId, data });
    };

    return (
        <div className="font-['DM_Sans'] bg-white">

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

                {/* ── Patient info row (readonly) ── */}
                <div className="grid grid-cols-4 gap-3">
                    <ReadonlyField icon={Hash} label="Patient Code" value={patient.patient_code} />
                    <div className="col-span-2">
                        <ReadonlyField icon={User} label="Full Name" value={patient.name} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "#8a99b8" }}>
                            <Calendar size={10} className="inline mr-1" />
                            Request Date
                        </p>
                        <input
                            type="date"
                            {...register("req_date")}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#0f2244" }}
                        />
                        {consultErrors.req_date && (
                            <p className="text-[10.5px] mt-1" style={{ color: "#c8102e" }}>{consultErrors.req_date.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                        <ReadonlyField icon={MapPin} label="Address" value={patient.address} />
                    </div>
                    <ReadonlyField icon={User} label="Age" value={`${patient.age} years`} />
                </div>

                {/* ── Vitals ── */}
                <div
                    className="rounded-2xl p-4 space-y-4"
                    style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}
                >
                    <SectionDivider label="Vital Signs" />

                    <div>
                        <SectionDivider label="Previous Record" teal={false} />
                        <div className="mt-2">
                            <VitalsGrid prefix="prev" register={register} readonly />
                        </div>
                    </div>

                    <div>
                        <SectionDivider label="Current Record" teal />
                        <div className="mt-2">
                            <VitalsGrid prefix="" teal register={register} readonly={false} />
                        </div>
                    </div>
                </div>

                {/* ── Physician ── */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Assigned Physician</Label>
                        <Controller
                            control={control}
                            name="physician"
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={options}
                                    placeholder="— Select Physician —"
                                    isClearable
                                    onChange={(s) => field.onChange(s ? s.value : null)}
                                    value={options.find((o) => o.value === field.value) ?? null}
                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                    styles={{
                                        menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                                        control: (b) => ({ ...b, borderRadius: "12px", borderColor: "#dce3ef", background: "#f4f6fb", fontSize: "13px" }),
                                        menuList: (b) => ({ ...b, maxHeight: 200, overflowY: "auto", color: "black" }),
                                    }}
                                />
                            )}
                        />
                        {consultErrors.physician && (
                            <p className="text-[10.5px] mt-1" style={{ color: "#c8102e" }}>{consultErrors.physician.message}</p>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-2.5 pt-2" style={{ borderTop: "1px solid #eef1f9" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                        style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        // disabled={isPending}
                        className="px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #0f2244, #1a3560)" }}
                    >
                        {/* {isPending ? "Submitting…" : "Submit Consultation ✓"} */}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConsultationRequestModal;