"use client";
import { MedCertFormValues, RegisterConsultationFormValues, RegisterFollowupFormValues } from "@/schemas/consultation.schema";
import Image from "next/image";
import { PrescriptionValues } from "@/schemas/consultation.schema";
import { useGetPatientById } from "@/hooks/Patient/usePatientRegistration";
import { useGetDoctorById, useGetInitialConsultationWithFollowups } from "@/hooks/Consultation/useConsultation";
import { formattedCurrentDate } from "@/utils/Date";
import { formatDate } from "@/utils/Date";

type Props = {
    type: "consult-result" | "prescription" | "med-cert" | "followup-result";
    form: RegisterConsultationFormValues | PrescriptionValues | MedCertFormValues | RegisterFollowupFormValues;
    doctorId?: number;
    template?: "temp-1" | "default";
    isSaved?: boolean;
};

export default function ConsultResultDocument({
    type,
    form,
    doctorId,
    template,
    isSaved,
}: Props) {
    // console.log('forms passed', doctorId)
    if (type === "consult-result") {
        return (
            <MedicalFormPreview
                form={form as RegisterConsultationFormValues}
            />
        );
    }

    if (type === "prescription" && doctorId && template === 'temp-1') {
        return (
            <MedicalRxPreview
                form={form as PrescriptionValues}
                doctorId={doctorId}
            />
        );
    }

    if (type === "prescription" && doctorId && template === 'default') {
        return (
            <MedicalRxPreviewVer2
                form={form as PrescriptionValues}
                doctorId={doctorId}
            />
        );
    }
    if (type === "med-cert" && doctorId && template === 'temp-1') {
        return (
            <MedicalCertificatePreview
                form={form as MedCertFormValues}
                doctorId={doctorId}
            />
        );
    }
    if (type === "med-cert" && doctorId && template === 'default') {
        return (
            <MedicalCertificatePreviewVer2
                form={form as MedCertFormValues}
                doctorId={doctorId}
            />
        );
    }
    if (type === "followup-result") {
        // console.log("Rendering FollowupFormPreview", form);
        return (
            <FollowupFormPreview
                form={form as RegisterFollowupFormValues}
                isSaved={!!isSaved}
            />
        );
    }

    return null;
}

function MedicalCertificatePreview({ form, doctorId }: { form: MedCertFormValues, doctorId: number }) {

    const { data: patientInfo } = useGetPatientById(form.patient_id);
    const { data: doctorInfo } = useGetDoctorById(doctorId);

    const ifirstLine = form.impression?.slice(0, 63);
    const isecondLine = form.impression?.slice(80);

    const rfirstLine = form.recommendation?.slice(0, 55);
    const rsecondLine = form.recommendation?.slice(80);

    return (
        <div className="print-document bg-gray-100 flex items-center justify-center font-serif">
            <div
                className="relative print-page paper-b6 bg-white border border-gray-300 flex flex-col"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
                {/* HEADER */}
                <div
                    className="pb-2"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[70px_1fr_70px] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus3.png"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-18 w-18 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[22px] scale-y-[1.5] font-bold text-red-600 uppercase">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[10px] text-black uppercase tracking-tight leading-snug">
                                FAMILY AND COMMUNITY MEDICINE
                            </p>
                            <p className="text-[10px] text-black uppercase tracking-tight leading-snug">
                                FELLOW AND DIPLOMATE OF THE PHILIPPINE ACADEMY OF FAMILY PHYSICIAN
                            </p>

                            <p className="text-[14px] font-bold uppercase text-blue-900 tracking-tight">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[10px] italic text-gray-700 ">
                                Puer Sanctus VI Bldg., Cors. Rosario – Verbena Sts.,
                                Brgy. 33, Bacolod City, 6100
                            </p>

                        </div>

                        {/* RIGHT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={48}
                                height={48}
                                className="h-17 w-17 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="flex flex-nowrap items-center gap-x-1 text-[10px] scale-y-150 pb-1 text-gray-700">
                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/telephone-call.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            (034) 474 6678
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/facebook.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus Medical Clinic and Laboratory
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/email.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus2022@gmail.com
                        </span>
                    </div>
                </div>
                <div className="border-b border-blue-900"></div>

                <div className="mt-6">
                    <div className="text-[15px] text-black">
                        <div>To Whom it may concern:</div>

                        <br />

                        <div className="flex items-end gap-2">
                            <span className="indent-5 shrink-0">
                                This certify that Mr./Ms./Mrs.,
                            </span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px] indent-2">{patientInfo?.name}</div>,
                        </div>

                        <div className="flex items-end gap-2 mt-2">
                            <span className="shrink-0">Age</span>

                            <div className="w-15 border-b border-gray-500 min-h-[20px] text-center">{patientInfo?.age}</div>

                            <span className="shrink-0">Address</span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px]">{patientInfo?.address}</div>
                        </div>

                        <div className="flex items-end gap-2 mt-2">
                            <span className="shrink-0">
                                was seen and examined at my clinic on
                            </span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px] indent-2">{formattedCurrentDate()}</div>.
                        </div>

                        <br />
                        <div>
                            <div className="flex items-start gap-2">
                                <span className="shrink-0">Impression:</span>

                                <div className="flex-1 border-b border-gray-500 min-h-[24px] px-1">
                                    {ifirstLine}
                                </div>
                            </div>

                            <div className="border-b border-gray-500 min-h-[24px] mt-2 px-1">
                                {isecondLine}
                            </div>
                        </div>

                        <br />
                        <div>
                            <div className="flex items-start gap-2">
                                <span className="shrink-0">Recommendation:</span>

                                <div className="flex-1 border-b border-gray-500 min-h-[24px] px-1">
                                    {rfirstLine}
                                </div>
                            </div>

                            <div className="border-b border-gray-500 min-h-[24px] mt-2 px-1">
                                {rsecondLine}
                            </div>
                        </div>

                        <br />

                        <div className="indent-5">
                            Above impression is based on clinical signs/symptoms
                            presented and/or seen at time of examination.
                        </div>
                    </div>
                </div>

                {/* LICENSE NUMBER */}
                <div className="mt-17 flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <span className="whitespace-nowrap"></span>
                    <div className="w-80 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-65 min-h-[18px] px-1 flex text-center gap-2">
                        <span className="font-normal whitespace-nowrap">
                            Lic. No.
                        </span>
                        <span>{doctorInfo?.license_no ?? "—"}</span>

                        <span className="font-normal">|</span>

                        <span className="font-normal whitespace-nowrap">
                            PTR
                        </span>
                        <span>{doctorInfo?.ptr_no ?? "—"}</span>
                    </div>
                </div>
                <div className="absolute bottom-3 left-0 w-full flex font-bold justify-center text-[13px] italic text-gray-900">
                    <span>NOT TO BE USED FOR LEGAL PURPOSES</span>
                </div>
            </div>
        </div>
    );
}

