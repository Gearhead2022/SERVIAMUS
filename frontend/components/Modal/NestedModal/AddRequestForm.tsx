"use client";

import z from "zod";
import Select from "react-select";
import { useForm, UseFormRegister, FieldValues, Path, FieldErrors, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "@/schemas/request.schema";
import { VitalSignProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useRequest } from "@/hooks/Patient/usePatientRegistration";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/label";
import Textarea from "@/components/ui/Textarea";

type RequestFormValues = z.infer<typeof requestSchema>;
type LabForm = Extract<RequestFormValues, { req_type: "LABORATORY" }>;

const inputCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";

interface VitakKeyProps<T extends FieldValues> {
  prefix: string; 
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  label: string;
  teal?: boolean;
  readonly: boolean;
}

function VitalsRow<T extends FieldValues>({
  prefix,
  label,
  teal,
  register,
  errors,
  readonly,
}: VitakKeyProps<T>) {
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
        className={`text-[11px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-2 ${
            teal ? "text-[#0e7c7b]" : "text-[#6b7da0]"
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
                 {...register(
                  (prefix ? `${prefix}_${f.name}` : f.name) as Path<T>
                )}
                placeholder={f.ph}
                className={`w-full text-center text-sm rounded-md px-2 py-2 border outline-none transition ${
                teal
                    ? "bg-[#e0f4f4] border-[#b0dede] focus:border-[#0e7c7b] focus:shadow-[0_0_0_3px_rgba(14,124,123,0.1)] focus:bg-white"
                    : "bg-[#f0f3fa] border-[#dce3ef] focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white"
                } text-[#1a2a45]`}
                readOnly={readonly}
            />
            {/* <FieldError message={errors.name?.message} /> */}
            </div>
        ))}
        </div>
    </div>
  );
}

