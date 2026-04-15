"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  hematologyDefaultValues,
  HematologyFormValues,
  hematologySchema,
} from "@/schemas/lab.schema";

type Props = {
  initialValues?: Partial<HematologyFormValues> | null;
  onSubmit: (form: HematologyFormValues) => void;
  onCancel: () => void;
};

export default function HematologyModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HematologyFormValues>({
    resolver: zodResolver(hematologySchema),
    defaultValues: {
      ...hematologyDefaultValues,
      ...(initialValues ?? {}),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 space-y-5"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">CBC</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Hemoglobin", name: "Hemoglobin" },
            { label: "RBC Count", name: "rbc_count" },
            { label: "WBC Count", name: "wbc_count" },
            { label: "Platelet Count", name: "platelet_count" },
            { label: "MCV", name: "others_mcv" },
            { label: "MCHC", name: "mchc" },
            { label: "Reticulocyte Count", name: "reticulocyte_count" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof HematologyFormValues)}
                error={errors[name as keyof HematologyFormValues]?.message}
              />
            </div>
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
          {[
            { label: "Neutrophils (Seg)", name: "nss_1" },
            { label: "Neutrophils (Stab)", name: "nss_2" },
            { label: "NSS 3", name: "nss_3" },
            { label: "Lymphocytes", name: "lymphocytes" },
            { label: "Monocytes", name: "monocytes" },
            { label: "Eosinophils", name: "eosinophils" },
            { label: "Basophils", name: "basophils" },
            { label: "Others", name: "others1" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof HematologyFormValues)}
                error={errors[name as keyof HematologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Clotting Studies
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Clotting Time", name: "clotting_time" },
            { label: "Bleeding Time", name: "bleeding_time" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof HematologyFormValues)}
                error={errors[name as keyof HematologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Blood Typing
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <Select
              label="ABO Type"
              {...register("abo_type")}
              error={errors.abo_type?.message}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Select
              label="Rh Type"
              {...register("rh_type")}
              error={errors.rh_type?.message}
            >
              <option value="">Select...</option>
              <option value="Positive">Positive (+)</option>
              <option value="Negative">Negative (-)</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label="Others"
          placeholder="Additional notes"
          {...register("others2")}
          error={errors.others2?.message}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Results
        </Button>
      </div>
    </form>
  );
}