function MedicalCertificatePreviewVer2({ form, doctorId }: { form: MedCertFormValues, doctorId: number }) {

    const { data: patientInfo } = useGetPatientById(form.patient_id);
    const { data: doctorInfo } = useGetDoctorById(doctorId);

    const ifirstLine = form.impression?.slice(0, 63);
    const isecondLine = form.impression?.slice(80);

    const rfirstLine = form.recommendation?.slice(0, 55);
    const rsecondLine = form.recommendation?.slice(80);

    return (
        <div className="print-document bg-gray-100 flex items-center justify-center font-serif">
            <div
                className="relative print-page paper-b6 bg-white border border-gray-300 flex flex-col"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
                {/* HEADER */}
                <div
                    className="pb-2"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[70px_1fr] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-17 w-17 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight pr-[40px]">

                            <p className="text-[19px] font-black text-red-600 uppercase scale-y-130">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[13px] font-bold uppercase text-blue-900 scale-y-180 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[11px] italic text-gray-700">
                                Puer Sanctus VI Bldg., Cors. Rosario – Verbena Sts.,
                                Brgy. 33, Bacolod City, 6100
                            </p>

                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="flex flex-nowrap items-center gap-x-1 text-[10px] scale-y-150 pb-1 text-gray-700">

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/telephone-call.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            (034) 474 6678
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/facebook.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus Medical Clinic and Laboratory
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/email.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus2022@gmail.com
                        </span>
                    </div>
                </div>
                <div className="border-b border-blue-900"></div>

                <div className="mt-6">
                    <div className="text-[15px] text-black">
                        <div>To Whom it may concern:</div>

                        <br />

                        <div className="flex items-end gap-2">
                            <span className="indent-5 shrink-0">
                                This certify that Mr./Ms./Mrs.,
                            </span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px] indent-2">{patientInfo?.name}</div>,
                        </div>

                        <div className="flex items-end gap-2 mt-2">
                            <span className="shrink-0">Age</span>

                            <div className="w-15 border-b border-gray-500 min-h-[20px] text-center">{patientInfo?.age}</div>

                            <span className="shrink-0">Address</span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px]">{patientInfo?.address}</div>
                        </div>

                        <div className="flex items-end gap-2 mt-2">
                            <span className="shrink-0">
                                was seen and examined at my clinic on
                            </span>

                            <div className="flex-1 border-b border-gray-500 min-h-[20px] indent-2">{formattedCurrentDate()}</div>.
                        </div>

                        <br />
                        <div>
                            <div className="flex items-start gap-2">
                                <span className="shrink-0">Impression:</span>

                                <div className="flex-1 border-b border-gray-500 min-h-[24px] px-1">
                                    {ifirstLine}
                                </div>
                            </div>

                            <div className="border-b border-gray-500 min-h-[24px] mt-2 px-1">
                                {isecondLine}
                            </div>
                        </div>

                        <br />
                        <div>
                            <div className="flex items-start gap-2">
                                <span className="shrink-0">Recommendation:</span>

                                <div className="flex-1 border-b border-gray-500 min-h-[24px] px-1">
                                    {rfirstLine}
                                </div>
                            </div>

                            <div className="border-b border-gray-500 min-h-[24px] mt-2 px-1">
                                {rsecondLine}
                            </div>
                        </div>

                        <br />

                        <div className="indent-5">
                            Above impression is based on clinical signs/symptoms
                            presented and/or seen at time of examination.
                        </div>
                    </div>
                </div>

                {/* LICENSE NUMBER */}
                <div className="mt-17 flex justify-end items-end gap-2 text-[15px] text-gray-900">
                    <span className="whitespace-nowrap"></span>
                    <div className="w-90 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-70 min-h-[18px] px-1 flex text-center gap-2">
                        <span className="font-normal whitespace-nowrap">
                            Lic. No.
                        </span>
                        <span>{doctorInfo?.license_no ?? "—"}</span>

                        <span className="font-normal">|</span>

                        <span className="font-normal whitespace-nowrap">
                            PTR
                        </span>
                        <span>{doctorInfo?.ptr_no ?? "—"}</span>
                    </div>
                </div>
                <div className="absolute bottom-3 left-0 w-full flex font-bold justify-center text-[13px] italic text-gray-900">
                    <span>NOT TO BE USED FOR LEGAL PURPOSES</span>
                </div>
            </div>
        </div>
    );
}

