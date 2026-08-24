import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../../config/prismaClient";
import { PatientChartError } from "./patient-chart.errors";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UPLOAD_DIRECTORY = path.resolve(process.cwd(), "uploads", "patient-charts");
const allowedMimeTypes = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
]);

const mimeTypeByExtension = new Map(
  Array.from(allowedMimeTypes.entries()).map(([mimeType, extension]) => [
    extension,
    mimeType,
  ])
);
mimeTypeByExtension.set(".jpeg", "image/jpeg");

const sanitizeFileName = (fileName: string) =>
  path.basename(fileName).replace(/[^a-zA-Z0-9._() -]/g, "_").slice(0, 255);

const resolveStoredChartPath = (storedName: string) => {
  const resolvedPath = path.resolve(UPLOAD_DIRECTORY, storedName);
  const storageRoot = `${UPLOAD_DIRECTORY}${path.sep}`;

  return resolvedPath.startsWith(storageRoot) ? resolvedPath : null;
};

export const decodeChartHeader = (value: unknown) => {
  if (typeof value !== "string") return "";
  try { return decodeURIComponent(value).trim(); } catch { return value.trim(); }
};

const resolveChartMimeType = (mimeType: string, fileName: string) => {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (allowedMimeTypes.has(normalizedMimeType)) return normalizedMimeType;

  return mimeTypeByExtension.get(path.extname(fileName).toLowerCase()) ?? null;
};

