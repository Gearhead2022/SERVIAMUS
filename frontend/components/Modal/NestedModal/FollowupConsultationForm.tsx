"use client"

import { ReactNode, useState } from "react";
import { z } from "zod";
import { patientFollowUpConsultationSchema } from "@/schemas/consultation.schema";
import { useForm, UseFormReturn, Path, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientProps } from "@/types/PatientTypes";
import Button from "@/components/ui/Button";
import { VitalSignProps } from "@/types/RequestTypes"
import { FollowupConsultationProps, FollowupConsultationResultProps, InitialConsultationProps, PrescriptionProps } from "@/types/ConsultationTypes";
import { normalizeFollowUpDefaults } from "@/utils/consultation/normalizeFollowUpDefaults";
import { formatDate } from "@/utils/Date";

type RegisterFollowupFormValues = z.infer<typeof patientFollowUpConsultationSchema>;

type StepProps = {
    form: UseFormReturn<RegisterFollowupFormValues>;
    consultation?: InitialConsultationProps;
    followups?: FollowupConsultationProps[];
    vitals?: VitalSignProps;
    patient?: PatientProps;
    prescription?: PrescriptionProps;
};
const STEPS = [
    { label: "Personal", sub: "Information" },
    { label: "Vital Signs &", sub: "History" },
    { label: "Medical", sub: "Records" },
    { label: "Assesment", sub: "Results" },
];

type CheckItemProps = {
    label: string;
    name: Path<RegisterFollowupFormValues>;
    register: UseFormRegister<RegisterFollowupFormValues>;
};

const inputCls =
    "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white";

const labelCls =
    "text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0]";