function MedicalRxPreview({ form, doctorId }: { form: PrescriptionValues, doctorId: number }) {

    const { data: patientInfo } = useGetPatientById(form.patient_id);
    const { data: doctorInfo } = useGetDoctorById(doctorId);
    // console.log('from preview', form)

    return (
        <div className="print-document bg-gray-100 flex items-start justify-center font-serif">
            <div
                className="relative paper-b6 bg-white border border-gray-300 flex flex-col"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {/* HEADER */}
                <div
                    className="pb-2"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[70px_1fr_70px] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus3.png"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-18 w-18 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[22px] scale-y-[1.5] font-bold text-red-600 uppercase">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[10px] text-black uppercase tracking-tight leading-snug">
                                FAMILY AND COMMUNITY MEDICINE
                            </p>
                            <p className="text-[10px] text-black uppercase tracking-tight leading-snug">
                                FELLOW AND DIPLOMATE OF THE PHILIPPINE ACADEMY OF FAMILY PHYSICIAN
                            </p>

                            <p className="text-[14px] font-bold uppercase text-blue-900 tracking-tight">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[10px] italic text-gray-700 ">
                                Puer Sanctus VI Bldg., Cors. Rosario – Verbena Sts.,
                                Brgy. 33, Bacolod City, 6100
                            </p>

                        </div>

                        {/* RIGHT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={48}
                                height={48}
                                className="h-17 w-17 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="flex flex-nowrap items-center gap-x-1 text-[10px] scale-y-150 pb-1 text-gray-700">
                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/telephone-call.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            (034) 474 6678
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/facebook.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus Medical Clinic and Laboratory
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/email.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus2022@gmail.com
                        </span>
                    </div>
                </div>
                <div className="border-b-2 border-blue-900"></div>

                {/* PATIENT INFO */}
                <div className="mt-6 flex flex-col gap-2 text-[13px] text-gray-900">
                    {/* Name */}
                    <div className="flex items-end gap-2">
                        <span className="font-semibold whitespace-nowrap">Name:</span>
                        <div className="flex-1 border-b border-gray-500 tracking-widest font-bold min-h-[20px] px-1">
                            {patientInfo?.name}
                        </div>
                    </div>

                    {/* Age / Sex / Date */}
                    <div className="flex items-end gap-6">
                        <div className="flex items-end gap-2">
                            <span className="font-semibold">Age:</span>
                            <div className="w-20 border-b border-gray-500 min-h-[20px] pl-2 px-1">{patientInfo?.age}</div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="font-semibold">Sex:</span>
                            <div className="w-24 border-b border-gray-500 min-h-[20px] pl-2 px-1">{patientInfo?.sex}</div>
                        </div>
                        <div className="flex items-end gap-2 ml-auto">
                            <span className="font-semibold">Date:</span>
                            <div className="w-28 border-b border-gray-500 min-h-[20px] px-1">{formattedCurrentDate()}</div>
                        </div>
                    </div>
                </div>

                {/* Rx SYMBOL + WRITING AREA */}
                <div className="mt-2 flex-1">
                    <div
                        className="text-5xl italic text-red-600 leading-none mb-2"
                        style={{ fontFamily: "'Palatino Linotype', Palatino, serif" }}
                    >
                        &#x211E;
                    </div>

                    {/* Prescription content or blank lines */}
                    {form.medicines && form.medicines.length > 0 ? (
                        form.medicines.map((m, index) => (
                            <div key={index} className="mb-4 px-[20px]">

                                {/* MED NAME */}
                                <div className="font-semibold text-black text-[17px] flex justify-between">
                                    <p>{index + 1}. {m.medicine_name}</p> <p>{m.strength && `(${m.strength})`}</p>
                                </div>

                                {/* RX LINE (classic doctor style) */}
                                <div className="ml-4 text-[14px] leading-relaxed text-black">
                                    <div className="uppercase tracking-wider">
                                        ( {m.brand_name} )
                                    </div>

                                    {m.quantity && (
                                        <div className="text-end">
                                            # {m.quantity}
                                        </div>
                                    )}

                                    {m.instruction && (
                                        <div className="text-black">
                                            Sig: {m.instruction}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))

                    ) : (
                        <div className="flex flex-col gap-8 mt-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border-b border-gray-300 h-5"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* LICENSE NUMBER */}
                <div className="mt-17 flex justify-end items-end gap-2 text-[15px] text-gray-900">
                    <span className="whitespace-nowrap"></span>
                    <div className="w-90 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name.toUpperCase()} {doctorInfo?.title?.toUpperCase()}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-70 min-h-[11px] px-1 flex text-center gap-2">
                        <span className="font-normal whitespace-nowrap">
                            Lic. No.
                        </span>
                        <span>{doctorInfo?.license_no ?? "—"}</span>

                        <span className="font-normal">|</span>

                        <span className="font-normal whitespace-nowrap">
                            PTR
                        </span>
                        <span>{doctorInfo?.ptr_no ?? "—"}</span>
                    </div>
                </div>
            </div>
        </div >
    );
}

function MedicalRxPreviewVer2({ form, doctorId }: { form: PrescriptionValues, doctorId: number }) {

    const { data: patientInfo } = useGetPatientById(form.patient_id);
    const { data: doctorInfo } = useGetDoctorById(doctorId);

    return (
        <div className="print-document bg-gray-100 flex items-center justify-center font-serif">
            <div
                className="relative print-page paper-b6 bg-white border border-gray-300 flex flex-col"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
                {/* HEADER */}
                <div
                    className="pb-2"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[70px_1fr] items-center flex justi">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-17 w-17 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight pr-[40px]">

                            <p className="text-[22px] scale-y-[1.5] font-bold text-red-600 uppercase">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[13px] font-bold uppercase text-blue-900 scale-y-180 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[12px] italic text-gray-700 tracking-tight">
                                Puer Sanctus VI Bldg., Cors. Rosario – Verbena Sts.,
                                Brgy. 33, Bacolod City, 6100
                            </p>

                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="flex flex-nowrap items-center gap-x-1 text-[10px] scale-y-150 pb-1 text-gray-700">

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/telephone-call.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            (034) 474 6678
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/facebook.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus Medical Clinic and Laboratory
                        </span>

                        ┃

                        <span className="flex gap-1 items-center text-nowrap">
                            <Image
                                src="/images/email.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-3 w-5"
                                priority
                                unoptimized
                            />
                            Serviamus2022@gmail.com
                        </span>
                    </div>
                </div>
                <div className="border-b-2 border-blue-900"></div>

                {/* PATIENT INFO */}
                <div className="mt-6 flex flex-col gap-2 text-[13px] text-gray-900">
                    {/* Name */}
                    <div className="flex items-end gap-2">
                        <span className="font-semibold whitespace-nowrap">Name:</span>
                        <div className="flex-1 border-b border-gray-500 tracking-widest font-bold min-h-[20px] px-1">
                            {patientInfo?.name}
                        </div>
                    </div>

                    {/* Age / Sex / Date */}
                    <div className="flex items-end gap-6">
                        <div className="flex items-end gap-2">
                            <span className="font-semibold">Age:</span>
                            <div className="w-20 border-b border-gray-500 min-h-[20px] px-1">{patientInfo?.age}</div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="font-semibold">Sex:</span>
                            <div className="w-24 border-b border-gray-500 min-h-[20px] px-1">{patientInfo?.sex}</div>
                        </div>
                        <div className="flex items-end gap-2 ml-auto">
                            <span className="font-semibold">Date:</span>
                            <div className="w-28 border-b border-gray-500 min-h-[20px] px-1">{formattedCurrentDate()}</div>
                        </div>
                    </div>
                </div>

                {/* Rx SYMBOL + WRITING AREA */}
                <div className="mt-6 flex-1">
                    <div
                        className="text-5xl italic text-gray-900 leading-none mb-2"
                        style={{ fontFamily: "'Palatino Linotype', Palatino, serif" }}
                    >
                        &#x211E;
                    </div>

                    {/* Prescription content or blank lines */}
                    {form.medicines && form.medicines.length > 0 ? (
                        form.medicines.map((m, index) => (
                            <div key={index} className="mb-4 px-[20px]">

                                {/* MED NAME */}
                                <div className="font-semibold text-black text-[17px] flex justify-between">
                                    <p>{index + 1}. {m.medicine_name}</p> <p>{m.strength && `(${m.strength})`}</p>
                                </div>

                                {/* RX LINE (classic doctor style) */}
                                <div className="ml-4 text-[14px] leading-relaxed text-black">
                                    <div className="uppercase tracking-wider">
                                        ( {m.brand_name} )
                                    </div>

                                    {m.quantity && (
                                        <div className="text-end">
                                            # {m.quantity}
                                        </div>
                                    )}

                                    {m.instruction && (
                                        <div className="text-black">
                                            Sig: {m.instruction}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))

                    ) : (
                        <div className="flex flex-col gap-8 mt-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border-b border-gray-300 h-5"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* LICENSE NUMBER */}
                <div className="mt-17 flex justify-end items-end gap-2 text-[15px] text-gray-900">
                    <span className="whitespace-nowrap"></span>
                    <div className="w-90 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name.toUpperCase()} {doctorInfo?.title?.toUpperCase()}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-70 min-h-[11px] px-1 flex text-center gap-2">
                        <span className="font-normal whitespace-nowrap">
                            Lic. No.
                        </span>
                        <span>{doctorInfo?.license_no ?? "—"}</span>

                        <span className="font-normal">|</span>

                        <span className="font-normal whitespace-nowrap">
                            PTR
                        </span>
                        <span>{doctorInfo?.ptr_no ?? "—"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SectionHeader = ({
    title,
}: {
    title: string;
}) => (
    <div className="bg-blue-100 border-b border-black px-2 py-1 font-bold text-sm">
        {title}
    </div>
);

const CheckboxItem = ({
    checked,
    label,
}: {
    checked?: boolean;
    label: string;
}) => (
    <span className="flex items-center gap-2">
        <span className="w-4 text-center">
            {checked ? "☑" : "☐"}
        </span>
        <span>{label}</span>
    </span>
);

function MedicalFormPreview({ form }: { form: RegisterConsultationFormValues }) {
    return (
        <div className="print-document bg-gray-100 flex items-center justify-center">
            {/* LONG BOND PAPER */}
            <div
                className="print-page paper-legal bg-white w-full">
                <div
                    className="result-header border-b border-slate-300 pb-3"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[5rem_1fr_5rem] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className=" h-20 w-30 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="min-w-0 text-center leading-tight">

                            <h1 className=" text-[20px] font-black uppercase text-blue-800">
                                SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
                            </h1>

                            <p className="text-[13px] text-slate-600 tracking-wider">
                                Puer Sanctus VI Building, Corner Rosario-Verbena Streets,
                                Brgy. 33, Bacolod City
                            </p>

                            <div className="flex justify-center mt-3">
                                <h2 className="mt-2 text-[12px] font-bold tracking-[0.1em] text-amber-700! uppercase border-b border-black inline-block">
                                    Patient&apos;s Record
                                </h2>
                            </div>

                            <p className="text-[10px] font-serif font-bold">
                                Initial Consult (A)
                            </p>
                        </div>
                    </div>
                </div>
                {/* PATIENT INFO */}
                <div className="border border-black">
                    {/* ROW 1 */}
                    <div className="grid grid-cols-2 border-b border-black">
                        <div className="px-2 py-1 border-r border-black">
                            <label className="text-sm font-semibold">Name:</label>
                            <div className="border-b border-gray-400 h-5 text-sm pl-5">{form?.name}</div>
                        </div>

                        <div className="px-2 py-1 flex justify-between">
                            <span>
                                <label className="text-sm font-semibold">Age/Sex:</label>
                                <div className="border-b border-gray-400 h-5 text-sm pl-5 flex justify-between w-25"><p>{form?.age}</p> | <p>{form.sex}</p></div>
                            </span>
                            <span>
                                <label className="text-sm font-semibold">Birthday:</label>
                                <div className="border-b border-gray-400 h-5 text-sm pl-5">{formatDate(form?.birth_date)}</div>
                            </span>
                        </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid grid-cols-2 border-b border-black">
                        <div className="px-2 py-1 border-r border-black">
                            <label className="text-sm font-semibold">Address:</label>
                            <div className="pl-5 text-sm">{form.address}</div>
                        </div>

                        <div className="px-2 py-1">
                            <div>
                                <label className="text-sm font-semibold">Religion:</label>
                                <div className="border-b border-gray-400 h-5 pl-5 text-sm">{form.religion}</div>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3 */}
                    <div className="grid grid-cols-2">
                        <div className="px-2 py-1 border-r border-black flex items-center">
                            <label className="text-sm font-semibold">Date:</label>
                            <div className="h-6 pl-5 text-sm flex items-center">{formatDate(form.consultation_date)}</div>
                        </div>

                        <div className="px-2 py-1 flex items-center">
                            <label className="text-sm font-semibold">Contact No:</label>
                            <div className="h-6 pl-5 text-sm flex items-center">{form.contact_number}</div>
                        </div>
                    </div>
                </div>

                {/* CHIEF COMPLAINT */}
                <div className="mt-4">
                    <div className="border border-black px-2 py-1 flex items-center gap-5">
                        <label className="text-sm font-semibold text-nowrap">
                            Chief Complaint:
                        </label>

                        <div className="border-b border-gray-400 text-sm">{form.chief_complaint}</div>
                    </div>
                </div>

                {/* VITAL SIGNS */}
                <div className="mt-4 border border-black">
                    <div className="grid grid-cols-7">
                        <div className="border-r border-black bg-blue-100 px-2 font-bold text-sm">
                            Vital Signs
                        </div>

                        {(() => {
                            const fields = [
                                { label: "BP", value: form.bp },
                                { label: "CR", value: form.cr },
                                { label: "RR", value: form.rr },
                                { label: "T", value: form.temp },
                                { label: "Wt", value: form.wt },
                                { label: "Ht", value: form.ht },
                            ];

                            return fields.map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="border-r last:border-r-0 border-black px-2 py-1"
                                >
                                    <div className="text-sm">{label}</div>
                                    <div className="h-4 border-b border-gray-400 mt-2 flex items-center justify-center text-sm">
                                        {value || "-"}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* HISTORY OF PRESENT ILLNESS */}
                <div className="mt-4 border border-black">
                    <SectionHeader title="History of Present Illness:" />
                    <div className="h-45 p-4">
                        <div className="space-y-4 text-sm">

                            {form.hist_illness}
                        </div>
                    </div>
                </div>

                {/* MEDICAL + FAMILY HISTORY */}
                <div className="grid grid-cols-2 mt-4 border border-black">
                    {/* LEFT */}
                    <div className="border-r border-black">
                        <SectionHeader title="Past Medical History" />

                        <div className="p-4 space-y-2 text-sm">
                            <CheckboxItem
                                checked={form.pmh_allergy}
                                label="FDA"
                            />

                            <CheckboxItem
                                checked={form.pmh_admission}
                                label="Admission"
                            />

                            <CheckboxItem
                                checked={form.pmh_others}
                                label="Others"
                            />

                            <div className="pl-6 border-b border-slate-400 min-h-[20px]">
                                {form.pmh_others_text || "-"}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <SectionHeader title="Family History" />
                        <div className="p-4 pb-4">
                            <div className=" grid grid-cols-2 space-y-2 text-sm">
                                <CheckboxItem checked={form.fh_htn} label="Hypertension" />
                                <CheckboxItem checked={form.fh_dm} label="DM" />
                                <CheckboxItem checked={form.fh_ba} label="BA" />
                                <CheckboxItem checked={form.fh_cancer} label="Cancer" />
                                <CheckboxItem checked={form.fh_others} label="Others" />
                            </div>


                            <div className="pl-6 border-b border-slate-400 min-h-[20px]">
                                {form.fh_others_text || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* OB GYNE + PERSONAL */}
                <div className="grid grid-cols-2 mt-4 border border-t-0 border-black">
                    {/* LEFT */}
                    <div className="border-r border-black">
                        <SectionHeader title="OB-Gyne History" />
                        <div className="p-4 text-sm space-y-1 ">
                            <div className="text-sm">
                                <p>G P ( {form.ob_score} )</p>

                                <div className="ml-4 mt-2 space-y-1 text-sm">

                                    <CheckboxItem
                                        checked={form.ob_nvsd}
                                        label="NVSD"
                                    />

                                    <CheckboxItem
                                        checked={form.ob_cs}
                                        label="CS"
                                    />
                                </div>
                            </div>

                            {(() => {
                                const obFields = [
                                    { label: "Menarche", value: form.menarche },
                                    { label: "Interval", value: form.interval },
                                    { label: "Duration", value: form.duration },
                                    { label: "Amount", value: form.amount },
                                    { label: "Symptoms", value: form.ob_symptoms },
                                ];

                                return obFields.map(({ label, value }) => (
                                    <div key={label}>
                                        <label>{label}:</label>
                                        <div className="pl-5 border-b border-gray-400 min-h-[18px] text-sm">
                                            {value || "-"}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <SectionHeader title="Personal & Social History" />
                        <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <CheckboxItem checked={form.cigarette_use} label="Cigarette Use" />
                            <CheckboxItem checked={form.exercise} label="Exercise" />

                            <CheckboxItem checked={form.alcohol_use} label="Alcohol Use" />
                            <CheckboxItem checked={form.hygiene_prac} label="Good Hygiene" />

                            <CheckboxItem checked={form.drug_use} label="Illicit Drug Use" />
                            <CheckboxItem checked={form.coffee_cons} label="Coffee Consumption" />

                            <CheckboxItem checked={form.soda_cons} label="Soda Consumption" />
                        </div>
                        <div className="px-4 space-y-1 text-sm">
                            {(() => {
                                const fields = [
                                    { label: "Travel History", value: form.travel_history },
                                    { label: "Diet", value: form.diet },
                                    { label: "Stress/Coping Mechanism", value: form.stress },
                                    { label: "Occupation", value: form.occupation },
                                ];

                                return fields.map(({ label, value }) => (
                                    <div key={label}>
                                        <label>{label}:</label>
                                        <div className="pl-5 border-b border-gray-400 min-h-[20px] text-md text-sm">
                                            {value || "-"}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* SECOND PAGE */}
                <div
                    className="pt-8"
                    style={{
                        pageBreakBefore: "always",
                    }}
                >
                    <div className="flex flex-col gap-3">

                        {/* PHYSICAL EXAM */}
                        <div>
                            <SectionHeader title="Physical and Neurologic Examination" />
                            <div
                                className=" whitespace-pre-wrap break-words p-3 border-x border-b border-black text-sm"
                                style={{
                                    minHeight: "170px",
                                }}
                            >
                                {form.examination || "-"}
                            </div>
                        </div>

                        {/* ASSESSMENT */}
                        <div>
                            <SectionHeader title="Assessment" />
                            <div
                                className=" whitespace-pre-wrap break-words p-3 border-x border-b border-black text-sm"
                                style={{
                                    minHeight: "130px",
                                }}
                            >
                                {form.assessment || "-"}
                            </div>
                        </div>

                        {/* PLANS */}
                        <div>
                            <SectionHeader title="Plans" />
                            <div
                                className=" whitespace-pre-wrap break-words p-3 border-x border-b border-black text-sm"
                                style={{
                                    minHeight: "200px",
                                }}
                            >
                                {form.plans || "-"}
                            </div>
                        </div>

                        {/* FAMILY ASSESSMENT */}
                        {/* <div>
                            <SectionHeader title="Family Assessment Tools" />
                            <div className="border-x border-black p-2 font-semibold text-sm">
                                Genogram Family Map
                            </div>
                            <div
                                className=" border-x border-b border-black p-3 text-sm"
                                style={{
                                    minHeight: "320px",
                                }}
                            />
                        </div> */}
                        {/* FAMILY ASSESSMENT */}
                        <div>
                            <div className="grid grid-cols-2">
                                <div className="px-2 py-1 border-r border-black flex items-center bg-blue-100">
                                    <label className="text-sm font-semibold">Follow-up Date:</label>
                                    <div className="h-6 pl-5 text-sm">{formatDate(form.follow_up_date)}</div>
                                </div>

                                <div className="px-2 py-1 flex items-center">
                                    <label className="text-sm font-semibold text-nowrap">Doctor`s Signatute:</label>
                                    <div className="h-6 pl-5 text-sm border-b border-black flex w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function FollowupFormPreview({ form, isSaved }: { form: RegisterFollowupFormValues, isSaved: boolean }) {
    const { data: initialConsults } = useGetInitialConsultationWithFollowups(Number(form.patient_id), Number(form.consultation_id));
    //  console.log('form template', initialConsults)
    return (
        <div className="print-document bg-gray-100 flex items-center justify-center">
            {/* LONG BOND PAPER */}
            <div
                className="print-page paper-legal bg-white w-full">
                <div
                    className="result-header border-b border-slate-300 pb-3"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[5rem_1fr_5rem] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className=" h-20 w-30 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="min-w-0 text-center leading-tight">

                            <h1 className=" text-[20px] font-black uppercase text-blue-800">
                                SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
                            </h1>

                            <p className="text-[13px] text-slate-600 tracking-wider">
                                Puer Sanctus VI Building, Corner Rosario-Verbena Streets,
                                Brgy. 33, Bacolod City
                            </p>

                            <div className="flex justify-center mt-3">
                                <h2 className="mt-2 text-[12px] font-bold tracking-[0.1em] text-amber-700! uppercase border-b border-black inline-block">
                                    Patient&apos;s Record
                                </h2>
                            </div>

                            <p className="text-[10px] font-serif font-bold">
                                Follow-up Consult (B)
                            </p>
                        </div>
                    </div>
                </div>
                {/* PATIENT INFO */}
                <div className="py-3">
                    {/* ROW 1 */}
                    <div className="grid grid-cols-12">
                        <div className="flex px-2 py-1 col-span-12 pl-20">
                            <label className="text-sm font-semibold">PATIENT NAME:</label>
                            <div className="border-b-2 border-gray-400 h-5 text-sm pl-2 font-bold tracking-[0.1em] w-[300px]">{form?.name}</div>
                        </div>
                    </div>
                </div>
                <div >
                    {/* NEW FOLLOW-UP EDITABLE */}
                    <div className="rounded-2xl border border-[#b0dede] bg-[#f8ffff]">

                        <div className="grid grid-cols-1 lg:grid-cols-[150px_1fr] print:flex">
                            {/* LEFT INFO */}
                            <div className="border-r border-[#dce3ef] p-2 print:w-[20%]">
                                <div className="flex items-center mb-5 gap-2">
                                    <p className="text-[12px] font-bold text-[#6b7da0]">Date: </p>
                                    <p className="font-semibold text-[#0f2244] text-xs">{formatDate(initialConsults?.consultation_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    {[
                                        ["BP", initialConsults?.initialVitals.bp],
                                        ["TEMP", initialConsults?.initialVitals.temp],
                                        ["CR", initialConsults?.initialVitals.cr],
                                        ["RR", initialConsults?.initialVitals.rr],
                                        ["WT", initialConsults?.initialVitals.wt],
                                        ["HT", initialConsults?.initialVitals.ht],
                                    ].map(([label, value]) => (

                                        <div
                                            key={label}
                                            className="flex justify-between text-xs border-b border-dashed border-[#edf1f6] pb-1"
                                        >
                                            <span className="font-bold text-[#6b7da0]">
                                                {label}
                                            </span>

                                            <span className="font-semibold text-[#0f2244]">
                                                {value || "-"}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                            </div>
                            <div className="p-2 print:w-[80%]">
                                <div className="grid grid-cols-[.5fr_1fr] space-y-5">
                                    <p className="text-[12px] text-[#6b7da0] font-bold">Chief Complain: </p>
                                    <p className="font-semibold px-2 rounded-lg text-[#0f2244] text-xs">{initialConsults?.chief_complaint}</p>

                                    <p className="text-[12px] text-[#6b7da0] font-bold">History of Present Illness: </p>
                                    <p className="font-semibold px-2 rounded-lg text-[#0f2244] text-xs">{initialConsults?.hist_illness}</p>

                                    <p className="text-[12px] text-[#6b7da0] font-bold">Physical / Neurologic Examination: </p>
                                    <p className="font-semibold px-2 rounded-lg text-[#0f2244] text-xs">{initialConsults?.examination}</p>

                                    <p className="text-[12px] text-[#6b7da0] font-bold">Assessment: </p>
                                    <p className="font-semibold px-2 rounded-lg text-[#0f2244] text-xs">{initialConsults?.assessment}</p>

                                    <p className="text-[12px] text-[#6b7da0] font-bold">Plans: </p>
                                    <p className="font-semibold px-2 rounded-lg text-[#0f2244] text-xs">{initialConsults?.plans}</p>
                                </div>
                                <div className="flex items-center gap-2 justify-end pr-5 py-2">
                                    <p className="text-[12px] text-[#6b7da0] font-bold">Follow-up Date</p>
                                    <p className="font-semibold bg-gray-200 w-[100px] px-2 rounded-lg text-[#0f2244] text-xs">{formatDate(initialConsults?.follow_up_date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Follow-ups */}
                    {initialConsults && initialConsults?.followups?.length > 0 && (
                        <div className="space-y-3">
                            {initialConsults.followups.map((followup) => (
                                <div
                                    key={followup.followup_id}
                                    className="rounded-xl border border-[#dce3ef] bg-white overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-[150px_1fr] print:flex">

                                        {/* LEFT */}
                                        <div className="border-r border-[#edf1f6] bg-[#fafbfd] p-3 print:w-[20%]">
                                            <div className="flex items-center mb-5 gap-2">
                                                <p className="text-[12px] font-bold text-[#6b7da0]">Date: </p>
                                                <p className="font-semibold text-[#0f2244] text-xs">{formatDate(followup.followup_date)}</p>
                                            </div>

                                            <div className="space-y-2">
                                                {[
                                                    ["BP", followup.vitals?.bp],
                                                    ["TEMP", followup.vitals?.temp],
                                                    ["CR", followup.vitals?.cr],
                                                    ["RR", followup.vitals?.rr],
                                                    ["WT", followup.vitals?.wt],
                                                    ["HT", followup.vitals?.ht],
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="flex justify-between text-xs border-b border-dashed border-[#edf1f6] pb-1"
                                                    >
                                                        <span className="font-bold text-[#6b7da0]">
                                                            {label}
                                                        </span>

                                                        <span className="font-semibold text-[#0f2244]">
                                                            {value || "-"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* RIGHT */}
                                        <div className="p-4 space-y-3 print:w-[80%]">

                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7da0] mb-1">
                                                    Impression
                                                </p>

                                                <div className="rounded-lg bg-gray-100 p-3 text-sm text-[#1a2a45]">
                                                    {followup.impression || "-"}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7da0] mb-1">
                                                    Instructions
                                                </p>

                                                <div className="rounded-lg bg-gray-100 p-3 text-sm text-[#1a2a45] whitespace-pre-wrap">
                                                    {followup.instruction || "-"}
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center gap-2 pr-5 py-2">
                                                <span className="text-[11px] font-semibold text-[#6b7da0]">
                                                    Follow-up Date
                                                </span>

                                                <span className="font-semibold bg-gray-200 w-[100px] px-2 rounded-lg text-[#0f2244] text-xs">
                                                    {followup.followup_date
                                                        ? formatDate(followup.followup_date)
                                                        : "-"}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    {!isSaved && (
                        <>
                            {/* NEW FOLLOW-UP EDITABLE */}
                            < div className="rounded-2xl border border-[#b0dede] bg-[#ffffff]">

                                <div className="grid grid-cols-1 lg:grid-cols-[150px_1fr]">
                                    {/* LEFT INFO */}
                                    <div className="border-r border-[#dce3ef] p-2">
                                        <div className="flex items-center mb-5 gap-2">
                                            <p className="text-[12px] font-bold text-[#6b7da0]">Date: </p>
                                            <p className="font-semibold text-[#0f2244] text-xs">{formatDate(new Date())}</p>
                                        </div>
                                        <div className="space-y-1">
                                            {[
                                                ["BP", form.bp],
                                                ["TEMP", form.temp],
                                                ["CR", form.cr],
                                                ["RR", form.rr],
                                                ["WT", form.wt],
                                                ["HT", form.ht],
                                            ].map(([label, value]) => (

                                                <div
                                                    key={label}
                                                    className="flex justify-between text-xs border-b border-dashed border-[#edf1f6] pb-1"
                                                >
                                                    <span className="font-bold text-[#6b7da0]">
                                                        {label}
                                                    </span>

                                                    <span className="font-semibold text-[#0f2244]">
                                                        {value || "-"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                    <div className="p-2">
                                        <div className="p-2 bg-gray-100 rounded-xl h-[50px] text-[12px]">
                                            <p className="text-black">{form.followup.impression}</p>
                                        </div>
                                        <div className="p-2 bg-gray-100 rounded-xl h-[150px] text-[12px]">
                                            <p className="text-black">{form.followup.instruction}</p>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end pr-5 py-2">
                                            <p className="text-[12px] text-[#6b7da0] font-bold">Follow-up Date</p>
                                            <p className="font-semibold bg-gray-200 w-[100px] px-2 rounded-lg text-[#0f2244] text-xs">{formatDate(form?.followup.follow_up_date)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}