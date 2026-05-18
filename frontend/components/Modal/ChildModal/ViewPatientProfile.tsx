"use client";

import { PatientProps } from "@/types/PatientTypes";
import {
    User, Hash, Shield, Calendar, MapPin,
    Phone, Cross, Heart,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────

function Field({
    icon: Icon,
    label,
    value,
    wide = false,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    wide?: boolean;
}) {
    return (
        <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
            <div className="flex items-center gap-1.5">
                <Icon size={10} style={{ color: "#8a99b8" }} />
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>
                    {label}
                </p>
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "#0f2244" }}>
                {value || "—"}
            </p>
        </div>
    );
}

function Pill({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: bg, color }}
        >
            {children}
        </span>
    );
}

// ── main component ───────────────────────────────────────────────────────────

const ViewPatientProfile: React.FC<{
    patient: PatientProps;
    onClose: () => void;
}> = ({ patient }) => {

    const initials = patient.name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    const isFemale = patient.sex?.toLowerCase() === "female";
    const sexColor = isFemale
        ? { color: "#be185d", bg: "#fdf2f8" }
        : { color: "#1d4ed8", bg: "#eff6ff" };

    const birthDate = patient.birth_date
        ? new Date(patient.birth_date).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    return (
        <div className="font-['DM_Sans'] bg-white">

            {/* ── Identity strip — avatar + quick pills ── */}
            <div
                className="relative px-6 py-5 flex items-center gap-4 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0f2244 0%, #1a3560 55%, #0e7c7b 100%)",
                }}
            >
                {/* decorative blobs */}
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                <div className="absolute -bottom-10 left-4 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: "rgba(14,124,123,0.15)" }} />

                {/* avatar */}
                <div
                    className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.14)",
                        border: "1.5px solid rgba(255,255,255,0.22)",
                        fontFamily: "'DM Serif Display', serif",
                    }}
                >
                    {initials}
                </div>

                {/* name + pills */}
                <div className="relative z-10">
                    <p
                        className="text-[17px] font-bold text-white leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        {patient.name}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                        #{patient.patient_code}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <Pill color="rgba(255,255,255,0.9)" bg={sexColor.bg + "33"}>
                            <Heart size={9} style={{ color: "rgba(255,255,255,0.8)" }} />
                            <span className="capitalize" style={{ color: "rgba(255,255,255,0.9)" }}>{patient.sex}</span>
                        </Pill>
                        <Pill color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.12)">
                            {patient.age} yrs old
                        </Pill>
                        {patient.religion && (
                            <Pill color="rgba(255,255,255,0.85)" bg="rgba(255,255,255,0.09)">
                                <Cross size={8} style={{ color: "rgba(255,255,255,0.7)" }} />
                                {patient.religion}
                            </Pill>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Section label ── */}
            <div
                className="px-6 py-2.5 flex items-center gap-3"
                style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}
            >
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#8a99b8" }}>
                    Patient Information
                </span>
                <div className="flex-1 h-px" style={{ background: "#eef1f9" }} />
            </div>

            {/* ── Info grid ── */}
            <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <Field icon={Hash} label="Patient ID" value={`#${patient.patient_code}`} />
                    <Field icon={Calendar} label="Age" value={`${patient.age} years`} />
                    <Field icon={User} label="Sex" value={<span className="capitalize">{patient.sex}</span>} />
                    <Field icon={Shield} label="PhilHealth ID" value={patient.philhealth_id ?? "Not provided"} />
                    {birthDate && (
                        <Field icon={Calendar} label="Birth Date" value={birthDate} />
                    )}
                    {patient.religion && (
                        <Field icon={Cross} label="Religion" value={patient.religion} />
                    )}
                    <Field icon={Phone} label="Contact Number" value={patient.contact_number} />
                    <Field icon={MapPin} label="Address" value={patient.address} wide />
                </div>
            </div>

            {/* ── Quick stats footer ── */}
            <div
                className="px-6 py-4 grid grid-cols-3 gap-3"
                style={{ background: "#f8f9fc", borderTop: "1px solid #eef1f9" }}
            >
                {[
                    { label: "Consultations", value: "—", color: "#0e7c7b", bg: "#e0f4f4" },
                    { label: "Lab Requests", value: "—", color: "#7c4dab", bg: "#f3eefb" },
                    { label: "Last Visit", value: "—", color: "#c8102e", bg: "#fdf0f2" },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className="rounded-xl px-3 py-2.5 text-center" style={{ background: bg }}>
                        <p className="text-[18px] font-bold" style={{ color, fontFamily: "'DM Serif Display', serif" }}>
                            {value}
                        </p>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider mt-0.5" style={{ color }}>
                            {label}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ViewPatientProfile;