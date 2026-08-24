import { Request, Response } from "express";
import { handlePatientChartError } from "./patient-chart.errors";
import { createPatientChartAttachment, decodeChartHeader, deletePatientChartAttachment, getPatientChartAttachmentFile, getPatientChartAttachmentsPage, resolvePatientChartBatchPatients } from "./patient-chart.services";

export const listPatientChartAttachmentsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);
    if (!Number.isInteger(patientId) || patientId <= 0) return res.status(400).json({ success: false, message: "Invalid patient." });
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page <= 0 || limit <= 0) return res.status(400).json({ success: false, message: "Invalid pagination." });
    return res.status(200).json({ success: true, ...(await getPatientChartAttachmentsPage(patientId, page, limit, search)) });
  } catch (error) { return handlePatientChartError(res, error, "Failed to fetch patient chart files."); }
};

export const uploadPatientChartAttachmentController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.query.patientId);
    const uploadedBy = req.user?.user_id;
    if (!Number.isInteger(patientId) || patientId <= 0 || !uploadedBy) return res.status(400).json({ success: false, message: "A valid patient is required." });
    const result = await createPatientChartAttachment({
      body: req.body, patientId, uploadedBy,
      fileName: decodeChartHeader(req.header("x-file-name")) || "patient-chart",
      mimeType: decodeChartHeader(req.header("x-file-type")),
    });
    return res.status(result.duplicate ? 200 : 201).json({ success: true, data: result.attachment, duplicate: result.duplicate });
  } catch (error) { return handlePatientChartError(res, error, "Failed to upload patient chart file."); }
};

export const resolvePatientChartBatchPatientsController = async (req: Request, res: Response) => {
  try {
    const patientCodes = req.body?.patientCodes;
    if (!Array.isArray(patientCodes) || patientCodes.some((code) => typeof code !== "string")) {
      return res.status(400).json({ success: false, message: "Provide an array of patient codes." });
    }
    const patients = await resolvePatientChartBatchPatients(patientCodes);
    return res.status(200).json({ success: true, data: patients });
  } catch (error) { return handlePatientChartError(res, error, "Failed to resolve batch patients."); }
};

export const downloadPatientChartAttachmentController = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.attachmentId);
    if (!Number.isInteger(attachmentId) || attachmentId <= 0) return res.status(400).json({ success: false, message: "Invalid patient chart file." });
    const attachment = await getPatientChartAttachmentFile(attachmentId);
    res.setHeader("Content-Type", attachment.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${attachment.file_name.replace(/\"/g, "")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(attachment.file);
  } catch (error) { return handlePatientChartError(res, error, "Failed to open patient chart file."); }
};

export const deletePatientChartAttachmentController = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.attachmentId);
    if (!Number.isInteger(attachmentId) || attachmentId <= 0) return res.status(400).json({ success: false, message: "Invalid patient chart file." });
    await deletePatientChartAttachment(attachmentId);
    return res.status(200).json({ success: true, message: "Patient chart file deleted." });
  } catch (error) { return handlePatientChartError(res, error, "Failed to delete patient chart file."); }
};
