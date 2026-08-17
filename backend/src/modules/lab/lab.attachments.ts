import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "../../config/prismaClient";
import { LabModuleError } from "./lab.errors";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const UPLOAD_DIRECTORY = path.resolve(process.cwd(), "uploads", "external-lab-results");

const allowedMimeTypes = new Map([
  ["application/pdf", ".pdf"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
]);

const decodeHeader = (value: unknown) => {
  if (typeof value !== "string") return "";

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
};

const sanitizeFileName = (fileName: string) =>
  path
    .basename(fileName)
    .replace(/[^a-zA-Z0-9._() -]/g, "_")
    .slice(0, 255);

export type ExternalLabAttachmentInput = {
  body: Buffer;
  description?: string;
  fileName: string;
  labId?: number | null;
  mimeType: string;
  patientId: number;
  sourceLaboratory?: string;
  uploadedBy: number;
};

export const createExternalLabAttachment = async ({
  body,
  description,
  fileName,
  labId,
  mimeType,
  patientId,
  sourceLaboratory,
  uploadedBy,
}: ExternalLabAttachmentInput) => {
  if (!Buffer.isBuffer(body) || body.length === 0) {
    throw new LabModuleError("Choose a laboratory result file to upload.");
  }

  if (body.length > MAX_ATTACHMENT_SIZE) {
    throw new LabModuleError("The attachment must be 10 MB or smaller.");
  }

  const extension = allowedMimeTypes.get(mimeType);
  if (!extension) {
    throw new LabModuleError("Only PDF, JPG, and PNG laboratory result files are allowed.");
  }

  const safeFileName = sanitizeFileName(fileName);
  if (!safeFileName) {
    throw new LabModuleError("The uploaded file needs a valid file name.");
  }

  const [patient, uploader, labRequest] = await Promise.all([
  prisma.patients.findUnique({
    where: { patient_id: patientId },
    select: { patient_id: true },
  }),

  prisma.users.findUnique({
    where: { user_id: uploadedBy },
    select: { user_id: true },
  }),

  labId
    ? prisma.laboratoryRequestItem.findFirst({
        where: {
          item_id: labId,
          laboratoryRequest: {
            is: {
              request: {
                is: {
                  patient_id: patientId,
                },
              },
            },
          },
        },
        select: {
          item_id: true,
        },
      })
    : Promise.resolve(null),
]);

  if (!patient) throw new LabModuleError("The selected patient was not found.", 404);
  if (!uploader) throw new LabModuleError("The uploading laboratory user was not found.", 401);
  if (labId && !labRequest) {
    throw new LabModuleError("The laboratory request does not belong to this patient.");
  }

  const storedName = `${randomUUID()}${extension}`;
  const storedPath = path.join(UPLOAD_DIRECTORY, storedName);
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(storedPath, body, { flag: "wx" });

  try {
    return await prisma.externalLabAttachment.create({
      data: {
        patient_id: patientId,
        lab_id: labId ?? null,
        uploaded_by: uploadedBy,
        file_name: safeFileName,
        stored_name: storedName,
        mime_type: mimeType,
        file_size: body.length,
        source_laboratory: sourceLaboratory?.trim().slice(0, 150) || null,
        description: description?.trim().slice(0, 500) || null,
      },
      select: {
        attachment_id: true,
        patient_id: true,
        lab_id: true,
        file_name: true,
        mime_type: true,
        file_size: true,
        source_laboratory: true,
        description: true,
        created_at: true,
        uploader: { select: { name: true } },
      },
    });
  } catch (error) {
    await unlink(storedPath).catch(() => undefined);
    throw error;
  }
};

export const getExternalLabAttachments = async (patientId: number) => {
  const patient = await prisma.patients.findUnique({
    where: { patient_id: patientId },
    select: { patient_id: true },
  });

  if (!patient) throw new LabModuleError("The selected patient was not found.", 404);

  return prisma.externalLabAttachment.findMany({
    where: { patient_id: patientId },
    orderBy: { created_at: "desc" },
    select: {
      attachment_id: true,
      patient_id: true,
      lab_id: true,
      file_name: true,
      mime_type: true,
      file_size: true,
      source_laboratory: true,
      description: true,
      created_at: true,
      uploader: { select: { name: true } },
    },
  });
};

export const getExternalLabAttachmentFile = async (attachmentId: number) => {
  const attachment = await prisma.externalLabAttachment.findUnique({
    where: { attachment_id: attachmentId },
    select: {
      file_name: true,
      mime_type: true,
      stored_name: true,
    },
  });

  if (!attachment) throw new LabModuleError("The laboratory attachment was not found.", 404);

  try {
    const file = await readFile(path.join(UPLOAD_DIRECTORY, attachment.stored_name));
    return { ...attachment, file };
  } catch {
    throw new LabModuleError("The laboratory attachment file is no longer available.", 404);
  }
};

export const getAttachmentHeaderValue = decodeHeader;
