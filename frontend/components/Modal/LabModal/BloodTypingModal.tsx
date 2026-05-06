"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  bloodTypingDefaultValues,
  bloodTypingSchema,
  BloodTypingFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: BloodTypingFormValues) => void;
  onCancel: () => void;
};

export default function BloodTypingModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BloodTypingFormValues>({
    resolver: zodResolver(bloodTypingSchema),
    defaultValues: mergeLabFormDefaults(bloodTypingDefaultValues, initialValues),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Blood Typing
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Select label="ABO Type" {...register("abo_type")} error={errors.abo_type?.message}>
            <option value="">Select...</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </Select>

          <Select label="Rh Type" {...register("rh_type")} error={errors.rh_type?.message}>
            <option value="">Select...</option>
            <option value="Positive">Positive (+)</option>
            <option value="Negative">Negative (-)</option>
          </Select>
        </div>
      </div>

      <Input
        label="Remarks"
        placeholder="Additional blood typing notes"
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
