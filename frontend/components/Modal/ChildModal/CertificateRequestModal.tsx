"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { requestSchema } from "@/schemas/request.schema";
import { RequestProps, UsersProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useGetAllUsers, useUpdateRequest } from "@/hooks/Patient/usePatientRegistration";
import Label from "@/components/ui/label";
import { User, Hash, MapPin, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";
import { todayPH } from "@/utils/Date";
import SweetAlert from "@/utils/SweetAlert";

type RequestFormValues = z.infer<typeof requestSchema>;
type Certificate = Extract<RequestFormValues, { req_type: "CERTIFICATE" }>;

const PURPOSE_OPTIONS = [
    { value: "Fit To Work", label: "Fit to Work" },
    { value: "Medical Assistance", label: "Medical Assistance" },
];

function ReadonlyField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | undefined }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <Icon size={10} style={{ color: "#8a99b8" }} />
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>{label}</p>
            </div>
            <div className="px-3 py-2 rounded-xl text-[13px] font-semibold"
                style={{ background: "#f4f6fb", border: "1.5px solid #eef1f9", color: "#0f2244" }}>
                {value ?? "—"}
            </div>
        </div>
    );
}

const CertificateRequestModal: React.FC<{
    request: RequestProps;
    patient: PatientProps;
    onClose: () => void;
}> = ({ request, patient, onClose }) => {
    const { mutateAsync: updateRequest, isPending } = useUpdateRequest(onClose);
    const { data: UserList } = useGetAllUsers();
    const currentYear = new Date().getFullYear();
    const alreadyClaimed = Number(patient.last_medical_assistance_year) === currentYear;

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            req_type: "CERTIFICATE",
            name: patient.name,
            patient_id: patient.patient_id,
            patient_code: patient?.patient_code,
            address: patient?.address,
            age: patient?.age?.toString(),
            req_date: todayPH(),
            physician: request.cert?.physician,
            purpose: request.cert?.purpose,
        },
    });

    const RequestId = Number(request.req_id);

    const certErrors = errors as unknown as import("react-hook-form").FieldErrors<Certificate>;
    const watchedPurpose = watch("purpose" as keyof RequestFormValues);
    const isMedicalAssistance = watchedPurpose === "Medical Assistance";

    type Option = { label: string; value: number };
    const options: Option[] = (UserList ?? []).map((u: UsersProps) => ({
        label: `${u.name} ${u.title}`,
        value: u.user_id,
    }));

    const onSubmit = async (data: RequestFormValues) => {
        if (alreadyClaimed && data.req_type === "CERTIFICATE" && isMedicalAssistance) {
            const confirmed = await SweetAlert.confirmationAlert2(
                "Are you sure?",
                "Patient already claimed medical assistance this year."
            );
            if (!confirmed) return;
        }
        await updateRequest({ request_id: RequestId, data });
    };

    return (
        <div className="font-['DM_Sans'] bg-white">

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

                {/* ── Already claimed banner ── */}
                {alreadyClaimed && (
                    <div
                        className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                        style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}
                    >
                        <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }} />
                        <div>
                            <p className="text-[12.5px] font-semibold" style={{ color: "#92400e" }}>
                                Medical Assistance Already Claimed
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#a16207" }}>
                                This patient has already received medical assistance in {currentYear}. Issuing another certificate will require confirmation.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Patient info (readonly) ── */}
                <div className="grid grid-cols-4 gap-3">
                    <ReadonlyField icon={Hash} label="Patient Code" value={patient.patient_code} />
                    <div className="col-span-2">
                        <ReadonlyField icon={User} label="Full Name" value={patient.name} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "#8a99b8" }}>
                            <Calendar size={10} className="inline mr-1" />Request Date
                        </p>
                        <input type="date" {...register("req_date")}
                            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#0f2244" }} />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                        <ReadonlyField icon={MapPin} label="Address" value={patient.address} />
                    </div>
                    <ReadonlyField icon={User} label="Age" value={`${patient.age} years`} />
                </div>

                {/* ── Purpose + Physician ── */}
                <div
                    className="rounded-2xl p-4 space-y-4"
                    style={{ background: "#f8f9fc", border: "1px solid #eef1f9" }}
                >
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={13} style={{ color: "#a3852c" }} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8a99b8" }}>
                            Certificate Details
                        </span>
                        <span className="flex-1 h-px" style={{ background: "#eef1f9" }} />
                    </div>

                    {/* Purpose */}
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#8a99b8" }}>
                            Purpose
                        </p>
                        <Controller
                            control={control}
                            name="purpose"
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={PURPOSE_OPTIONS}
                                    placeholder="— Select Purpose —"
                                    isClearable
                                    onChange={(s) => field.onChange(s ? s.value : null)}
                                    value={PURPOSE_OPTIONS.find((o) => o.value === field.value) ?? null}
                                    menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                    styles={{
                                        menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                                        control: (b) => ({ ...b, borderRadius: "12px", borderColor: "#dce3ef", background: "white", fontSize: "13px", minHeight: "42px" }),
                                        menuList: (b) => ({ ...b, maxHeight: 200, overflowY: "auto", color: "black" }),
                                        singleValue: (b) => ({ ...b, color: "#0f2244", fontWeight: "600" }),
                                    }}
                                />
                            )}
                        />
                        {/* Highlight if medical assistance + already claimed */}
                        {isMedicalAssistance && alreadyClaimed && (
                            <p className="text-[10.5px] mt-1.5 flex items-center gap-1" style={{ color: "#d97706" }}>
                                <AlertTriangle size={10} /> Duplicate claim warning — confirmation required on submit
                            </p>
                        )}
                    </div>

                    {/* Physician */}
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
                                        control: (b) => ({ ...b, borderRadius: "12px", borderColor: "#dce3ef", background: "white", fontSize: "13px", minHeight: "42px" }),
                                        menuList: (b) => ({ ...b, maxHeight: 200, overflowY: "auto", color: "black" }),
                                        singleValue: (b) => ({ ...b, color: "#0f2244", fontWeight: "600" }),
                                    }}
                                />
                            )}
                        />
                        {certErrors.physician && (
                            <p className="text-[10.5px] mt-1" style={{ color: "#c8102e" }}>{certErrors.physician.message}</p>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-2.5 pt-2" style={{ borderTop: "1px solid #eef1f9" }}>
                    <button type="button" onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors"
                        style={{ background: "#f4f6fb", color: "#6b7da0", border: "1.5px solid #dce3ef" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef1f9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f6fb"; }}>
                        Cancel
                    </button>
                    <button type="submit"
                        disabled={isPending}
                        className="px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #a3852c, #7a6020)" }}>
                        {isPending ? "Submitting…" : "Issue Certificate ✓"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CertificateRequestModal;