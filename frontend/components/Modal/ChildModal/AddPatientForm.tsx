"use client";

import { z } from "zod";
import { patientSchema } from "@/schemas/patient.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatient } from "@/hooks/Patient/usePatientRegistration";
import { PatientProps } from "@/types/PatientTypes";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type PatientFormValues = z.infer<typeof patientSchema>;

const PatientForm: React.FC<{ patient?: PatientProps | null, onClose: () => void }> = ({ patient, onClose }) => {
  const { mutateAsync: registerPatient, isPending } = usePatient(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: "onSubmit",
    defaultValues: {
      patient_code: '',
      name: patient?.name ?? "",
      address: "",
      contact_number: "",
      birth_date: "",
      sex: "male",
      age: "",
      religion: "",
      philhealth_id: patient?.philhealth_id ?? "",
    },
  });

  const formatPhilHealthId = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as XX-XXXXXXXX-X
  if (digits.length <= 2) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 8)}-${digits.slice(8, 9)}`;
};

  const mapToPrisma = (data: PatientFormValues) => ({
    ...data,
    age: Number(data.age),
  });

  const onSubmit = async (data: PatientFormValues) => {
    await registerPatient(mapToPrisma(data));
  };

  return (
    <div className="font-['DM_Sans'] bg-white">

      {/* Form header band */}
      <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0f2244] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div>
          <h2 className="font-['DM_Serif_Display'] text-[#0f2244] text-base leading-tight">
            {patient ? "Update Patient Record" : "New Patient Registration"}
          </h2>
          <p className="text-[11px] text-[#6b7da0] mt-0.5">
            {patient ? `Editing record for ${patient.name}` : "Fill in the details below to register a patient"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 pt-5 pb-6 space-y-5">

        {/* Full Name — full width */}
        <div>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Maria Santos"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

        {/* 2-column row: Consultation Date + Contact Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Contact Number"

              placeholder="+63 9XX XXX XXXX"
              {...register("contact_number")}
              error={errors.contact_number?.message}
            />
          </div>
        </div>

        {/* Address — full width */}
        <div>
          <Input
            label="Address"
            type="text"
            placeholder="Street, City, Province"
            {...register("address")}
            error={errors.address?.message}
          />
        </div>

        {/* 2-column row: Birth Date + Sex */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Birth Date"
              type="date"
              placeholder="Street, City, Province"
              {...register("birth_date")}
              error={errors.birth_date?.message}
            />
          </div>
          <div>
            <Select
              label="Sex"
              {...register("sex")}
              error={errors.sex?.message}
            >
              <option value="">— Select —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </div>
        </div>

        {/* 2-column row: Age + Religion */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Age"
              type="text"
              placeholder="Years"
              {...register("age")}
              error={errors.age?.message}
            />
          </div>
          <div>
            <Input
              label="Religion"
              type="text"
              placeholder="Years"
              {...register("religion")}
              error={errors.religion?.message}
            />
          </div>
        </div>
        {/* PhilHealth ID */}
          <div>
            <Input
              label="PhilHealth ID"
              type="text"
              placeholder="XX-XXXXXXXX-X"
              maxLength={12}
              {...register("philhealth_id", {
                onChange: (e) => {
                  e.target.value = formatPhilHealthId(e.target.value);
                }
              })}
              error={errors.philhealth_id?.message}
            />
          </div>

        {/* Divider */}
        <div className="border-t border-[#dce3ef]" />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button variant="danger" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isPending}>Submit ✓</Button>
        </div>

      </form>
    </div>
  );
};

export default PatientForm;