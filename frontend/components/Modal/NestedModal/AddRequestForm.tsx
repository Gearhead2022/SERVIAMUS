"use client";

import { useMemo } from "react";
import { z } from "zod";
import Select from "react-select";
import {
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "@/schemas/request.schema";
import { UsersProps, VitalSignProps } from "@/types/RequestTypes";
import { PatientProps } from "@/types/PatientTypes";
import { useRequest } from "@/hooks/Patient/usePatientRegistration";
import { useLabTestCatalog } from "@/hooks/Lab/useLab";
import { useRequest, useGetAllUsers } from "@/hooks/Patient/usePatientRegistration";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/label";
import { File, TestTubeDiagonal, SquareActivity } from "lucide-react";
import { todayPH } from "@/utils/Date";


type RequestFormValues = z.infer<typeof requestSchema>;
type Consultation = Extract<RequestFormValues, { req_type: "CONSULTATION" }>;
type Laboratory = Extract<RequestFormValues, { req_type: "LABORATORY" }>;
type Certificate = Extract<RequestFormValues, { req_type: "CERTIFICATE" }>;

const inputCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";

interface VitalKeyProps<T extends FieldValues> {
  prefix: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  label: string;
  teal?: boolean;
  readonly: boolean;
}

const typeLabels = {
  CONSULTATION: "Consultation",
  LABORATORY: "Laboratory",
  CERTIFICATE: "Certificate",
} as const;

function VitalsRow<T extends FieldValues>({
  prefix,
  label,
  teal,
  register,
  readonly,
}: VitalKeyProps<T>) {
  const fields = [
    { name: "bp", label: "BP (mmHg)", placeholder: "120/80" },
    { name: "temp", label: "Temp (°C)", placeholder: "36.6" },
    { name: "cr", label: "Pulse (bpm)", placeholder: "72" },
    { name: "rr", label: "RR (/min)", placeholder: "16" },
    { name: "wt", label: "Weight (kg)", placeholder: "60" },
    { name: "ht", label: "Height (cm)", placeholder: "165" },
  ];

  return (
    <div className="mb-5">
      <h4
        className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${
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
              className={`w-full text-center text-sm rounded-md px-2 py-2 border outline-none transition ${teal
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

const RequestForm: React.FC<{
  patient: PatientProps;
  vitals: VitalSignProps | undefined;
  onClose: () => void;
}> = ({ patient, vitals, onClose }) => {
  const { mutateAsync: request, isPending } = useRequest(onClose);
  const { data: labTests = [], isLoading: loadingLabTests } = useLabTestCatalog();
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
      prev_cr: vitals?.cr,
      prev_bp: vitals?.bp,
      prev_temp: vitals?.temp,
      prev_rr: vitals?.rr,
      prev_ht: vitals?.ht,
      prev_wt: vitals?.ht,
      created_at: '',
      patient_code: patient?.patient_code,
      address: patient?.address,
      age: patient?.age?.toString(),
      req_date: todayPH(),
    },
  });

  const reqType = watch("req_type") as RequestFormValues["req_type"];
  const consultErrors = errors as FieldErrors<Consultation>;
  const labErrors = errors as FieldErrors<Laboratory>;
  const certificateErrors = errors as FieldErrors<Certificate>;
  const lastConsultation = vitals?.created_at ? new Date(vitals?.created_at).toISOString().split("T")[0] : '';

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

  const purposeOptions = [
    { value: "Fit To Work", label: "Fit to work" },
    { value: "Medical Assistance", label: "Medical Assistance" }
  ]

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

  const options = userOptions(UserList ?? []);

  type ReqType = "CONSULTATION" | "CERTIFICATE" | "LABORATORY";

  const icons: Partial<Record<ReqType, React.ReactNode>> = {
    CONSULTATION: (
      <File height={20} width={20} />
    ),
    CERTIFICATE: (
      <SquareActivity height={20} width={20} />
    ),
  };

  const defaultIcon = (
    <TestTubeDiagonal height={20} width={20} />
  );

  const typeIcon = icons[reqType] ?? defaultIcon;

  return (
    <div className="font-['DM_Sans']">
      <div className="flex items-center justify-between border-b border-[#dce3ef] bg-[#f7f8fc] px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${reqType === "LABORATORY" ? "bg-[#0e7c7b]" : reqType === 'CONSULTATION' ? "bg-[#0f2244]" : "bg-[#a3852c]"
              }`}
          >
            {typeIcon}
          </div>
          <div>
            <h2 className="font-['DM_Serif_Display'] text-[#0f2244] text-base leading-tight">
              {reqType === "CONSULTATION" ? "Consultation Request" : reqType === "LABORATORY" ? "Laboratory Request" : "Certificate Request"}
            </h2>
            <p className="mt-0.5 text-[11px] text-[#6b7da0]">
              Patient: <span className="font-semibold text-[#1a2a45]">{patient.name}</span>
            </p>

          </div>
          <div className="flex" style={{ transform: 'translateX(50%)' }}>
            <h2 className="text-gray-900 italic">Last Consultation - {lastConsultation}</h2>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#eef1f9] p-1 rounded-xl">
          {(["CONSULTATION", "LABORATORY", "CERTIFICATE"] as const).map((type) => (
            <label
              key={type}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${watch("req_type") === type
                ? type === "CONSULTATION"
                  ? "bg-[#0f2244] text-white shadow-sm"
                  : type === "LABORATORY" ? "bg-[#0e7c7b] text-white shadow-sm"
                    : "bg-[#a3852c] text-white shadow-sm"
                : "text-[#6b7da0] hover:text-[#1a2a45]"
                }`}
            >
              <input
                type="radio"
                {...register("req_type")}
                value={type}
                className="sr-only"
              />
              {typeLabels[type]}
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white px-6 pb-6 pt-5">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Input
              label="Patient Code"
              type="text"
              placeholder="Auto-filled"
              {...register("patient_code")}
              error={consultErrors.patient_code?.message}
              readOnly
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Patient Name"
              type="text"
              placeholder="Auto-filled"
              {...register("name")}
              error={consultErrors.name?.message}
              readOnly
            />
          </div>
          <div>
            <Input
              label="Consultation Date"
              type="date"
              {...register("req_date")}
              className="bg-[#f7f8fc]"
              error={consultErrors.req_date?.message}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Input
              label="Address"
              type="text"
              placeholder="Street, City, Province"
              {...register("address")}
              readOnly
              error={errors.address?.message}
            />
          </div>
          <div className="col-span-1">
            <Input
              label="Age"
              type="text"
              placeholder="Years"
              {...register("age")}
              readOnly
              error={errors.age?.message}
            />
          </div>
        </div>

        {/* ── CONSULTATION fields ── */}
        {reqType === "CONSULTATION" && (
          <div className="space-y-4 z-0">
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
              errors={consultErrors}
              readonly={true}
            />
            <VitalsRow
              prefix=""
              label="Current Record"
              teal
              register={register}
              errors={consultErrors}
              readonly={false}
            />
            <div className="w-[70%] z-10">
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
              {consultErrors.physician && (
                <p className="text-xs text-red-500 mt-1">
                  {consultErrors.physician.message}
                </p>
              )}
            </div>
          </div>

        )}

        {reqType === "LABORATORY" ? (
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
                    placeholder={
                      loadingLabTests ? "Loading laboratory tests..." : "Choose laboratory tests"
                    }
                    isMulti
                    className={`text-sm ${inputCls}`}
                    classNamePrefix="react-select"
                    onChange={(selected) =>
                      field.onChange((selected ?? []).map((option) => option.value))
                    }
                    value={testOptions.filter((option) =>
                      field.value?.includes(option.value)
                    )}
                    isClearable
                  />
                )}
              />

              {certificateErrors.purpose && (
                <p className="text-xs text-red-500 mt-1">
                  {certificateErrors.purpose.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── CERTIFICATE fields ── */}
        {reqType === "CERTIFICATE" && (
          <div className="space-y-4">
            <Controller
              control={control}
              name="purpose"
              render={({ field }) => (
                <Select
                  {...field}
                  options={purposeOptions}
                  placeholder="— Select Purpose —"
                  className={`text-sm ${inputCls}`}
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
              {certificateErrors.physician && (
                <p className="text-xs text-red-500 mt-1">
                  {certificateErrors.physician.message}
                </p>
              )}
            </div>
          </div>

        )}

        <div className="flex items-center justify-end gap-2.5 border-t border-[#dce3ef] pt-1">
          <Button type="button" variant="danger" onClick={onClose}>
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
    </div >
  );
};

export default RequestForm;
