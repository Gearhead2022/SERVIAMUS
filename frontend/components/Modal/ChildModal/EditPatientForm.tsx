"use client";

import { z } from "zod";
import { patientSchema } from "@/schemas/patient.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePatient } from "@/hooks/Patient/usePatientRegistration";
import { PatientProps } from "@/types/PatientTypes";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type PatientFormValues = z.infer<typeof patientSchema>;

const EditPatientForm: React.FC<{ patient: PatientProps; onClose: () => void }> = ({ patient, onClose }) => {
  const { mutateAsync: updatePatientMutation, isPending } = useUpdatePatient(onClose);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: "onSubmit",
    defaultValues: {
      patient_code: patient.patient_code ?? "",
      name: patient.name ?? "",
      address: patient.address ?? "",
      contact_number: patient.contact_number ?? "",
      birth_date: patient.birth_date ?? "",
      sex: (patient.sex as "male" | "female") ?? "male",
      age: String(patient.age) ?? "",
      religion: patient.religion ?? "",
    },
  });

  const mapToPrisma = (data: PatientFormValues) => ({
    ...data,
    age: Number(data.age),
  });

  const onSubmit = async (data: PatientFormValues) => {
    if (!patient.patient_id) return;
    await updatePatientMutation({
      patientId: patient.patient_id,
      data: mapToPrisma(data),
    });
  };

  return (
    <div className="font-['DM_Sans'] bg-white">

      {/* Form header band */}
      <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0f2244] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h2 className="font-['DM_Serif_Display'] text-[#0f2244] text-base leading-tight">
            Update Patient Record
          </h2>
          <p className="text-[11px] text-[#6b7da0] mt-0.5">
            Editing record for {patient.name}
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

        {/* Contact Number */}
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

        {/* Birth Date + Sex */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Birth Date"
              type="date"
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

        {/* Age + Religion */}
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
              placeholder="e.g. Catholic"
              {...register("religion")}
              error={errors.religion?.message}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#dce3ef]" />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button variant="danger" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isPending}>Update ✓</Button>
        </div>

      </form>
    </div>
  );
};

export default EditPatientForm;