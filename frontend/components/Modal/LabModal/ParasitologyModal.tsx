"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  parasitologyDefaultValues,
  ParasitologyFormValues,
  parasitologySchema,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: ParasitologyFormValues) => void;
  onCancel: () => void;
};

export default function ParasitologyModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParasitologyFormValues>({
    resolver: zodResolver(parasitologySchema),
    defaultValues: mergeLabFormDefaults(
      parasitologyDefaultValues,
      initialValues
        ? {
            ...initialValues,
            time_received:
              initialValues.time_received ?? initialValues.time_recieved,
          }
        : initialValues
    ),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 space-y-5"
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">General</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Time Collected", name: "time_collected" },
            { label: "Time Received", name: "time_received" },
            { label: "Color", name: "color" },
            { label: "Consistency", name: "consistency" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof ParasitologyFormValues)}
                error={errors[name as keyof ParasitologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Microscopic Findings
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Pus Cells", name: "pus_cells" },
            { label: "RBC", name: "rbc" },
            { label: "Bacteria", name: "bacteria" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof ParasitologyFormValues)}
                error={errors[name as keyof ParasitologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">Parasites</h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {[
            { label: "Hookworm", name: "hookworm" },
            { label: "Ascaris", name: "ascaris" },
            { label: "Trichuris", name: "trichuris" },
            { label: "Strongyloides", name: "strongloides" },
            { label: "E. Histolytica (Cyst)", name: "histolytica_cyst" },
            { label: "E. Histolytica (Trophozoite)", name: "histolytica_trophozoite" },
            { label: "E. Coli (Cyst)", name: "coli_cyst" },
            { label: "E. Coli (Trophozoite)", name: "coli_trophozoite" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <Input
                label={label}
                {...register(name as keyof ParasitologyFormValues)}
                error={errors[name as keyof ParasitologyFormValues]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label="Others"
          placeholder="Additional findings"
          {...register("others")}
          error={errors.others?.message}
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
