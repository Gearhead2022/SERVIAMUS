"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    FileCheck, Calendar, User,
    AlertCircle, Printer,
} from "lucide-react";
import { PatientProps } from "@/types/PatientTypes";
import Select from "react-select";
import { useMedicalCertificateResult } from "@/hooks/Consultation/useConsultation";
import { MedCertRequestProps } from "@/types/ConsultationTypes";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Label from "@/components/ui/label";
import Input from "@/components/ui/Input";
import SweetAlert from "@/utils/SweetAlert";
import { todayPH } from "@/utils/Date";
import { useGetAllUsers } from "@/hooks/Patient/usePatientRegistration";
import { UsersProps } from "@/types/RequestTypes";

type Option = {
    label: string;
    value: number;
};

const userOptions = (UserList: UsersProps[]): Option[] => {
    return UserList.map((user) => ({
        label: user.name + " " + user.title,
        value: user.user_id,
    }));
};

const inputCls =
    "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";


const medCertSchema = z.object({
    mcr_id: z.number(),
    purpose: z.string().min(1, "Purpose is required"),
    impression: z.string().optional(),
    recommendation: z.string().optional(),
    physician: z.number(),
    patient_id: z.number(),
    result_date: z.string().min(1, "Date is required"),
});

type MedCertFormValues = z.infer<typeof medCertSchema>;

interface MedCertProps {
    mcrId: number;
    patient: PatientProps | undefined;
    requestEntry: MedCertRequestProps | undefined;
    onClose: () => void;
}

