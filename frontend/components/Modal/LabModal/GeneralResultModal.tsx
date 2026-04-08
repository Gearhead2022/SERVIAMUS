"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

type Props = {
  testName: string;
  initialValues?: Record<string, string> | null;
  onSubmit: (form: Record<string, string>) => void;
  onCancel: () => void;
};

const defaultForm = {
  result_summary: "",
  remarks: "",
};

export default function GeneralResultModal({
  testName,
  initialValues,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({
    ...defaultForm,
    ...(initialValues ?? {}),
  });

  const updateField =
    (field: keyof typeof defaultForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5 p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Test Name" value={testName} readOnly />
        <Input
          label="Result Summary"
          placeholder="Enter the summarized result"
          value={form.result_summary ?? ""}
          onChange={updateField("result_summary")}
        />
      </div>

      <Textarea
        label="Remarks"
        rows={5}
        placeholder="Add the important findings or completion notes for this request."
        value={form.remarks ?? ""}
        onChange={updateField("remarks")}
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
