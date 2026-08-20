import { randomUUID } from "crypto";
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

  const [patient, uploader] = await Promise.all([
    prisma.patients.findUnique({ where: { patient_id: patientId }, select: { patient_id: true } }),
    prisma.users.findUnique({ where: { user_id: uploadedBy }, select: { user_id: true } }),
  ]);
  if (!patient) throw new PatientChartError(404, "The selected patient was not found.");
  if (!uploader) throw new PatientChartError(401, "The uploading administrator was not found.");

  const patientDirectoryName = `patient-${patient.patient_id}`;
  const storedFileName = `${randomUUID()}${extension}`;
  // Store a portable relative path so each patient's private chart remains
  // physically grouped without adding a second database column.
  const storedName = path.posix.join(patientDirectoryName, storedFileName);
  const storedPath = path.join(UPLOAD_DIRECTORY, patientDirectoryName, storedFileName);
  await mkdir(path.dirname(storedPath), { recursive: true });
  await writeFile(storedPath, body, { flag: "wx" });

  try {
    return await prisma.patientChartAttachment.create({
      data: { patient_id: patientId, uploaded_by: uploadedBy, file_name: safeFileName, stored_name: storedName, mime_type: resolvedMimeType, file_size: body.length },
      select: {
        attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true,
        uploader: { select: { name: true } },
      },
    });
  } catch (error) {
    await unlink(storedPath).catch(() => undefined);
    throw error;
  }
};

export const getPatientChartAttachments = async (patientId: number) => {
  const patient = await prisma.patients.findUnique({ where: { patient_id: patientId }, select: { patient_id: true } });
  if (!patient) throw new PatientChartError(404, "The selected patient was not found.");
  return prisma.patientChartAttachment.findMany({
    where: { patient_id: patientId }, orderBy: { created_at: "desc" },
    select: { attachment_id: true, patient_id: true, file_name: true, mime_type: true, file_size: true, created_at: true, uploader: { select: { name: true } } },
  });
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