const MedicalCertificate: React.FC<MedCertProps> = ({
    mcrId,
    patient,
    requestEntry,
    onClose,
}) => {

    const { mutateAsync: request } = useMedicalCertificateResult(onClose);
    const doctorAssigned = requestEntry?.doctor;
    const { data: UserList } = useGetAllUsers();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<MedCertFormValues>({
        resolver: zodResolver(medCertSchema),
        defaultValues: {
            mcr_id: mcrId,
            purpose: requestEntry?.purpose,
            physician: requestEntry?.physician,
            patient_id: patient?.patient_id,
            result_date: todayPH(),
        },
    });

    const purposeOptions = [
        { value: "Fit To Work", label: "Fit to work" },
        { value: "Medical Assistance", label: "Medical Assistance" }
    ]


    const options = userOptions(UserList ?? []);

    // console.log('error', errors);

    // console.log("doctor", requestEntry);

    const onSubmit = async (data: MedCertFormValues) => {
        await SweetAlert.confirmationAlert2(
            "Are you sure?",
            `You are about to submit this request.`,
        );
        await request(data);
    };


    return (
        <div className="flex flex-col font-['DM_Sans'] bg-white">

            {/* ── Patient info band ── */}
            <div className="flex-shrink-0 flex items-center justify-between gap-5 px-6 py-5 flex-wrap"
                style={{ background: "#f7f8fc", borderBottom: "1.5px solid #dce3ef" }}>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0f2244 0%, #1a3560 100%)", boxShadow: "0 4px 14px rgba(15,34,68,0.2)" }}>
                        <User />
                    </div>
                    <div>
                        <h2 className="text-[#0f2244] text-xl leading-tight"
                            style={{ fontFamily: "'DM Serif Display', serif" }}>
                            {patient?.name}
                        </h2>
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                            {patient?.patient_code && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                    style={{ background: "#eef1f9", color: "#0f2244" }}>
                                    {patient?.patient_code}
                                </span>
                            )}
                            {patient?.age && <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.age} yrs</span>}
                            {patient?.sex && <span className="text-[11px]" style={{ color: "#6b7da0" }}>{patient.sex}</span>}
                        </div>
                    </div>
                </div>

                {/* Request meta */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]">Request ID</p>
                        <p className="text-[12px] font-bold font-mono" style={{ color: "#0f2244" }}>
                            MCR-{String(mcrId).padStart(5, "0")}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]">Date</p>
                        <div className="flex items-center gap-1 justify-end">
                            <Calendar size={11} style={{ color: "#8a99b8" }} />
                            <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{todayPH()}</p>
                        </div>
                    </div>
                    {doctorAssigned?.name && (
                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a99b8]">Issued By</p>
                            <div className="flex items-center gap-1 justify-end">
                                <User size={11} style={{ color: "#8a99b8" }} />
                                <p className="text-[12px] font-semibold" style={{ color: "#1a2a45" }}>{doctorAssigned.name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <form id="med-cert-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
                <div className="flex-1 overflow-y-auto" style={{ background: "#f8f9fc" }}>

                    <div className="bg-white rounded-2xl overflow-hidden"
                        style={{ border: "1.5px solid #dce3ef", boxShadow: "0 1px 4px rgba(15,34,68,0.05)" }}>
                        <div className="flex items-center gap-3 px-5 py-4"
                            style={{ borderBottom: "1px solid #f0f3fa", background: "#f7f8fc" }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "#eef1f9" }}>
                                <FileCheck size={15} style={{ color: "#0f2244" }} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#0f2244" }}>
                                    Certificate Details
                                </p>
                                <p className="text-[10.5px] mt-0.5" style={{ color: "#8a99b8" }}>
                                    Complete all required fields before issuing
                                </p>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Purpose <span style={{ color: "#c8102e" }}>*</span></Label>
                                    <Controller
                                        control={control}
                                        name="purpose"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={purposeOptions}
                                                placeholder="— Select Purpose —"
                                                className={`w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5`}
                                                classNamePrefix="react-select"
                                                isClearable

                                                onChange={(selected) =>
                                                    field.onChange(selected ? selected.value : null)
                                                }

                                                value={purposeOptions.find(
                                                    (opt) => opt.value === field.value
                                                ) || null}

                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        maxHeight: 200,
                                                        overflowY: "auto",
                                                        color: 'black',
                                                    }),
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Label>
                                        Result / Issue Date <span style={{ color: "#c8102e" }}>*</span>
                                    </Label>
                                    <div className="bg-[#f0f3fa] p-2">
                                        <Input type="date"
                                            className="bg-white w-full border border-[1.5px]! border-red! rounded-lg! "
                                            {...register('result_date')}
                                            error={errors.result_date?.message}>
                                        </Input>
                                    </div>
                                </div>
                            </div>

                            {/* Impression */}
                            <div>
                                <Textarea rows={4}
                                    label="Medical Impression / Findings"
                                    {...register("impression")}
                                    placeholder="Describe the patient's medical impression, physical examination findings, or relevant clinical notes…"
                                    error={errors.impression?.message} />
                                <p className="text-[10.5px] mt-1" style={{ color: "#b0bcd4" }}>
                                    e.g. Patient is apparently well and healthy. No acute findings noted.
                                </p>
                            </div>

                            {/* Recommendation */}
                            <div>
                                <Textarea rows={4}
                                    label="Recommendation"
                                    {...register("recommendation")}
                                    placeholder="State any recommendations, restrictions, or clearance details…"
                                    error={errors.recommendation?.message} />
                                <p className="text-[10.5px] mt-1" style={{ color: "#b0bcd4" }}>
                                    e.g. Fit to work. No restriction. Advised to follow-up on April 30, 2026.
                                </p>
                            </div>
                            <div className="w-[70%]">
                                <Label>Assigned Physician</Label>

                                <Controller
                                    control={control}
                                    name="physician"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={options}
                                            placeholder="— Select Physician —"
                                            className={`text-sm ${inputCls}`}
                                            classNamePrefix="react-select"
                                            isClearable

                                            onChange={(selected) =>
                                                field.onChange(selected ? selected.value : null)
                                            }

                                            value={options.find(
                                                (opt) => opt.value === field.value
                                            ) || null}

                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                menuList: (base) => ({
                                                    ...base,
                                                    maxHeight: 200,
                                                    overflowY: "auto",
                                                    color: 'black',
                                                }),
                                            }}
                                        />
                                    )}
                                />
                                {errors.physician && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.physician.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
                        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                        <p className="text-[11.5px]" style={{ color: "#92400e" }}>
                            This certificate is issued based on the patient`s consultation and examination records.
                            It is a legal medical document and should only be issued by an authorized health professional.
                        </p>
                    </div>


                </div>

                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 flex-wrap gap-3"
                    style={{ borderTop: "1px solid #eef1f9", background: "#f7f8fc" }}>

                    <p className="text-[11px]" style={{ color: "#b0bcd4" }}>
                        MCR-{String(mcrId).padStart(5, "0")} · Patient #{patient?.patient_id}
                    </p>

                    <div className="flex items-center gap-2.5">
                        <Button type="submit" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="secondary" icon={<Printer size={15} />}>Print Preview</Button>
                        <Button variant="primary" >Submit</Button>
                    </div>
                </div>
            </form>
        </div >
    );
};

export default MedicalCertificate;