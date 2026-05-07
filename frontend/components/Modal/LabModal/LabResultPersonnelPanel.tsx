"use client";

import Select from "@/components/ui/Select";
import { LabUser } from "@/types/LabTypes";
import { formatLabPersonnelOptionLabel } from "@/utils/lab-personnel";

type Props = {
  isLoading: boolean;
  medTechOptions: LabUser[];
  medTechUserId: number | "";
  onMedTechChange: (value: number | "") => void;
  onPathologistChange: (value: number | "") => void;
  pathologistOptions: LabUser[];
  pathologistUserId: number | "";
};

export default function LabResultPersonnelPanel({
  isLoading,
  medTechOptions,
  medTechUserId,
  onMedTechChange,
  onPathologistChange,
  pathologistOptions,
  pathologistUserId,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-[#f7f8fc] p-5 shadow-sm">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-4 w-1 shrink-0 rounded-full bg-teal-600" />
          <h6 className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Result Personnel
          </h6>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-[76px] animate-pulse rounded-lg border border-slate-200 bg-white/80"
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Pathologist"
            value={pathologistUserId === "" ? "" : String(pathologistUserId)}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              onPathologistChange(
                Number.isInteger(nextValue) && nextValue > 0 ? nextValue : ""
              );
            }}
            disabled={!pathologistOptions.length}
          >
            <option value="">
              {pathologistOptions.length ? "Select a pathologist" : "No pathologist users found"}
            </option>
            {pathologistOptions.map((user) => (
              <option key={user.userId} value={user.userId}>
                {formatLabPersonnelOptionLabel(user)}
              </option>
            ))}
          </Select>

          <Select
            label="Medical Technologist"
            value={medTechUserId === "" ? "" : String(medTechUserId)}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              onMedTechChange(Number.isInteger(nextValue) && nextValue > 0 ? nextValue : "");
            }}
            disabled={!medTechOptions.length}
          >
            <option value="">
              {medTechOptions.length ? "Select a medical technologist" : "No medtech users found"}
            </option>
            {medTechOptions.map((user) => (
              <option key={user.userId} value={user.userId}>
                {formatLabPersonnelOptionLabel(user)}
              </option>
            ))}
          </Select>

        </div>
      )}
    </section>
  );
}
