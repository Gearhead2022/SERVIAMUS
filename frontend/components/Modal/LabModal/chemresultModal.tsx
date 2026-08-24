"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import {
  chemistryDefaultValues,
  ChemistryFormValues,
  chemistrySchema,
} from "@/schemas/lab.schema";
import { LabResultPayload } from "@/types/LabTypes";
import { mergeLabFormDefaults } from "@/utils/lab";
import { getChemistryPanelRows } from "@/utils/lab-templates";

type Props = {
  fieldNames?: string[];
  initialValues?: LabResultPayload | null;
  onSubmit: (form: ChemistryFormValues) => void;
  onCancel: () => void;
};

export default function ChemistryResultModal({
  fieldNames,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChemistryFormValues>({
    resolver: zodResolver(chemistrySchema),
    defaultValues: mergeLabFormDefaults(chemistryDefaultValues, initialValues),
  });

  const ionizedCalcium = watch("ionized_calcium") || 0;
  const ionizedCalciumUnit = watch("ionized_calcium_unit");
  const ionizedConv = Number(
    (
      ionizedCalciumUnit === "mg/dL"
        ? ionizedCalcium / 4.0078
        : ionizedCalcium * 4.0078
    ).toFixed(2)
  );
  const equivalentUnit = ionizedCalciumUnit === "mg/dL" ? "mmol/L" : "mg/dL";
  const chemistryRows = getChemistryPanelRows(fieldNames).filter(
    ({ fieldName }) => fieldName !== "ionized_calcium_conv"
  );
  const hasIonizedCalcium = chemistryRows.some(
    ({ fieldName }) => fieldName === "ionized_calcium"
  );

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          ionized_calcium_conv: ionizedConv,
        })
      )}
      className="p-5 space-y-5"
    >
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {chemistryRows.map(({ label, fieldName }) => (
            <div key={fieldName} className="contents">
              <Input
                label={fieldName === "ionized_calcium" ? "Ionized Calcium" : label}
                placeholder="--"
                inputMode="decimal"
                {...register(fieldName as keyof ChemistryFormValues, {
                  valueAsNumber: true,
                })}
                error={errors[fieldName as keyof ChemistryFormValues]?.message}
              />
              {fieldName === "ionized_calcium" && (
                <Select label="Ionized Calcium Unit" {...register("ionized_calcium_unit")}>
                  <option value="mmol/L">mmol/L</option>
                  <option value="mg/dL">mg/dL</option>
                </Select>
              )}
            </div>
          ))}
        {hasIonizedCalcium && (
          <div>
            <Input
              label={`Equivalent (${equivalentUnit})`}
              value={ionizedConv}
              readOnly
            />
          </div>
        )}
        <div className="col-span-2 flex flex-col gap-1">
          <Textarea
            label="Others"
            rows={2}
            placeholder="Enter other notes..."
            {...register("others")}
            error={errors.others?.message}
          />
        </div>
        <div className="col-span-2">
          <Textarea
            label="Remarks"
            rows={2}
            placeholder="Enter additional remarks"
            {...register("remarks")}
            error={errors.remarks?.message}
          />
        </div>
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
