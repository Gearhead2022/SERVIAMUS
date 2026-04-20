"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import {
  generalResultDefaultValues,
  GeneralResultFormValues,
  generalResultSchema,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";

type Props = {
  testName: string;
  initialValues?: LabResultPayload | null;
  onSubmit: (form: GeneralResultFormValues) => void;
  onCancel: () => void;
};

export default function GeneralResultModal({
  testName,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralResultFormValues>({
    resolver: zodResolver(generalResultSchema),
    defaultValues: mergeLabFormDefaults(generalResultDefaultValues, initialValues),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Test Name" value={testName} readOnly />
        <Input
          label="Result Summary"
          placeholder="Enter the summarized result"
          {...register("result_summary")}
          error={errors.result_summary?.message}
        />
      </div>

      <Textarea
        label="Remarks"
        rows={5}
        placeholder="Add the important findings or completion notes for this request."
        {...register("remarks")}
        error={errors.remarks?.message}
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
