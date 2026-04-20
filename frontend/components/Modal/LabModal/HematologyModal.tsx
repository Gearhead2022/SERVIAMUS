"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  cbcDefaultValues,
  cbcSchema,
  CbcFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: CbcFormValues) => void;
  onCancel: () => void;
};

const cbcFields = [
  { label: "Hemoglobin", name: "Hemoglobin" },
  { label: "RBC Count", name: "rbc_count" },
  { label: "WBC Count", name: "wbc_count" },
  { label: "Platelet Count", name: "platelet_count" },
  { label: "MCV", name: "others_mcv" },
  { label: "MCHC", name: "mchc" },
  { label: "Reticulocyte Count", name: "reticulocyte_count" },
] as const;

const differentialFields = [
  { label: "Neutrophils (Seg)", name: "nss_1" },
  { label: "Neutrophils (Stab)", name: "nss_2" },
  { label: "NSS 3", name: "nss_3" },
  { label: "Lymphocytes", name: "lymphocytes" },
  { label: "Monocytes", name: "monocytes" },
  { label: "Eosinophils", name: "eosinophils" },
  { label: "Basophils", name: "basophils" },
] as const;

export default function HematologyModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CbcFormValues>({
    resolver: zodResolver(cbcSchema),
    defaultValues: mergeLabFormDefaults(cbcDefaultValues, initialValues),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Complete Blood Count
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {cbcFields.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              inputMode="decimal"
              {...register(name, { valueAsNumber: true })}
              error={errors[name]?.message}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Differential Count
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {differentialFields.map(({ label, name }) => (
            <Input
              key={name}
              label={label}
              inputMode="decimal"
              {...register(name, { valueAsNumber: true })}
              error={errors[name]?.message}
            />
          ))}
          <div className="col-span-2">
            <Input
              label="Remarks"
              placeholder="Additional hematology notes"
              {...register("others1")}
              error={errors.others1?.message}
            />
          </div>
        </div>
      </div>

      <Input
        label="Additional Remarks"
        placeholder="Enter final hematology remarks"
        {...register("others2")}
        error={errors.others2?.message}
      />

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Results</Button>
      </div>
    </form>
  );
}
