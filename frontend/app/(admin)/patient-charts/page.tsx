"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, RotateCcw, Search, Upload, UserRound, X } from "lucide-react";
import Pagination from "@/components/Pagination";
import RoleGuard from "@/guards/RoleGuard";
import { useGetAllpatient } from "@/hooks/Patient/usePatientRegistration";
import { useUploadPatientChartAttachment } from "@/hooks/Patient/usePatientCharts";
import { PatientProps } from "@/types/PatientTypes";
import { getApiErrorMessage } from "@/utils/api-error";
import { isSupportedPatientChartFile, patientChartFileAccept } from "@/utils/patient-chart-file";

type QueueStatus = "pending" | "uploading" | "complete" | "uploadError" | "invalid";
type QueueItem = { id: string; file: File; progress: number; status: QueueStatus; error?: string };
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const pageSize = 12;
let queueItemSequence = 0;
const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const createQueueItem = (file: File): QueueItem => {
  const error = !isSupportedPatientChartFile(file) ? "Only PDF, JPG, and PNG files are accepted." : file.size > MAX_FILE_SIZE ? "File exceeds the 10 MB limit." : undefined;
  queueItemSequence += 1;
  return {
    id: `chart-${Date.now()}-${file.lastModified}-${queueItemSequence}`,
    file,
    progress: 0,
    status: error ? "invalid" : "pending",
    error,
  };
};

