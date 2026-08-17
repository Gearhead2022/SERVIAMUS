"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ExternalLabAttachment } from "@/types/LabTypes";
import {
  useExternalLabAttachments,
  useUploadExternalLabAttachment,
} from "@/hooks/Lab/useLab";
import { openExternalLabAttachment } from "@/services/lab.service";
import { FileText, Image, LoaderCircle, Paperclip, Upload, ExternalLink } from "lucide-react";

type Props = {
  canUpload?: boolean;
  labId?: number;
  patientCode?: string;
  patientId: number;
  patientName?: string;
};

const fileSize = (size: number) =>
  size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;

const attachmentIcon = (attachment: ExternalLabAttachment) =>
  attachment.mime_type === "application/pdf" ? <FileText size={17} /> : <Image size={17} />;

export default function ExternalLabAttachments({
  canUpload = false,
  labId,
  patientCode,
  patientId,
  patientName,
}: Props) {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceLaboratory, setSourceLaboratory] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data: attachments = [], isLoading } = useExternalLabAttachments(patientId);
  const upload = useUploadExternalLabAttachment();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file || upload.isPending) return;

    await upload.mutateAsync({
      patientId,
      labId,
      file,
      sourceLaboratory,
      description,
    });
    setFile(null);
    setSourceLaboratory("");
    setDescription("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="rounded-2xl border border-[#d7e7e3] bg-white p-4 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0e7c7b]">
            <Paperclip size={14} /> External laboratory references
          </p>
          <h3 className="mt-1 text-base font-semibold text-[#143a35]">
            {patientName ?? "Patient"}{patientCode ? ` · ${patientCode}` : ""}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            PDF, JPG, or PNG results received from another laboratory.
          </p>
        </div>
        <span className="rounded-full bg-[#eff6f4] px-2.5 py-1 text-[11px] font-semibold text-[#0e7c7b]">
          {attachments.length} {attachments.length === 1 ? "file" : "files"}
        </span>
      </div>

      {canUpload ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-[#b8d8d1] bg-[#f7fbfa] p-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[#63867f]">Result file</span>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={onFileChange}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e0f4f4] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#065050] hover:file:bg-[#cceae3]"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[#63867f]">Source laboratory</span>
            <input value={sourceLaboratory} onChange={(event) => setSourceLaboratory(event.target.value)} placeholder="e.g. ABC Diagnostic Center" className="w-full rounded-lg border border-[#d7e7e3] bg-white px-3 py-2 text-sm outline-none focus:border-[#0e7c7b]" />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-[#63867f]">Reference note</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional context for the doctor" className="w-full rounded-lg border border-[#d7e7e3] bg-white px-3 py-2 text-sm outline-none focus:border-[#0e7c7b]" />
          </label>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <p className="text-xs text-slate-500">{file ? `${file.name} · ${fileSize(file.size)}` : "Maximum file size: 10 MB"}</p>
            <button type="button" onClick={handleUpload} disabled={!file || upload.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[#0e7c7b] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#065f5b] disabled:cursor-not-allowed disabled:opacity-50">
              {upload.isPending ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
              Attach result
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading attached references…</p>
        ) : attachments.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">No external laboratory results are attached to this patient.</p>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.attachment_id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 rounded-lg bg-white p-2 text-[#0e7c7b] shadow-sm">{attachmentIcon(attachment)}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{attachment.file_name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {attachment.source_laboratory || "External laboratory"} · {fileSize(attachment.file_size)} · {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                  {attachment.description ? <p className="mt-1 text-xs text-slate-600">{attachment.description}</p> : null}
                  <p className="mt-1 text-[11px] text-slate-400">Attached by {attachment.uploader.name}</p>
                </div>
              </div>
              <button type="button" onClick={() => void openExternalLabAttachment(attachment.attachment_id)} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#b8d8d1] bg-white px-3 py-2 text-xs font-semibold text-[#0e7c7b] transition hover:bg-[#eff6f4]">
                View <ExternalLink size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
