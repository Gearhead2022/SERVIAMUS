"use client";

import { useState, type KeyboardEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { requestSchema } from "@/schemas/request.schema";
import { PrintableLabRequestPayload, RequestProps, UsersProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useGetAllUsers, useRequest, useUpdateRequest } from "@/hooks/Patient/usePatientRegistration";
import { User, Hash, MapPin, Calendar, Plus, X, Printer } from "lucide-react";
import { todayPH } from "@/utils/Date";
import SweetAlert from "@/utils/SweetAlert";
import { openExternalLabRequestPrintPage } from "@/utils/lab-request-print";

type RequestFormValues = z.infer<typeof requestSchema>;
type Laboratory = Extract<RequestFormValues, { req_type: "LABORATORY" }>;
type TestOption = { label: string; value: string };

const normalizeLabel = (v: string) => v.trim().replace(/\s+/g, " ");

const buildPayload = (
    patient: PatientProps,
    data: Laboratory,
    tests: string[]
): PrintableLabRequestPayload => ({
    patientCode: data.patient_code,
    patientName: data.name,
    age: data.age,
    sex: patient.sex ?? null,
    address: data.address,
    requestDate: data.req_date,
    requestedBy: data.req_by,
    tests,
});

const inputCls =
    "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";


// ── Test catalog ──────────────────────────────────────────────────────────

const TEST_OPTIONS = [
    {
        label: "Clinical Chemistry",
        options: [
            { label: "Try", value: "lol" },
            { label: "Fasting Blood Sugar", value: "FBS" },
            { label: "Random Blood Sugar", value: "Random Blood Sugar" },
            { label: "Urea (BUN)", value: "Urea (BUN)" },
            { label: "Creatinine", value: "Creatinine" },
            { label: "Uric Acid", value: "Uric Acid" },
            { label: "Total Cholesterol", value: "Total Cholesterol" },
            { label: "HDL-Cholesterol", value: "HDL-Cholesterol" },
            { label: "LDL-Cholesterol", value: "LDL-Cholesterol" },
            { label: "Triglycerides", value: "Triglycerides" },
            { label: "50g OGTT", value: "1H-OGTT" },
            { label: "75g OGTT (Gestational)", value: "2H-OGTT Gestational" },
            { label: "75g OGTT (Non-Gestational)", value: "OGTT 75G" },
            { label: "100g OGTT", value: "OGTT" },
            { label: "SGPT", value: "Serum Glutamic Pyruvic Transaminase" },
            { label: "Sodium", value: "Sodium" },
            { label: "Potassium", value: "Potassium" },
            { label: "HbA1c", value: "HbA1c" },
        ],
    },
    {
        label: "Clinical Microscopy",
        options: [
            { label: "Urinalysis", value: "Urinalysis" },
            { label: "Fecalysis", value: "Fecalysis" },
            { label: "Fecal Occult Blood Test", value: "Fecal Occult Blood Test" },
        ],
    },
    {
        label: "Serology",
        options: [
            { label: "Pregnancy Test (Urine)", value: "Pregnancy Test (Urine)" },
            { label: "Pregnancy Test (Serum)", value: "Pregnancy Test (Serum)" },
            { label: "Dengue NS1", value: "Dengue NS1" },
            { label: "Syphilis", value: "Syphilis" },
            { label: "Hepatitis B Surface Antigen", value: "Hepatitis B Surface Antigen" },
        ],
    },
    {
        label: "Hematology",
        options: [
            { label: "CBC with Platelet Count", value: "Complete Blood Count with Platelet Count" },
            { label: "Blood Typing", value: "Blood Typing" },
        ],
    },
];




const FLAT_OPTIONS = TEST_OPTIONS.flatMap((g) => g.options);

// ── Shared helpers ────────────────────────────────────────────────────────

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

// ── Category color map ────────────────────────────────────────────────────

const CAT_COLOR: Record<string, { color: string; bg: string }> = {
    "Clinical Chemistry": { color: "#7c4dab", bg: "#f3eefb" },
    "Clinical Microscopy": { color: "#0e7c7b", bg: "#e0f4f4" },
    "Serology": { color: "#c8102e", bg: "#fdf0f2" },
    "Hematology": { color: "#0f2244", bg: "#eef1f9" },
};

// ── Main component ────────────────────────────────────────────────────────

const LaboratoryRequestModal: React.FC<{
    request: RequestProps | null;
    isEditMode: boolean;
    patient: PatientProps;
    onClose: () => void;
}> = ({ request, isEditMode, patient, onClose }) => {
    const { mutateAsync: createRequest, isPending: CreateIsPending } = useRequest(onClose);
    const { mutateAsync: updateRequest, isPending: UpdateIsPending } = useUpdateRequest(onClose);
    const [addInput, setAddInput] = useState("");
    const [additionalTests, setAdditionalTests] = useState<string[]>([]);
    const [printError, setPrintError] = useState("");
    const { data: UserList } = useGetAllUsers();

    const {
        register,
        handleSubmit,
        control,
        clearErrors,
        getValues,
        trigger,
        formState: { errors },
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            req_type: "LABORATORY",
            name: patient.name,
            patient_id: patient.patient_id,
            patient_code: patient?.patient_code,
            address: patient?.address,
            age: patient?.age?.toString(),
            req_date: todayPH(),
            req_by: request?.laboratory.req_by,
            test:
                request?.laboratory?.items?.map(
                    (item) => item.test.name
                ) ?? [],
        },
    });

    const RequestId = Number(request?.req_id);

    const labErrors = errors as unknown as import("react-hook-form").FieldErrors<Laboratory>;
    const selectedTests = (useWatch({ control, name: "test" }) as Laboratory["test"] | undefined) ?? [];

    const addTest = () => {
        const t = normalizeLabel(addInput);
        if (!t) return;
        const dupe = [...selectedTests, ...additionalTests].some((x) => x.toLowerCase() === t.toLowerCase());
        if (!dupe) setAdditionalTests((p) => [...p, t]);
        setAddInput("");
        setPrintError("");
        clearErrors("test");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { e.preventDefault(); addTest(); }
    };

    const handlePrint = async () => {
        const valid = await trigger(["patient_code", "name", "req_date", "address", "age", "req_by"] as (keyof RequestFormValues)[]);
        if (!valid) return;
        const values = getValues();
        if (values.req_type !== "LABORATORY") return;
        const allTests = [...selectedTests, ...additionalTests];
        if (!allTests.length) { setPrintError("Select at least one test to print."); return; }
        try {
            setPrintError("");
            openExternalLabRequestPrintPage(buildPayload(patient, values, allTests), { autoPrint: true });
        } catch (err) {
            SweetAlert.errorAlert("Print Failed", err instanceof Error ? err.message : "Unable to open print preview.");
        }
    };

    const onSubmit = async (data: RequestFormValues) => {
        if (isEditMode) {
            await updateRequest({ request_id: RequestId, data });
        } else {
            await createRequest(data);
        }
    };

    // Group selected tests for display
    const selectedByGroup = TEST_OPTIONS.map((group) => ({
        ...group,
        selected: group.options.filter((o) => selectedTests.includes(o.value)),
    })).filter((g) => g.selected.length);

    type Option = {
        label: string;
        value: string;
    };

    const userOptions = (UserList: UsersProps[]): Option[] => {
        return UserList.map((user) => ({
            label: user.name + " " + user.title,
            value: user.name + " " + user.title,
        }));
    };

    const options = userOptions(UserList ?? []);

    return (
        <div className="font-['DM_Sans'] bg-white">

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

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

                {/* ── Requested by ── */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#8a99b8" }}>Requested By</p>
                        <Controller
                            control={control}
                            name="req_by"
                            render={({ field }) => (
                                <Select
                                    options={options}
                                    placeholder="— Select Physician —"
                                    className={`text-sm ${inputCls}`}
                                    classNamePrefix="react-select"
                                    isClearable
                                    onChange={(selected) =>
                                        field.onChange(selected ? selected.label : "")
                                    }
                                    value={
                                        options.find(
                                            (opt) => opt.label === field.value
                                        ) || null
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            maxHeight: 200,
                                            overflowY: "auto",
                                            color: "black",
                                        }),
                                    }}
                                />
                            )}
                        />
                        {labErrors.req_by && (
                            <p className="text-[10.5px] mt-1" style={{ color: "#c8102e" }}>{labErrors.req_by.message}</p>
                        )}
                    </div>
                </div>

                {/* ── Test selector ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap" style={{ color: "#8a99b8" }}>
                            Select Tests
                        </span>
                        <span className="flex-1 h-px" style={{ background: "#eef1f9" }} />
                        {selectedTests.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e0f4f4", color: "#065050" }}>
                                {selectedTests.length} selected
                            </span>
                        )}
                    </div>

                    <Controller
                        control={control}
                        name="test"
                        render={({ field }) => (
                            <Select<TestOption, true>
                                {...field}
                                options={TEST_OPTIONS}
                                isMulti
                                placeholder="Search and select tests…"
                                onChange={(selected) => {
                                    field.onChange(selected.map((o) => o.value));
                                    if (selected.length || additionalTests.length) { setPrintError(""); clearErrors("test"); }
                                }}
                                value={FLAT_OPTIONS.filter((o) =>
                                    field.value?.includes(
                                        o.value.toString()
                                    )
                                )}
                                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                                styles={{
                                    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                                    control: (b) => ({ ...b, borderRadius: "12px", borderColor: "#dce3ef", background: "#f4f6fb", fontSize: "13px", minHeight: "42px" }),
                                    multiValue: (b) => ({ ...b, borderRadius: "8px", background: "#e0f4f4" }),
                                    multiValueLabel: (b) => ({ ...b, color: "#065050", fontSize: "11px", fontWeight: "600" }),
                                    multiValueRemove: (b) => ({ ...b, color: "#0e7c7b", ":hover": { background: "#b0dede", color: "#065050" } }),
                                    menuList: (b) => ({ ...b, maxHeight: 220, overflowY: "auto", color: "black" }),
                                    groupHeading: (b) => ({ ...b, fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }),
                                }}
                            />
                        )}
                    />

                    {/* Selected test groups preview */}
                    {selectedByGroup.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {selectedByGroup.map((group) => {
                                const cat = CAT_COLOR[group.label] ?? { color: "#0f2244", bg: "#eef1f9" };
                                return (
                                    <div key={group.label} className="rounded-xl px-3 py-1.5 flex items-center gap-1.5"
                                        style={{ background: cat.bg, border: `1.5px solid ${cat.color}30` }}>
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.color }}>
                                            {group.label}
                                        </span>
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                                            style={{ background: cat.color }}>
                                            {group.selected.length}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Additional print-only tests ── */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background: "#f8f9fc", border: "1.5px solid #eef1f9" }}>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap" style={{ color: "#8a99b8" }}>
                            Print-Only External Tests
                        </span>
                        <span className="flex-1 h-px" style={{ background: "#eef1f9" }} />
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={addInput}
                            onChange={(e) => setAddInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter external test name, press Enter…"
                            className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none"
                            style={{ background: "white", border: "1.5px solid #dce3ef", color: "#0f2244" }}
                        />
                        <button
                            type="button"
                            onClick={addTest}
                            disabled={!normalizeLabel(addInput)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors disabled:opacity-40"
                            style={{ background: "#e0f4f4", color: "#065050" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#b0dede"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e0f4f4"; }}
                        >
                            <Plus size={13} /> Add
                        </button>
                    </div>

                    {additionalTests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {additionalTests.map((t) => (
                                <span
                                    key={t}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold"
                                    style={{ background: "white", border: "1.5px solid #b9c9e1", color: "#1a2a45" }}
                                >
                                    {t}
                                    <button type="button" onClick={() => setAdditionalTests((p) => p.filter((x) => x !== t))}
                                        className="transition-colors" style={{ color: "#8a99b8" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c8102e"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8a99b8"; }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-[11px]" style={{ color: "#8a99b8" }}>
                        These tests won&apos;t trigger any clinic workflow — for external lab print only.
                    </p>
                </div>

                {/* ── Print button ── */}
                <button
                    type="button"
                    onClick={() => void handlePrint()}
                    // disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-colors disabled:opacity-40"
                    style={{ background: "#f3eefb", color: "#7c4dab", border: "1.5px solid #e0d4f5" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#ede4fa"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f3eefb"; }}
                >
                    <Printer size={13} /> Print Laboratory Request
                </button>

                {(labErrors.test?.message ?? printError) && (
                    <p className="text-[10.5px]" style={{ color: "#c8102e" }}>
                        {labErrors.test?.message ?? printError}
                    </p>
                )}

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
                        disabled={isEditMode ? UpdateIsPending : CreateIsPending}
                        className="px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #0e7c7b, #065050)" }}>
                        {UpdateIsPending || CreateIsPending ? "Submitting…" : "Submit Lab Request ✓"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LaboratoryRequestModal;