export default function PatientChartsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<PatientProps | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const activeUploadIds = useRef(new Set<string>());
  const { data: patientResponse, isLoading, error } = useGetAllpatient(search, currentPage, pageSize);
  const { mutateAsync: upload } = useUploadPatientChartAttachment();
  const patients = patientResponse?.data ?? [];
  const patientPagination = patientResponse?.pagination;
  const isUploading = queue.some((item) => item.status === "uploading");
  const counts = useMemo(() => ({
    complete: queue.filter((item) => item.status === "complete").length,
    invalid: queue.filter((item) => item.status === "invalid").length,
    queued: queue.filter((item) => item.status === "pending" || item.status === "uploadError").length,
    totalSize: queue.reduce((sum, item) => sum + item.file.size, 0),
  }), [queue]);

  useEffect(() => { setCurrentPage(1); }, [search]);
  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const incomingItems = Array.from(files).map(createQueueItem);
    setQueue((current) => [...current, ...incomingItems]);

    // A selected patient and a valid file are enough to begin the intake.
    // This keeps one-file and many-file uploads on the same reliable path.
    void (async () => {
      for (const item of incomingItems) {
        if (item.status === "pending") await uploadItem(item);
      }
    })();
  };
  const replaceFile = (itemId: string, files: FileList | null) => {
    const nextFile = files?.[0];
    if (nextFile) setQueue((current) => current.map((item) => item.id === itemId ? { ...createQueueItem(nextFile), id: itemId } : item));
  };
  const removeFile = (itemId: string) => setQueue((current) => current.filter((item) => item.id !== itemId));
  const uploadItem = async (item: QueueItem) => {
    if (
      !selectedPatient ||
      item.status === "invalid" ||
      item.status === "complete" ||
      activeUploadIds.current.has(item.id)
    ) return;

    activeUploadIds.current.add(item.id);
    setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading", progress: 0, error: undefined } : entry));
    try {
      await upload({ file: item.file, patientId: selectedPatient.patient_id!, onProgress: (progress) => setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)) });
      setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "complete", progress: 100 } : entry));
    } catch (uploadError) {
      setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploadError", error: getApiErrorMessage(uploadError, "Upload failed. Check your connection and retry this file.") } : entry));
    } finally {
      activeUploadIds.current.delete(item.id);
    }
  };
  const uploadAll = async () => {
    if (!selectedPatient || isUploading) return;
    for (const item of queue.filter((entry) => entry.status === "pending" || entry.status === "uploadError")) await uploadItem(item);
  };

  return <RoleGuard allowedRoles={["ADMIN"]}>
    <main className="min-h-screen bg-[#f3f6f9] font-['DM_Sans'] text-[#172a46]">
      <header className="border-b border-[#2a5579] bg-[#102b4e] px-5 py-6 md:px-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#86ded5]">Clinical records · controlled intake</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-['DM_Serif_Display'] text-3xl text-white">Patient charts</h1><p className="mt-1 text-sm text-[#c3d2df]">Verify the destination, then file each scanned journal into the private chart.</p></div><div className="grid min-w-[245px] grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#477493] bg-[#477493] text-xs shadow-inner"><div className="bg-[#173b63] px-3 py-2.5"><p className="uppercase tracking-wider text-[#9bbdce]">Destination</p><p className="mt-1 truncate font-semibold text-white">{selectedPatient ? `${selectedPatient.patient_code ?? "No code"} · ${selectedPatient.name}` : "Not selected"}</p></div><div className="bg-[#173b63] px-3 py-2.5"><p className="uppercase tracking-wider text-[#9bbdce]">Intake audit</p><p className="mt-1 font-semibold text-white">{counts.queued} ready · {counts.complete} filed</p></div></div></div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.35fr)] lg:p-8">
        <section className="overflow-hidden rounded-xl border border-[#d6e0ea] bg-white shadow-sm"><div className="border-b border-[#e4ebf1] p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">1. Find the patient</h2><span className="text-xs text-[#60748d]">{patientPagination?.total ?? 0} records</span></div><label className="relative mt-3 block"><Search className="absolute left-3 top-3 text-[#60748d]" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or patient code" className="w-full rounded-lg border border-[#cdd9e5] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0e7c7b]" /></label><p className="mt-2 text-xs text-[#6f8297]">Search before selecting. The choice stays active while you refine results.</p></div><div className="max-h-[408px] overflow-y-auto p-3">{isLoading ? <p className="p-4 text-sm text-slate-500">Loading patients…</p> : error ? <p className="p-4 text-sm text-red-700">{getApiErrorMessage(error, "Unable to load patients.")}</p> : patients.length === 0 ? <p className="p-4 text-sm text-slate-500">No matching patients found. Try a name or patient code.</p> : patients.map((patient) => <button key={patient.patient_id} type="button" onClick={() => setSelectedPatient(patient)} className={`mb-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${selectedPatient?.patient_id === patient.patient_id ? "border-[#0e7c7b] bg-[#e9f7f6] shadow-[inset_3px_0_0_#0e7c7b]" : "border-transparent hover:border-[#d7e1ea] hover:bg-[#f7fafc]"}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf0f7] text-sm font-bold text-[#173b63]">{patient.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{patient.name}</span><span className="block text-xs text-[#60748d]">{patient.patient_code ?? "No code"} · {patient.age ?? "—"} yrs</span></span></button>)}</div>{patientPagination && patientPagination.totalPages > 1 && <Pagination currentPage={currentPage} totalPages={patientPagination.totalPages} totalEntries={patientPagination.total} calculateStartIndex={() => patientPagination.total ? (currentPage - 1) * pageSize + 1 : 0} calculateEndIndex={() => Math.min(currentPage * pageSize, patientPagination.total)} setCurrentPage={setCurrentPage} />}</section>
        <section className="overflow-hidden rounded-xl border border-[#d6e0ea] bg-white shadow-sm"><div className="border-b border-[#e4ebf1] p-5"><h2 className="font-semibold">2. Journal document intake</h2>{selectedPatient ? <div className="mt-4 flex items-center gap-3 border-l-4 border-[#0e7c7b] bg-[#eff7f7] p-3"><UserRound size={18} className="text-[#0e7c7b]"/><div><p className="text-sm font-semibold">{selectedPatient.name}</p><p className="text-xs text-[#527083]">{selectedPatient.patient_code} · private personal medical chart</p></div></div> : <p className="mt-3 text-sm text-[#60748d]">Select a patient before adding files.</p>}</div><div className="p-5"><label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-7 text-center ${selectedPatient ? "border-[#78aaa7] bg-[#f3fbfa] hover:bg-[#eaf7f5]" : "cursor-not-allowed border-[#d7e0e7] bg-[#f8fafb]"}`}><Upload className="text-[#0e7c7b]" size={24}/><span className="mt-2 text-sm font-semibold">Choose scanned journal files</span><span className="mt-1 text-xs text-[#60748d]">PDF, JPG, or PNG · up to 10 MB each · uploads start automatically</span><input disabled={!selectedPatient || isUploading} type="file" multiple accept={patientChartFileAccept} className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => { addFiles(event.target.files); event.target.value = ""; }} /></label>
          {queue.length > 0 && <div className="mt-5 space-y-2">{queue.map((item) => <article key={item.id} className={`rounded-lg border p-3 ${item.status === "invalid" ? "border-[#efd6a3] bg-[#fffaf0]" : item.status === "uploadError" ? "border-[#f1cfca] bg-[#fffafa]" : "border-[#dce5ed]"}`}><div className="flex gap-3"><FileText size={19} className="mt-0.5 shrink-0 text-[#4f6885]"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="truncate text-sm font-medium">{item.file.name}</p><p className="text-xs text-[#74859a]">{formatBytes(item.file.size)}</p></div>{item.status === "complete" ? <CheckCircle2 size={18} className="text-[#11816f]"/> : item.status === "invalid" || item.status === "uploadError" ? <AlertCircle size={18} className="text-[#c65b37]"/> : <button type="button" onClick={() => removeFile(item.id)} disabled={isUploading} aria-label={`Remove ${item.file.name}`} className="text-[#74859a] hover:text-[#b44635]"><X size={17}/></button>}</div>{item.status === "uploading" && <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#dbe8e8]"><div className="h-full bg-[#0e7c7b] transition-all" style={{ width: `${item.progress}%` }}/></div>}{item.status === "uploadError" && <div className="mt-2 flex items-center justify-between gap-2"><p className="text-xs text-[#b44635]">{item.error}</p><button type="button" onClick={() => uploadItem(item)} disabled={isUploading} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0e6b6a]"><RotateCcw size={13}/> Retry</button></div>}{item.status === "invalid" && <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-[#9a6717]">{item.error} This file will not be uploaded.</p><span className="flex gap-3"><label className="cursor-pointer text-xs font-semibold text-[#0e6b6a]">Replace<input type="file" accept={patientChartFileAccept} className="sr-only" onChange={(event) => { replaceFile(item.id, event.target.files); event.target.value = ""; }}/></label><button type="button" onClick={() => removeFile(item.id)} className="text-xs font-semibold text-[#b44635]">Remove</button></span></div>}{item.status === "pending" && <p className="mt-2 text-xs font-medium text-[#a06810]">Ready to upload</p>}{item.status === "complete" && <p className="mt-2 text-xs font-medium text-[#11816f]">Filed in this patient’s chart</p>}</div></div></article>)}</div>}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ebf1] pt-4"><p className="text-xs text-[#60748d]">{counts.complete} filed · {counts.queued} ready · {counts.invalid} blocked · {formatBytes(counts.totalSize)} selected</p><button type="button" onClick={uploadAll} disabled={!selectedPatient || counts.queued === 0 || isUploading} className="inline-flex items-center gap-2 rounded-lg bg-[#0e7c7b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#096968] disabled:cursor-not-allowed disabled:opacity-50"><Upload size={16}/>{isUploading ? "Uploading…" : "Upload eligible files"}</button></div>
        </div></section>
      </div>
    </main>
  </RoleGuard>;
}
