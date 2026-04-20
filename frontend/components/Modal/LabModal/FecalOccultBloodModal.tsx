"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  fecalOccultBloodDefaultValues,
  fecalOccultBloodSchema,
  FecalOccultBloodFormValues,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  initialValues?: LabResultPayload | null;
  onSubmit: (form: FecalOccultBloodFormValues) => void;
  onCancel: () => void;
};

export default function FecalOccultBloodModal({
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FecalOccultBloodFormValues>({
    resolver: zodResolver(fecalOccultBloodSchema),
    defaultValues: mergeLabFormDefaults(
      fecalOccultBloodDefaultValues,
      initialValues ?? null
    ),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Fecal Occult Blood Test
          </h6>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Input label="Test" {...register("test")} error={errors.test?.message} />
          <Input
            label="Method"
            placeholder="Enter method used"
            {...register("method")}
            error={errors.method?.message}
          />
          <Input
            label="Specimen"
            {...register("specimen")}
            error={errors.specimen?.message}
          />
          <Input
            label="Result"
            placeholder="Enter FOBT result"
            {...register("result")}
            error={errors.result?.message}
          />
          <div className="col-span-2">
            <Textarea
              label="Remarks"
              rows={4}
              placeholder="Enter additional remarks"
              {...register("remarks")}
              error={errors.remarks?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Results</Button>
      </div>
    </form>
  );
}
