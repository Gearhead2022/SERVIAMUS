"use client";
import { MedCertFormValues, RegisterConsultationFormValues } from "@/schemas/consultation.schema";
import Image from "next/image";
import { PrescriptionValues } from "@/schemas/consultation.schema";
import { useGetPatientById } from "@/hooks/Patient/usePatientRegistration";
import { useGetDoctorById } from "@/hooks/Consultation/useConsultation";
import { formattedCurrentDate } from "@/utils/Date";
import { formatDate } from "@/utils/Date";

type Props = {
    type: "consult-result" | "prescription" | "med-cert";
    form: RegisterConsultationFormValues | PrescriptionValues | MedCertFormValues;
    doctorId?: number;
    template?: "temp-1" | "default";
};

export default function ConsultResultDocument({
    type,
    form,
    doctorId,
    template,
}: Props) {
    if (type === "consult-result") {
        return (
            <MedicalFormPreview
                form={form as RegisterConsultationFormValues}
            />
        );
    }

    if (type === "prescription" && doctorId && template === 'temp-1') {
        return (
            <MedicalRxPreviewVer2
                form={form as PrescriptionValues}
                doctorId={doctorId}
            />
        );
    }

    if (type === "prescription" && doctorId && template === 'default') {
        return (
            <MedicalRxPreview
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
                    <div className="grid grid-cols-[50px_1fr_50px] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus3.png"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-15 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[19px] font-black text-red-600 uppercase">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-wider leading-snug">
                                FAMILY AND COMMUNITY MEDICINE
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-wider leading-snug">
                                FELLOW AND DIPLOMATE OF THE PHILIPPINE ACADEMY OF FAMILY PHYSICIAN
                            </p>

                            <p className="text-[11px] font-bold uppercase text-blue-900 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[8px] italic text-gray-700 ">
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
                                className="h-13 w-13 rounded-full object-cover"
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
                                className="h-3 w-6"
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
                    <div className="text-[14px] text-black">
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
                    <div className="w-75 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-60 min-h-[18px] px-1 flex text-center gap-2">
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
                <div className="absolute bottom-3 left-0 w-full flex font-bold justify-center text-[12px] text-gray-900">
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
                    <div className="grid grid-cols-[50px_1fr] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-13 w-16 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[19px] font-black text-red-600 uppercase scale-y-130">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[13px] font-bold uppercase text-blue-900 scale-y-180 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[10px] italic text-gray-700">
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
                                className="h-3 w-6"
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
                    <div className="text-[14px] text-black">
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
                    <div className="w-75 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-60 min-h-[18px] px-1 flex text-center gap-2">
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
                <div className="absolute bottom-3 left-0 w-full flex font-bold justify-center text-[12px] text-gray-900">
                    <span>NOT TO BE USED FOR LEGAL PURPOSES</span>
                </div>
            </div>
        </div>
    );
}

function MedicalRxPreview({ form, doctorId }: { form: PrescriptionValues, doctorId: number }) {

    const { data: patientInfo } = useGetPatientById(form.patient_id);
    const { data: doctorInfo } = useGetDoctorById(doctorId);

    return (
        <div className="print-document bg-gray-100 flex items-center justify-center font-serif">
            <div
                className="relative print-page paper-b6 bg-white border border-gray-300 flex flex-col"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {/* HEADER */}
                <div
                    className="pb-2"
                    style={{
                        fontFamily: "'Times New Roman', Times, serif",
                    }}
                >
                    <div className="grid grid-cols-[50px_1fr_50px] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus3.png"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-15 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[19px] font-black text-red-600 uppercase">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-wider leading-snug">
                                FAMILY AND COMMUNITY MEDICINE
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-wider leading-snug">
                                FELLOW AND DIPLOMATE OF THE PHILIPPINE ACADEMY OF FAMILY PHYSICIAN
                            </p>

                            <p className="text-[11px] font-bold uppercase text-blue-900 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[8px] italic text-gray-700 ">
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
                                className="h-13 w-13 rounded-full object-cover"
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
                                className="h-3 w-6"
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
                        <div className="flex-1 border-b border-gray-500 min-h-[20px] px-1">
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
                            <div key={index} className="mb-4">

                                {/* MED NAME */}
                                <div className="font-semibold text-black">
                                    {index + 1}. {m.medicine_name} {m.strength && `(${m.strength})`}
                                </div>

                                {/* RX LINE (classic doctor style) */}
                                <div className="ml-4 text-[13px] leading-relaxed text-black">
                                    <div>
                                        Sig: {m.dose} {m.route} {m.frequency}
                                    </div>

                                    <div>
                                        Duration: {m.duration}
                                    </div>

                                    {m.quantity && (
                                        <div>
                                            Dispense: {m.quantity}
                                        </div>
                                    )}

                                    {m.instruction && (
                                        <div className="italic text-black">
                                            Notes: {m.instruction}
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
                    <div className="w-75 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-60 min-h-[18px] px-1 flex text-center gap-2">
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
                    <div className="grid grid-cols-[50px_1fr] items-center">

                        {/* LEFT LOGO */}
                        <div className="flex justify-center">
                            <Image
                                src="/images/serviamus.jpeg"
                                alt="Serviamus logo"
                                width={60}
                                height={60}
                                className="h-13 w-16 rounded-full object-cover"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* CENTER INFO */}
                        <div className="text-center leading-tight">

                            <p className="text-[19px] font-black text-red-600 uppercase scale-y-130">
                                {doctorInfo?.name}
                            </p>
                            <p className="text-[13px] font-bold uppercase text-blue-900 scale-y-180 tracking-wide">
                                Serviamus Medical Clinic and Laboratory Inc.
                            </p>

                            <p className="text-[10px] italic text-gray-700">
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
                                className="h-3 w-6"
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
                        <div className="flex-1 border-b border-gray-500 min-h-[20px] px-1">
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
                        <>
                            {form.medicines.map((m, index) => (
                                <div key={index} className="mb-4">

                                    {/* MED NAME */}
                                    <div className="font-semibold text-black">
                                        {index + 1}. {m.medicine_name} {m.strength && `(${m.strength})`}
                                    </div>

                                    {/* RX LINE (classic doctor style) */}
                                    <div className="ml-4 text-[13px] leading-relaxed text-black">
                                        <div>
                                            Sig: {m.dose} {m.route} {m.frequency}
                                        </div>

                                        <div>
                                            Duration: {m.duration}
                                        </div>

                                        {m.quantity && (
                                            <div>
                                                Dispense: {m.quantity}
                                            </div>
                                        )}

                                        {m.instruction && (
                                            <div className="italic text-black">
                                                Notes: {m.instruction}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))
                            }
                            {form.gen_notes && (
                                <div className="italic text-black text-sm">
                                    Notes: {form.gen_notes}
                                </div>
                            )}
                        </>
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
                    <div className="w-75 border-b border-gray-600 min-h-[18px] px-1 text-center font-semibold">
                        {doctorInfo?.name} {doctorInfo?.title}
                    </div>
                </div>
                <div className="flex justify-end items-end gap-2 text-[14px] text-gray-900">
                    <div className="w-60 min-h-[18px] px-1 flex text-center gap-2">
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

function MedicalFormPreview({ form }: { form: RegisterConsultationFormValues }) {
    return (
        <div className="print-document bg-gray-100 flex items-center justify-center">
            {/* LONG BOND PAPER */}
            <div
                className="print-page paper-legal bg-white text-black mx-auto p-6 print:p-2 w-[1016px] print:w-full">
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
                                <h2 className="mt-2 text-[11px] font-bold uppercase border-b border-black inline-block">
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
                    <div className="bg-gray-100 border-b border-black p-2 font-bold text-sm">
                        History of Present Illness:
                    </div>

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
                        <div className="px-2 py-1 bg-gray-100 border-b border-black font-bold text-sm">
                            Past Medical History
                        </div>

                        <div className="p-4 space-y-1 text-md print:text-sm">
                            <span className="flex gap-3"><p>{form.pmh_allergy ? "✔" : "•"}</p> FDA</span>
                            <span className="flex gap-3"><p>{form.pmh_admission ? "✔" : "•"}</p>Admission</span>
                            <span className="flex gap-3"><p>{form.pmh_others ? "✔" : "•"}</p>Others:</span>
                            <span className="flex w-full pl-5 border-b border-gray-400 min-h-[20px] text-sm">
                                {form.pmh_others_text || "-"}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <div className="px-2 py-1 bg-gray-100 border-b border-black font-bold text-sm">
                            Family History
                        </div>

                        <div className="p-4 space-y-1 text-sm">
                            <span className="flex gap-3"><p className="text-md">{form.fh_htn ? "✔" : "•"}</p> Hypertension</span>
                            <span className="flex gap-3"><p className="text-md">{form.fh_dm ? "✔" : "•"}</p> DM</span>
                            <span className="flex gap-3"><p className="text-md">{form.fh_ba ? "✔" : "•"}</p> BA</span>
                            <span className="flex gap-3"><p className="text-md">{form.fh_cancer ? "✔" : "•"}</p> Cancer</span>
                            <span className="flex gap-3"><p className="text-md">{form.fh_others ? "✔" : "•"}</p> Others:</span>
                            <span className="flex pl-5 border-b border-gray-400 min-h-[20px] text-sm">
                                {form.fh_others_text || "-"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* OB GYNE + PERSONAL */}
                <div className="grid grid-cols-2 mt-4 border border-t-0 border-black">
                    {/* LEFT */}
                    <div className="border-r border-black">
                        <div className="px-2 py-1 bg-gray-100 border-b border-black font-bold text-sm">
                            OB-Gyne History
                        </div>

                        <div className="p-4 text-sm space-y-1 ">
                            <div className="text-sm">
                                <p>G P ( {form.ob_score} )</p>

                                <div className="ml-4 mt-2 space-y-1 text-sm">
                                    <span className="flex gap-3"><p>{form.ob_nvsd ? "✔" : "•"}</p> NVSD</span>
                                    <span className="flex gap-3"><p>{form.ob_cs ? "✔" : "•"}</p> CS</span>
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
                        <div className="px-2 py-1 bg-gray-100 border-b border-black font-bold text-sm">
                            Personal & Social History
                        </div>

                        <div className="ml-4 mt-2 space-y-1 text-sm">
                            {(() => {
                                const psFields = [
                                    { label: "Cigarette use", value: form.cigarette_use },
                                    { label: "Alcohol Beverage use", value: form.alcohol_use },
                                    { label: "Illicit Drug use", value: form.drug_use },
                                    { label: "Exercise", value: form.exercise },
                                    { label: "Good Hygiene Practices", value: form.hygiene_prac },
                                    { label: "Coffee consumption", value: form.coffee_cons },
                                    { label: "Soda consumption", value: form.soda_cons },
                                ];

                                return psFields.map(({ label, value }) => (
                                    <span key={label} className="flex gap-3">
                                        <p>{value ? "✔" : "•"}</p>
                                        {label}:
                                    </span>
                                ));
                            })()}
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
                            <div className="bg-gray-100 border border-black p-2 font-bold text-sm">
                                Physical and Neurologic Examination
                            </div>

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
                            <div className="bg-blue-100 border border-black p-2 font-bold text-sm">
                                Assessment
                            </div>

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
                            <div className="bg-blue-100 border border-black p-2 font-bold text-sm">
                                Plans
                            </div>

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
                        <div>
                            <div className="bg-blue-100 border border-black p-2 font-bold text-sm">
                                Family Assessment Tools
                            </div>

                            <div className="border-x border-black p-2 font-semibold text-sm">
                                Genogram Family Map
                            </div>

                            <div
                                className=" border-x border-b border-black p-3 text-sm"
                                style={{
                                    minHeight: "320px",
                                }}
                            />
                        </div>
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