const hasExpectedFileSignature = (body: Buffer, mimeType: string) => {
  if (mimeType === "application/pdf") {
    return body.indexOf("%PDF-", 0, "ascii") >= 0 && body.indexOf("%PDF-", 0, "ascii") <= 1024;
  }
  if (mimeType === "image/jpeg") {
    return body.length >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return body.length >= 8 && body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return false;
};

export type CreatePatientChartAttachmentInput = {
  body: Buffer;
  fileName: string;
  mimeType: string;
  patientId: number;
  uploadedBy: number;
};

export const createPatientChartAttachment = async ({
  body, fileName, mimeType, patientId, uploadedBy,
}: CreatePatientChartAttachmentInput) => {
  if (!Buffer.isBuffer(body) || body.length === 0) throw new PatientChartError(400, "Choose a chart file to upload.");
  if (body.length > MAX_FILE_SIZE) throw new PatientChartError(400, "Each chart file must be 10 MB or smaller.");
  const safeFileName = sanitizeFileName(fileName);
  if (!safeFileName) throw new PatientChartError(400, "The uploaded file needs a valid file name.");
  const resolvedMimeType = resolveChartMimeType(mimeType, safeFileName);
  const extension = resolvedMimeType ? allowedMimeTypes.get(resolvedMimeType) : null;
  if (!extension || !resolvedMimeType) throw new PatientChartError(400, "Only PDF, JPG, and PNG patient chart files are allowed.");
  if (!hasExpectedFileSignature(body, resolvedMimeType)) throw new PatientChartError(400, "The file content does not match its declared PDF, JPG, or PNG type.");
  const contentSha256 = createHash("sha256").update(body).digest("hex");

  const [patient, uploader] = await Promise.all([
    prisma.patients.findUnique({ where: { patient_id: patientId }, select: { patient_id: true } }),
    prisma.users.findUnique({ where: { user_id: uploadedBy }, select: { user_id: true } }),
  ]);
  if (!patient) throw new PatientChartError(404, "The selected patient was not found.");
  if (!uploader) throw new PatientChartError(401, "The uploading administrator was not found.");

  // Older chart rows predate checksum storage. Compare their existing files on
  // demand so a newly uploaded scan cannot duplicate a legacy attachment.
  const legacyAttachments = await prisma.patientChartAttachment.findMany({
    where: { patient_id: patientId, content_sha256: null },
    select: {
      attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true, stored_name: true,
      uploader: { select: { name: true } },
    },
  });
  for (const legacyAttachment of legacyAttachments) {
    const legacyPath = resolveStoredChartPath(legacyAttachment.stored_name);
    if (!legacyPath) continue;
    try {
      const legacyHash = createHash("sha256").update(await readFile(legacyPath)).digest("hex");
      if (legacyHash === contentSha256) {
        const { stored_name: _storedName, ...attachment } = legacyAttachment;
        return { attachment, duplicate: true };
      }
    } catch {
      // A missing legacy file is handled by its regular download path; it must
      // not prevent a valid new chart from being filed.
    }
  }

  const existingAttachment = await prisma.patientChartAttachment.findFirst({
    where: { patient_id: patientId, content_sha256: contentSha256 },
    select: {
      attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true,
      uploader: { select: { name: true } },
    },
  });
  if (existingAttachment) return { attachment: existingAttachment, duplicate: true };

  const patientDirectoryName = `patient-${patient.patient_id}`;
  const storedFileName = `${randomUUID()}${extension}`;
  // Store a portable relative path so each patient's private chart remains
  // physically grouped without adding a second database column.
  const storedName = path.posix.join(patientDirectoryName, storedFileName);
  const storedPath = path.join(UPLOAD_DIRECTORY, patientDirectoryName, storedFileName);
  await mkdir(path.dirname(storedPath), { recursive: true });
  await writeFile(storedPath, body, { flag: "wx" });

  try {
    const attachment = await prisma.patientChartAttachment.create({
      data: { patient_id: patientId, uploaded_by: uploadedBy, file_name: safeFileName, stored_name: storedName, mime_type: resolvedMimeType, file_size: body.length, content_sha256: contentSha256 },
      select: {
        attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true,
        uploader: { select: { name: true } },
      },
    });
    return { attachment, duplicate: false };
  } catch (error) {
    await unlink(storedPath).catch(() => undefined);
    if ((error as { code?: string }).code === "P2002") {
      const duplicateAttachment = await prisma.patientChartAttachment.findFirst({
        where: { patient_id: patientId, content_sha256: contentSha256 },
        select: {
          attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true,
          uploader: { select: { name: true } },
        },
      });
      if (duplicateAttachment) return { attachment: duplicateAttachment, duplicate: true };
    }
    throw error;
  }
};

export const resolvePatientChartBatchPatients = async (patientCodes: string[]) => {
  const normalizedCodes = [...new Set(patientCodes.map((code) => code.trim()).filter(Boolean))];
  if (!normalizedCodes.length) return [];
  if (normalizedCodes.length > 20_000) throw new PatientChartError(400, "A batch can reference at most 20,000 patient codes.");

  return prisma.patients.findMany({
    where: { patient_code: { in: normalizedCodes } },
    select: { patient_id: true, patient_code: true, name: true },
  });
};

export const getPatientChartAttachments = async (
  patientId: number,
  search?: string
) => {
  return getPatientChartAttachmentsPage(patientId, 1, 10, search);
};

export const getPatientChartAttachmentsPage = async (
  patientId: number,
  page: number,
  limit: number,
  search?: string
) => {
  const patient = await prisma.patients.findUnique({ where: { patient_id: patientId }, select: { patient_id: true } });
  if (!patient) throw new PatientChartError(404, "The selected patient was not found.");
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const keyword = search?.trim();
  const where = {
    patient_id: patientId,
    ...(keyword
      ? {
          file_name: {
            contains: keyword,
          },
        }
      : {}),
  };
  const [data, total] = await Promise.all([
    prisma.patientChartAttachment.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: { attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true, uploader: { select: { name: true } } },
    }),
    prisma.patientChartAttachment.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const getPatientChartAttachmentFile = async (attachmentId: number) => {
  const attachment = await prisma.patientChartAttachment.findUnique({
    where: { attachment_id: attachmentId }, select: { file_name: true, mime_type: true, stored_name: true },
  });
  if (!attachment) throw new PatientChartError(404, "The patient chart file was not found.");
  const storedPath = resolveStoredChartPath(attachment.stored_name);
  if (!storedPath) throw new PatientChartError(404, "The patient chart file is no longer available.");
  try { return { ...attachment, file: await readFile(storedPath) }; }
  catch { throw new PatientChartError(404, "The patient chart file is no longer available."); }
};

export const deletePatientChartAttachment = async (attachmentId: number) => {
  const attachment = await prisma.patientChartAttachment.findUnique({
    where: { attachment_id: attachmentId },
    select: { attachment_id: true, stored_name: true },
  });
  if (!attachment) throw new PatientChartError(404, "The patient chart file was not found.");

  await prisma.patientChartAttachment.delete({ where: { attachment_id: attachmentId } });

  const storedPath = resolveStoredChartPath(attachment.stored_name);
  if (storedPath) await unlink(storedPath).catch(() => undefined);
};