function FormGroup({ label, children, span2 = false }: { label: string, children: ReactNode, span2?: boolean }) {
    return (
        <div className={`relative ${span2 ? "col-span-2" : ""}`}>
            <label className={labelCls}>{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

function CheckItem({ label, name, register }: CheckItemProps) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <input type="checkbox"
                className="w-4 h-4 accent-[#0f2244] cursor-pointer"
                {...register(name)} />
            <label htmlFor={name} className="text-sm text-[#1a2a45] cursor-pointer font-normal normal-case tracking-normal">
                {label}
            </label>
        </div>
    );
}

function MedBox({ title, children }: { title: string, children: ReactNode }) {
    return (
        <div className="border border-[1.5px] border-[#dce3ef] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#0f2244] mb-3 pb-2 border-b border-[#dce3ef]">
                {title}
            </h3>
            {children}
        </div>
    );
}

function VitalsRow({ label, teal = false, form }: { label: string, teal?: boolean, form: StepProps["form"] }) {
    const { register } = form;
    const fields = [
        { name: "bp", label: "BP (mmHg)", ph: "120/80" },
        { name: "temp", label: "Temp (°C)", ph: "36.6" },
        { name: "cr", label: "Pulse (bpm)", ph: "72" },
        { name: "rr", label: "RR (/min)", ph: "16" },
        { name: "wt", label: "Weight (kg)", ph: "60" },
        { name: "ht", label: "Height (cm)", ph: "165" },
    ];
    return (
        <div className="mb-5">
            <h4
                className={`text-[11px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-2 ${teal ? "text-[#0e7c7b]" : "text-[#6b7da0]"
                    }`}
            >
                {label}
                <span className="flex-1 h-px bg-[#dce3ef]" />
            </h4>
            <div className="grid grid-cols-6 gap-2">
                {fields.map((f) => (
                    <div key={f.name}>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7da0] mb-1">
                            {f.name}
                        </label>
                        <input
                            type="text"
                            {...register(`${f.name}` as Path<RegisterFollowupFormValues>)}
                            placeholder={f.ph}
                            className={`w-full text-center text-sm rounded-md px-2 py-2 border outline-none transition ${teal
                                ? "bg-[#e0f4f4] border-[#b0dede] focus:border-[#0e7c7b] focus:shadow-[0_0_0_3px_rgba(14,124,123,0.1)] focus:bg-white"
                                : "bg-[#f0f3fa] border-[#dce3ef] focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white"
                                } text-[#1a2a45]`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step Panels ────────────────────────────────────────────────────────────

function Step1({ form, consultation }: StepProps) {
    const { register, formState: { errors } } = form;
    // console.log('step4', consultation);
    return (
        <>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Personal Information</h2>
            <p className="text-sm text-[#6b7da0] mt-1 mb-6">Basic patient details and demographics</p>

            <div className="grid grid-cols-2 gap-x-7 gap-y-4">
                <FormGroup label="Full Name">
                    <input type="text" placeholder="e.g. Maria Santos" className={`${inputCls} ${errors.name
                        ? "border border-red-500"
                        : "border border-[1.5px] border-[#dce3ef]"
                        }`} {...register("name")} readOnly />
                    {errors.name && (
                        <p className="absolute left-0 top-full mt-1 text-red-900 text-xs">
                            {errors.name.message as string}
                        </p>
                    )}
                </FormGroup>
                <FormGroup label="Date of Consultation">
                    <input type="date" className={`${inputCls}`} {...register("consultation_date")} />
                    {errors.consultation_date && (
                        <p>{errors.consultation_date.message as string}</p>
                    )}
                </FormGroup>
                <FormGroup label="Address">
                    <input type="text" placeholder="Street, City, Province" className={inputCls} {...register("address")} />
                    {errors.address && (
                        <p>{errors.address.message as string}</p>
                    )}
                </FormGroup>
                <FormGroup label="Contact Number">
                    <input type="tel" placeholder="+63 9XX XXX XXXX" className={inputCls} {...register("contact_number")} />
                </FormGroup>
                <FormGroup label="Date of Birth">
                    <input type="date" className={inputCls} {...register("birth_date")} />
                </FormGroup>
                <FormGroup label="Sex">
                    <select className={inputCls} {...register("sex")}>
                        <option value="">— Select —</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </FormGroup>
                <FormGroup label="Age">
                    <input type="text" placeholder="Years" className={inputCls} {...register("age")} />
                </FormGroup>
                <FormGroup label="Religion">
                    <input type="text" placeholder="e.g. Roman Catholic" className={inputCls} {...register("religion")} />
                </FormGroup>
                <FormGroup label="Chief Complaint" span2>
                    <textarea
                        rows={3}
                        placeholder="Describe the patient's primary reason for consultation…"
                        className={`${inputCls} resize-y text-gray-900 readonly cursor-not-allowed`}
                        value={consultation?.chief_complaint ?? ""}
                    />
                </FormGroup>
            </div>
        </>
    );
}

function Step2({ form, consultation }: StepProps) {
    const { register, formState: { errors } } = form;
    return (
        <>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Vital Signs & History</h2>
            <p className="text-sm text-[#6b7da0] mt-1 mb-6">Current and previous measurements with clinical notes</p>

            <VitalsRow label="Vitals Record" form={form} teal />

            <div className="mt-2">
                <label className={labelCls}>History of Present Illness</label>
                <textarea
                    rows={5}
                    placeholder="Describe onset, duration, character, associated symptoms, relieving/aggravating factors…"
                    className={`${inputCls} mt-1 resize-y readonly cursor-not-allowed`}
                    value={consultation?.hist_illness}
                />
            </div>
        </>
    );
}

function Step3({ form }: StepProps) {
    const { register, formState: { errors } } = form
    const ob_history = [
        { name: "menarche", label: "Menarche", ph: "Age" },
        { name: "interval", label: "Interval", ph: "Days" },
        { name: "duration", label: "Duration", ph: "Days" },
        { name: "amount", label: "Amount", ph: "Pads/day" },
    ];

    const personal_history = [
        { name: "travel_history", label: "Travel History", ph: "Recent travel destinations" },
        { name: "diet", label: "Diet", ph: "e.g. Regular, Low-sodium" },
        { name: "stress", label: "Stress / Coping Mechanism", ph: "e.g. Exercise, Meditation" },
        { name: "occupation", label: "Occupation", ph: "Current occupation" },
    ];

    return (
        <>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Medical Health Record</h2>
            <p className="text-sm text-[#6b7da0] mt-1 mb-6">
                Past history, family background, and obstetric-gynecological information
            </p>

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-5 mb-5">
                <MedBox title="Past Medical History">
                    <CheckItem name="pmh_allergy" label="Food & Drug Allergy (FDA)" register={register} />
                    <CheckItem name="pmh_admission" label="Previous Admission" register={register} />
                    <CheckItem name="pmh_others" label="Others" register={register} />
                    <div className="flex items-center gap-2 pl-6 mt-1">
                        <input type="text" placeholder="Please specify…" className={`${inputCls} flex-1`} {...register("pmh_others_text")} />
                        <span className="text-[11px] text-[#6b7da0] whitespace-nowrap">specify</span>
                    </div>
                </MedBox>

                <MedBox title="Family History">
                    <CheckItem name="fh_htn" label="Hypertension" register={register} />
                    <CheckItem name="fh_dm" label="Diabetes Mellitus (DM)" register={register} />
                    <CheckItem name="fh_ba" label="Bronchial Asthma (BA)" register={register} />
                    <CheckItem name="fh_cancer" label="Cancer" register={register} />
                    <CheckItem name="fh_others" label="Others" register={register} />
                    <div className="flex items-center gap-2 pl-6 mt-1">
                        <input type="text" placeholder="Please specify…" className={`${inputCls} flex-1`} {...register("fh_others_text")} />
                        <span className="text-[11px] text-[#6b7da0] whitespace-nowrap">specify</span>
                    </div>
                    {errors.fh_others_text && (
                        <p>{errors.fh_others_text.message as string}</p>
                    )}
                </MedBox>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-5">
                <MedBox title="OB-Gyne History">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-[#0f2244]">G P</span>
                        <input type="text" placeholder="e.g. G2P1" className={`${inputCls} max-w-[100px]`} {...register("ob_score")} />
                    </div>
                    <CheckItem name="ob_nvsd" label="Normal Vaginal Spontaneous Delivery (NVSD)" register={register} />
                    <CheckItem name="ob_cs" label="Caesarean Section (CS)" register={register} />
                    <hr className="my-3 border-[#dce3ef]" />
                    <div className="grid grid-cols-2 gap-2">
                        {ob_history.map((f) => (
                            <div key={f.name}>
                                <label className={labelCls}>{f.label}</label>
                                <input type="text" placeholder={f.ph} className={`${inputCls} mt-1`}
                                    {...register(`${f.name}` as Path<RegisterFollowupFormValues>)} />
                            </div>
                        ))}
                        <div className="col-span-2">
                            <label className={labelCls}>Symptoms</label>
                            <input type="text" placeholder="Describe any symptoms" className={`${inputCls} mt-1`}
                                {...register("ob_symptoms")} />
                        </div>
                    </div>
                </MedBox>

                <MedBox title="Personal & Social History">
                    <CheckItem name="cigarette_use" label="Cigarette use :" register={register} />
                    <CheckItem name="alcohol_use" label="Alcohol Beverage use :" register={register} />
                    <CheckItem name="drug_use" label="Illicit Drug use :" register={register} />
                    <CheckItem name="exercise" label="Exercise :" register={register} />
                    <CheckItem name="hygiene_prac" label="Good Hygiene Practice :" register={register} />
                    <CheckItem name="coffee_cons" label="Coffee consumption :" register={register} />
                    <CheckItem name="soda_cons" label="Soda consumption :" register={register} />
                    <hr className="my-3 border-[#dce3ef]" />
                    <div className="space-y-3">
                        {personal_history.map((ph) => (
                            <div key={ph.name}>
                                <label className={labelCls}>{ph.label}</label>
                                <input type="text" placeholder={ph.ph} className={`${inputCls} mt-1`}
                                    {...register(`${ph.name}` as Path<RegisterFollowupFormValues>)} />
                            </div>
                        ))}
                    </div>
                </MedBox>
            </div>
        </>
    );
}

function ReadOnlyBlock({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-xl border border-[#e1e7f2] bg-[#fbfcff] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-2">
                {label}
            </p>

            <p className="text-sm text-[#1a2a45] leading-relaxed whitespace-pre-line">
                {value || "-"}
            </p>
        </div>
    );
}

function Step4({ form, consultation, followups = [], patient, vitals, prescription }: StepProps) {
    const { register, formState: { errors } } = form;

    return (
        <>
            <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">
                Consultation Timeline
            </h2>

            <p className="text-sm text-[#6b7da0] mt-1 mb-6">
                Review the patient&apos;s consultation history before recording today&apos;s follow-up.
            </p>

            <div>
                <h5 className={`text-center ${labelCls}`}>PATIENT&apos;S NAME: {patient?.name}</h5>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">

                {/* TIMELINE */}
                <div className="rounded-2xl border border-[#dce3ef] bg-white p-5">
                    <h3 className="text-sm font-semibold text-[#0f2244] mb-4">
                        Consultation History
                    </h3>

                    <div className="space-y-5">
                        {/* INITIAL CONSULTATION */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-[#0f2244]" />
                                <div className="w-px flex-1 bg-[#dce3ef]" />
                            </div>

                            <div className="pb-4">
                                <p className="text-sm font-semibold text-[#0f2244]">
                                    Initial Consultation
                                </p>
                                <p className="text-xs text-[#6b7da0]">
                                    {consultation?.consultation_date
                                        ? new Date(consultation.consultation_date).toLocaleDateString("en-PH")
                                        : "No date available"}
                                </p>
                                <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-[#eef2f8] text-[#6b7da0]">
                                    Read only
                                </span>
                            </div>
                        </div>

                        {/* PREVIOUS FOLLOW-UPS */}
                        {followups.map((item, index) => (
                            <div key={item.consultation_id ?? index} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-[#6b7da0]" />
                                    <div className="w-px flex-1 bg-[#dce3ef]" />
                                </div>

                                <div className="pb-4">
                                    <p className="text-sm font-semibold text-[#0f2244]">
                                        Follow-up #{index + 1}
                                    </p>
                                    <p className="text-xs text-[#6b7da0]">
                                        {item.consult?.consultation_date
                                            ? new Date(item.consult.consultation_date).toLocaleDateString("en-PH")
                                            : "No date available"}
                                    </p>
                                    <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-[#eef2f8] text-[#6b7da0]">
                                        Read only
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* NEW FOLLOW-UP */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-[#0e7c7b]" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#0f2244]">
                                    New Follow-up
                                </p>
                                <p className="text-xs text-[#6b7da0]">
                                    Editable current follow-up
                                </p>
                                <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-[#e0f4f4] text-[#0e7c7b]">
                                    Editable
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-5">

                    {/* INITIAL CONSULTATION READ ONLY */}
                    <div className="rounded-xl border border-[#dce3ef] bg-white overflow-hidden">

                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-[#dce3ef] px-5 py-4 bg-[#fafbfd]">
                            <div>
                                <h3 className="text-sm font-semibold text-[#0f2244]">
                                    Initial Consultation Summary
                                </h3>
                                <p className="text-xs text-[#6b7da0] mt-1">
                                    Recorded consultation details for reference only.
                                </p>
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7da0]">
                                READ ONLY
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">

                            {/* LEFT INFO */}
                            <div className="border-r border-[#dce3ef] p-5">

                                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-4">
                                    Visit Details
                                </p>

                                <div className="mb-5">
                                    <p className="text-[11px] text-[#6b7da0]">
                                        Consultation Date
                                    </p>

                                    <p className="font-semibold text-[#0f2244] mt-1">
                                        {formatDate(consultation?.consultation_date)}
                                    </p>
                                </div>

                                <div className="space-y-3">

                                    {[
                                        ["BP", vitals?.bp],
                                        ["TEMP", vitals?.temp],
                                        ["CR", vitals?.cr],
                                        ["RR", vitals?.rr],
                                        ["WT", vitals?.wt],
                                        ["HT", vitals?.ht],
                                    ].map(([label, value]) => (

                                        <div
                                            key={label}
                                            className="flex items-center justify-between border-b border-dashed border-[#edf1f6] pb-2"
                                        >
                                            <span className="text-xs font-semibold text-[#6b7da0]">
                                                {label}
                                            </span>

                                            <span className="text-sm font-medium text-[#0f2244]">
                                                {value || "-"}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            {/* RIGHT CONTENT */}
                            <div className="p-5">

                                <div className="pb-4 border-b border-[#edf1f6] gap-2 space-y-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1">
                                        Chief Complaint
                                    </p>

                                    <p className="text-sm leading-6 text-[#1a2a45] whitespace-pre-wrap">
                                        {consultation?.chief_complaint || "-"}
                                    </p>

                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1">
                                        History of Present Illness
                                    </p>

                                    <p className="text-sm leading-6 text-[#1a2a45] whitespace-pre-wrap">
                                        {consultation?.hist_illness || "-"}
                                    </p>

                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1">
                                        Physical / Neurologic Examination
                                    </p>

                                    <p className="text-sm leading-6 text-[#1a2a45] whitespace-pre-wrap">
                                        {consultation?.examination || "-"}
                                    </p>

                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-2">
                                        Assessment
                                    </p>

                                    <p className="text-sm leading-6 text-[#1a2a45] whitespace-pre-wrap">
                                        {consultation?.assessment || "-"}
                                    </p>

                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-2">
                                        Plans
                                    </p>

                                    <p className="text-sm leading-6 text-[#1a2a45] whitespace-pre-wrap">
                                        {consultation?.plans || "-"}
                                    </p>
                                </div>

                                {/* PRESCRIPTION */}
                                <div className="border-t border-[#dce3ef]">

                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-4">
                                        Prescription
                                    </p>

                                    {prescription?.medicines?.length ? (

                                        <div className="space-y-3">

                                            {prescription.medicines.map((m, index) => (

                                                <div
                                                    key={index}
                                                    className="border-b border-[#edf1f6] pb-3 last:border-0"
                                                >

                                                    <div className="flex justify-between">

                                                        <p className="font-semibold text-sm text-[#0f2244]">
                                                            {m.medicine_name}
                                                        </p>
                                                        <p className="text-sm text-[#6b7da0]">
                                                            {m.dose} {m.frequency}
                                                        </p>

                                                    </div>
                                                    {m.instruction && (
                                                        <p className="text-sm text-[#1a2a45] mt-2">
                                                            {m.instruction}
                                                        </p>
                                                    )}

                                                </div>

                                            ))}

                                        </div>

                                    ) : (

                                        <p className="text-sm text-[#6b7da0]">
                                            No prescription recorded.
                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* NEW FOLLOW-UP EDITABLE */}
                    <div className="rounded-2xl border border-[#b0dede] bg-[#f8ffff] p-5">
                        <h3 className="text-sm font-semibold text-[#0e7c7b] mb-4">
                            New Follow-up Details
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <FormGroup label="Impression">
                                <textarea
                                    rows={5}
                                    placeholder="Enter doctor's impression for this follow-up..."
                                    className={`${inputCls} mt-1 resize-y`}
                                    {...register("followups.0.impression")}
                                />
                                {errors.followups?.[0]?.impression && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.followups[0].impression.message as string}
                                    </p>
                                )}
                            </FormGroup>

                            <FormGroup label="Instruction">
                                <textarea
                                    rows={5}
                                    placeholder="Enter instructions, advice, medication, or next steps..."
                                    className={`${inputCls} mt-1 resize-y`}
                                    {...register("followups.0.instruction")}
                                />
                                {errors.followups?.[0]?.instruction && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.followups[0].instruction.message as string}
                                    </p>
                                )}
                            </FormGroup>

                            <FormGroup label="Follow-up Date">
                                <input
                                    type="date"
                                    className={`${inputCls} !w-[50%]`}
                                    {...register("followups.0.follow_up_date")}
                                />
                                {errors.followups?.[0]?.follow_up_date && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.followups[0].follow_up_date.message as string}
                                    </p>
                                )}
                            </FormGroup>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


const FollowupConsultationForm: React.FC<{ patient: PatientProps | undefined, vitals: VitalSignProps | undefined, followups: FollowupConsultationResultProps | undefined, cons_id: number, onClose: () => void, onPreview: (data: RegisterFollowupFormValues) => void }> = ({ patient, vitals, followups, cons_id, onClose, onPreview }) => {

    const [step, setStep] = useState(1);

    const form = useForm<RegisterFollowupFormValues>({
        resolver: zodResolver(patientFollowUpConsultationSchema),
        mode: "onSubmit",
        defaultValues: normalizeFollowUpDefaults(patient, followups, vitals) as RegisterFollowupFormValues,
    });

    console.log('main', followups?.initialConsultation.prescription)

    const panels: React.ReactElement[] = [
        <Step1 key="step1" form={form} consultation={followups?.initialConsultation} />,
        <Step2 key="step2" form={form} consultation={followups?.initialConsultation} />,
        <Step3 key="step3" form={form} />,
        <Step4 key="step4" form={form} followups={followups?.followups ?? undefined} consultation={followups?.initialConsultation ?? undefined}
            vitals={vitals} patient={patient ?? undefined} prescription={followups?.initialConsultation.prescription} />,
    ];

    const handlePreview = () => {
        const values = form.getValues(); // get current form state
        onPreview(values);
    };

    return (
        <>
            <div className="bg-white rounded-2xl w-full overflow-y-none h-[80vh]">
                {/* Step Indicator */}
                <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-10 flex">
                    {STEPS.map((s, i) => {
                        const n = i + 1;
                        const isActive = step === n;
                        const isDone = step > n;
                        return (
                            <div
                                key={n}
                                className={`flex-1 flex items-center gap-2.5 py-4 relative ${i < STEPS.length - 1
                                    ? "after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-7 after:bg-[#dce3ef]"
                                    : ""
                                    }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 flex-shrink-0 transition-all duration-300 ${isActive
                                        ? "bg-[#c8102e] border-[#c8102e] text-white"
                                        : isDone
                                            ? "bg-[#0e7c7b] border-[#0e7c7b] text-white"
                                            : "bg-white border-[#dce3ef] text-[#6b7da0]"
                                        }`}
                                >
                                    {isDone ? "✓" : n}
                                </div>
                                <div className="leading-tight">
                                    <div
                                        className={`text-[11.5px] font-${isActive ? "600" : "500"} ${isActive ? "text-[#1a2a45]" : isDone ? "text-[#0e7c7b]" : "text-[#6b7da0]"
                                            }`}
                                    >
                                        {s.label}
                                    </div>
                                    <div
                                        className={`text-[11.5px] font-${isActive ? "600" : "500"} ${isActive ? "text-[#1a2a45]" : isDone ? "text-[#0e7c7b]" : "text-[#6b7da0]"
                                            }`}
                                    >
                                        {s.sub}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Body */}

                <div className="px-10 py-9 min-h-[440px]">{panels[step - 1]}</div>

                {/* Footer */}
                <div className="border-t border-[#dce3ef] bg-[#f7f8fc] px-10 py-5 flex items-center justify-between">
                    <span className="text-xs text-[#6b7da0]">Step {step} of {STEPS.length}</span>
                    <div className="flex gap-2.5">
                        <Button variant="danger" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        {step > 1 && (
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => setStep(step - 1)}
                            >
                                ← Previous
                            </Button>
                        )}
                        {step < STEPS.length && (

                            <Button
                                variant="primary"
                                type="button"
                                onClick={() => setStep(step + 1)}
                            >
                                Next →
                            </Button>
                        )}
                        {step === STEPS.length && (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handlePreview}
                            >
                                Preview
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </>

    );
}

export default FollowupConsultationForm;