"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Files,
  FolderUp,
  Loader2,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  resolvePatientChartBatchPatients,
  uploadPatientChartAttachment,
} from "@/services/patient-chart.services";
import { PatientChartBatchPatient } from "@/types/PatientChartTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  isSupportedPatientChartFile,
  patientChartFileAccept,
} from "@/utils/patient-chart-file";

type BatchStatus =
  | "ready"
  | "uploading"
  | "uploaded"
  | "duplicate"
  | "failed"
  | "invalid"
  | "unmatched";

type BatchItem = {
  error?: string;
  file: File;
  id: string;
  patientCode: string;
  patientId?: number;
  relativePath: string;
  status: BatchStatus;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_VISIBLE_ITEMS = 100;
const UPLOAD_CONCURRENCY = 3;

const fileSize = (size: number) =>
  size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;

const getPatientCodeFromPath = (file: File) => {
  const pathParts = (file.webkitRelativePath || file.name)
    .split("/")
    .filter(Boolean);

  return pathParts.length > 1 ? pathParts[pathParts.length - 2].trim() : "";
};

const statusMeta: Record<BatchStatus, { className: string; label: string }> = {
  ready: { label: "Ready", className: "bg-amber-50 text-amber-700" },
  uploading: { label: "Uploading", className: "bg-sky-50 text-sky-700" },
  uploaded: { label: "Filed", className: "bg-emerald-50 text-emerald-700" },
  duplicate: { label: "Already filed", className: "bg-slate-100 text-slate-600" },
  failed: { label: "Needs retry", className: "bg-rose-50 text-rose-700" },
  invalid: { label: "Blocked", className: "bg-rose-50 text-rose-700" },
  unmatched: { label: "No patient match", className: "bg-rose-50 text-rose-700" },
};

export default function PatientChartBatchIntake() {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<BatchItem[]>([]);
  const itemIndexRef = useRef(new Map<string, number>());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setBatchVersion] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [batchError, setBatchError] = useState("");

  useEffect(() => {
    const input = folderInputRef.current;
    if (!input) return;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
  }, []);

  useEffect(
    () => () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    },
    []
  );

  const refresh = (immediate = false) => {
    if (immediate) {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
      setBatchVersion((version) => version + 1);
      return;
    }
    if (refreshTimerRef.current) return;
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      setBatchVersion((version) => version + 1);
    }, 180);
  };

  const replaceItems = (items: BatchItem[]) => {
    itemsRef.current = items;
    itemIndexRef.current = new Map(items.map((item, index) => [item.id, index]));
    refresh(true);
  };

  const updateItem = (id: string, patch: Partial<BatchItem>) => {
    const index = itemIndexRef.current.get(id);
    if (index === undefined) return;
    itemsRef.current[index] = { ...itemsRef.current[index], ...patch };
    refresh();
  };

  const summary = (() => {
    const batchItems = itemsRef.current;
    const counts = batchItems.reduce<Record<BatchStatus, number>>(
      (current, item) => ({ ...current, [item.status]: current[item.status] + 1 }),
      { ready: 0, uploading: 0, uploaded: 0, duplicate: 0, failed: 0, invalid: 0, unmatched: 0 }
    );
    return { ...counts, total: batchItems.length };
  })();
  const visibleItems = itemsRef.current.slice(0, MAX_VISIBLE_ITEMS);
  const completedItems = summary.uploaded + summary.duplicate + summary.failed + summary.invalid + summary.unmatched;
  const batchProgress = summary.total ? Math.round((completedItems / summary.total) * 100) : 0;

  const prepareFolder = async (files: FileList | null) => {
    if (!files || isUploading) return;
    setBatchError("");
    setIsResolving(true);

    try {
      const items = Array.from(files)
        .filter((file) => !file.name.startsWith("."))
        .map((file, index): BatchItem => {
          const relativePath = file.webkitRelativePath || file.name;
          const patientCode = getPatientCodeFromPath(file);
          const error = !patientCode
            ? "Place this file directly inside a folder named with its patient code."
            : !isSupportedPatientChartFile(file)
              ? "Only PDF, JPG, and PNG files are accepted."
              : file.size > MAX_FILE_SIZE
                ? "File exceeds the 10 MB limit."
                : "";

          return {
            id: `${file.name}-${file.lastModified}-${index}`,
            file,
            patientCode,
            relativePath,
            status: error ? (patientCode ? "invalid" : "unmatched") : "ready",
            error: error || undefined,
          };
        });

      const codes = [...new Set(items.filter((item) => item.status === "ready").map((item) => item.patientCode))];
      const matchedPatients = codes.length
        ? await resolvePatientChartBatchPatients(codes)
        : [];
      const patientsByCode = new Map(
        matchedPatients.map((patient: PatientChartBatchPatient) => [
          patient.patient_code.trim().toUpperCase(),
          patient,
        ])
      );

      replaceItems(
        items.map((item) => {
          if (item.status !== "ready") return item;
          const patient = patientsByCode.get(item.patientCode.toUpperCase());
          return patient
            ? { ...item, patientId: patient.patient_id }
            : { ...item, status: "unmatched", error: `No patient matches code ${item.patientCode}.` };
        })
      );
    } catch (error) {
      setBatchError(getApiErrorMessage(error, "Unable to validate the selected patient folders."));
      replaceItems([]);
    } finally {
      setIsResolving(false);
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const uploadItem = async (item: BatchItem) => {
    if (!item.patientId) return;
    updateItem(item.id, { status: "uploading", error: undefined });
    try {
      const result = await uploadPatientChartAttachment({ file: item.file, patientId: item.patientId });
      updateItem(item.id, { status: result.duplicate ? "duplicate" : "uploaded" });
    } catch (error) {
      updateItem(item.id, {
        status: "failed",
        error: getApiErrorMessage(error, "Upload failed. Retry this file after checking the connection."),
      });
    }
  };

  const startUpload = async () => {
    if (isUploading) return;
    const pendingItems = itemsRef.current.filter(
      (item) => item.status === "ready" || item.status === "failed"
    );
    if (!pendingItems.length) return;

    setIsUploading(true);
    let cursor = 0;
    const worker = async () => {
      while (cursor < pendingItems.length) {
        const item = pendingItems[cursor++];
        await uploadItem(item);
      }
    };

    try {
      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, pendingItems.length) }, worker)
      );
    } finally {
      setIsUploading(false);
      refresh(true);
    }
  };

  const retryFailed = () => {
    itemsRef.current.forEach((item, index) => {
      if (item.status === "failed") itemsRef.current[index] = { ...item, status: "ready", error: undefined };
    });
    refresh(true);
    void startUpload();
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#b9d7d3] bg-white shadow-sm">
      <div className="border-b border-[#dce9e7] bg-[#f1faf8] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0e7c7b]">
              <Files size={15} /> Controlled bulk intake
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#173b63]">Batch-scan patient charts</h2>
            <p className="mt-1 max-w-2xl text-sm text-[#54707e]">
              Select a parent folder containing one folder per patient, named with the patient code: <strong>P00001/document.pdf</strong>.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0e7c7b] shadow-sm">
            <ShieldCheck size={14} /> SHA-256 duplicate protection
          </span>
        </div>
      </div>

      <div className="p-5">
        <input
          ref={folderInputRef}
          type="file"
          multiple
          accept={patientChartFileAccept}
          className="sr-only"
          onChange={(event) => void prepareFolder(event.target.files)}
        />
        <button
          type="button"
          disabled={isResolving || isUploading}
          onClick={() => folderInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#79aaa5] bg-[#f7fcfb] px-5 py-7 text-center transition hover:bg-[#eef9f7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResolving ? <Loader2 size={24} className="animate-spin text-[#0e7c7b]" /> : <FolderUp size={24} className="text-[#0e7c7b]" />}
          <span className="mt-2 text-sm font-semibold text-[#143a35]">Choose a batch folder</span>
          <span className="mt-1 text-xs text-[#5f817b]">The system verifies patient codes before it uploads any scan.</span>
        </button>

        {batchError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{batchError}</p>}

        {summary.total > 0 && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {([
                ["Ready", summary.ready, "text-amber-700"],
                ["Uploading", summary.uploading, "text-sky-700"],
                ["Filed", summary.uploaded, "text-emerald-700"],
                ["Duplicates", summary.duplicate, "text-slate-600"],
                ["Blocked", summary.invalid + summary.unmatched, "text-rose-700"],
                ["Failed", summary.failed, "text-rose-700"],
              ] as const).map(([label, count, color]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className={`mt-1 text-lg font-bold ${color}`}>{count}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-3">
              <div className="min-w-[240px] flex-1">
                <div className="flex justify-between gap-3 text-xs text-slate-600">
                  <p>{summary.total.toLocaleString()} files prepared. Uploads use {UPLOAD_CONCURRENCY} secure transfers at a time.</p>
                  <p className="shrink-0 font-semibold text-[#0e7c7b]">{completedItems.toLocaleString()} / {summary.total.toLocaleString()} processed</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#0e7c7b] transition-[width]" style={{ width: `${batchProgress}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.failed > 0 && (
                  <button type="button" onClick={retryFailed} disabled={isUploading} className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0d2ce] bg-white px-3 py-2 text-xs font-semibold text-[#a44035] disabled:opacity-60">
                    <RotateCcw size={14} /> Retry failed
                  </button>
                )}
                <button type="button" onClick={() => replaceItems([])} disabled={isUploading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-60">
                  <X size={14} /> Clear queue
                </button>
                <button type="button" onClick={() => void startUpload()} disabled={isUploading || summary.ready + summary.failed === 0} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e7c7b] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Files size={14} />}
                  {isUploading ? "Uploading batch…" : "Start batch upload"}
                </button>
              </div>
            </div>

            <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {visibleItems.map((item) => {
                const meta = statusMeta[item.status];
                return (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-700" title={item.relativePath}>{item.relativePath}</p>
                      <p className="mt-0.5 text-slate-500">{item.patientCode || "No patient code"} · {fileSize(item.file.size)}{item.error ? ` · ${item.error}` : ""}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${meta.className}`}>{meta.label}</span>
                  </div>
                );
              })}
              {summary.total > MAX_VISIBLE_ITEMS && <p className="px-3 py-3 text-center text-xs text-slate-500">Showing the first {MAX_VISIBLE_ITEMS} of {summary.total.toLocaleString()} queued files.</p>}
            </div>
            {(summary.invalid > 0 || summary.unmatched > 0) && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertCircle size={14} className="mt-0.5 shrink-0" />Blocked files are never uploaded. Correct the file type, size, or patient-code folder, then select the batch again.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