/* ── Main Component ── */
const RequestForm: React.FC<{
  patient: PatientProps;
  vitals: VitalSignProps | undefined;
  onClose: () => void;
}> = ({ patient, vitals, onClose }) => {
  const { mutateAsync: request, isPending } = useRequest(onClose);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      req_type: "CONSULTATION",

      name: patient.name,
      patient_id: patient.patient_id,
      prev_cr: vitals?.cr,
      prev_bp: vitals?.bp,
      prev_temp: vitals?.temp,
      prev_rr: vitals?.rr,
      prev_ht: vitals?.ht,
      prev_wt: vitals?.ht,
      created_at: '',
      patient_code: patient?.patient_code,
      req_date: new Date().toISOString().split("T")[0],
    },
  });
  

  const reqType = watch("req_type");
  const labErrors = errors as FieldErrors<LabForm>;
  const lastConsultation =  vitals?.created_at ? new Date(vitals?.created_at).toISOString().split("T")[0] : '';

  const onSubmit = async (data: RequestFormValues) => {
    await request(data);
  };

  const testOptions = [
    { value: "CBC", label: "CBC (Complete Blood Count)" },
    { value: "Urinalysis", label: "Urinalysis" },
    { value: "X-Ray", label: "X-Ray" },
    { value: "Blood Chemistry", label: "Blood Chemistry" },
    { value: "Fecalysis", label: "Fecalysis" },
    { value: "ECG", label: "ECG" },
    { value: "Ultrasound", label: "Ultrasound" },
  ];

  /* Icon per type */
  const typeIcon =
    reqType === "CONSULTATION" ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );

  return (
    <div className="font-['DM_Sans']">

      {/* Header band */}
      <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
              reqType === "LABORATORY" ? "bg-[#0e7c7b]" : "bg-[#0f2244]"
            }`}
          >
            {typeIcon}
          </div>
          <div>
            <h2 className="font-['DM_Serif_Display'] text-[#0f2244] text-base leading-tight">
              {reqType === "CONSULTATION" ? "Consultation Request" : "Laboratory Request"}
            </h2>
            <p className="text-[11px] text-[#6b7da0] mt-0.5">
              Patient:{" "}
              <span className="font-semibold text-[#1a2a45]">{patient.name}</span>
            </p>
           
          </div>
          <div className="flex" style={{ transform: 'translateX(50%)' }}>
             <h2 className="text-gray-900 italic">Last Consultation - {lastConsultation}</h2>
          </div>
        </div>

        {/* Type toggle pills */}
        <div className="flex items-center gap-1 bg-[#eef1f9] p-1 rounded-xl">
          {(["CONSULTATION", "LABORATORY"] as const).map((type) => (
            <label
              key={type}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                watch("req_type") === type
                  ? type === "CONSULTATION"
                    ? "bg-[#0f2244] text-white shadow-sm"
                    : "bg-[#0e7c7b] text-white shadow-sm"
                  : "text-[#6b7da0] hover:text-[#1a2a45]"
              }`}
            >
              <input
                type="radio"
                {...register("req_type")}
                value={type}
                className="sr-only"
              />
              {type === "CONSULTATION" ? "Consultation" : "Laboratory"}
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 pt-5 pb-6 space-y-5 bg-white">

        {/* Patient row */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Input
              label="Patient Code"
              type="text"
              placeholder="Auto-filled"
              {...register("patient_code")}
              error={errors.patient_code?.message}
              readOnly
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Patient Name"
              type="text"
              placeholder="Auto-filled"
              {...register("name")}
              error={errors.name?.message}
              readOnly
            />
          </div>
          <div>
            <Input
              label="Consultation Date"
              type="date"
              {...register("req_date")}
              className="bg-[#f7f8fc]"
              error={errors.req_date?.message}
            />
          </div>
        </div>

        {/* ── CONSULTATION fields ── */}
        {reqType === "CONSULTATION" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7da0]">
                Vital Signs
              </span>
              <span className="flex-1 h-px bg-[#dce3ef]" />
            </div>

            <VitalsRow
              prefix="prev"
              label="Previous Record"
              teal={false}
              register={register}
              errors={errors}
              readonly={true}
            />
            <VitalsRow
              prefix=""
              label="Current Record"
              teal
              register={register}
              errors={errors}
              readonly={false}
            />
          </div>
        )}

        {/* ── LABORATORY fields ── */}
        {reqType === "LABORATORY" && (
          <div className="space-y-4">
            <div className="col-span-2">
            <Input
              label="Requested By"
              type="text"
              {...register("req_by" as const)}
              className="bg-[#f7f8fc]"
              placeholder="Enter Requestor Name Here..."
              error={labErrors.req_by?.message}
            />
          </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7da0]">
                Test Details
              </span>
              <span className="flex-1 h-px bg-[#dce3ef]" />
            </div>

            <div>
              <Label>Select Test</Label>

              <Controller
                control={control}
                name="test"
                render={({ field }) => (
                  <Select
                    {...field}
                    options={testOptions}
                    placeholder="— Choose a test —"
                    isMulti
                    className={`text-sm ${inputCls}`}
                    classNamePrefix="react-select"
                    onChange={(selected) =>
                      field.onChange(selected.map((opt) => opt.value))
                    }
                    value={testOptions.filter(opt =>
                      field.value?.includes(opt.value)
                    )}
                    isClearable
                  />
                )}
              />

              {/* <FieldError message={errors.test?.message} /> */}
            </div>

            {/* Notes field for lab */}
            <div>
              <Textarea
                label="Clinical Notes"
                rows={3}
                placeholder="Add any instructions or clinical context for the lab request…"
              />
            </div>
          </div>
        )}

        {/* Divider + Actions */}
        <div className="pt-1 border-t border-[#dce3ef] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="danger"
            onClick={onClose}
          >
            Cancel
          </Button>
        
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
          >
            Submit ✓
          </Button>
        </div>

      </form>
    </div>
  );
};

export default RequestForm;