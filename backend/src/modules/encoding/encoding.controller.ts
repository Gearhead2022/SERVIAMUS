import { Request, Response } from "express";
import {
  getEncodingLatestConsultationService,
  getEncodingConsultationsService,
  saveEncodingConsultationService,
  saveEncodingFollowUpService,
  saveEncodingLabResultService,
} from "./encoding.services";

export const getEncodingConsultationsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);
    if (!Number.isInteger(patientId) || patientId <= 0) return res.status(400).json({ success: false, message: "Invalid patient." });
    return res.status(200).json({ success: true, data: await getEncodingConsultationsService(patientId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message ?? "Unable to load consultations." });
  }
};

export const saveEncodingConsultationController = async (req: Request, res: Response) => {
  try {
    const { patientId, consultationDate, fields } = req.body ?? {};
    if (!patientId || !consultationDate || !fields || typeof fields !== "object") return res.status(400).json({ success: false, message: "Patient, consultation date, and consultation fields are required." });
    const data = await saveEncodingConsultationService({ patientId: Number(patientId), consultationDate: String(consultationDate), fields, userId: req.user?.user_id });
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message ?? "Unable to save encoded consultation." });
  }
};

export const getEncodingLatestConsultationController = async (
  req: Request,
  res: Response
) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient.",
      });
    }

    const data = await getEncodingLatestConsultationService(patientId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message ?? "Unable to load latest consultation.",
    });
  }
};

export const saveEncodingLabResultController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      patientId,
      category,
      form,
      requestedBy,
      resultDate,
      schemaKey,
      testName,
      medTechUserId,
      pathologistUserId,
    } = req.body ?? {};

    if (!patientId || !testName || !form || typeof form !== "object") {
      return res.status(400).json({
        success: false,
        message: "Patient, laboratory test, and result fields are required.",
      });
    }

    const data = await saveEncodingLabResultService({
      patientId: Number(patientId),
      category: typeof category === "string" ? category : "other",
      form,
      requestedBy: typeof requestedBy === "string" ? requestedBy : undefined,
      resultDate: typeof resultDate === "string" ? resultDate : undefined,
      schemaKey: typeof schemaKey === "string" ? schemaKey : null,
      testName: String(testName),
      medTechUserId: typeof medTechUserId === "number" ? medTechUserId : null,
      pathologistUserId:
        typeof pathologistUserId === "number" ? pathologistUserId : null,
      userId: req.user?.user_id,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message ?? "Unable to save encoded laboratory result.",
    });
  }
};

export const saveEncodingFollowUpController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      patientId,
      consultationId,
      followupDate,
      impression,
      instruction,
      bp,
      temp,
      cr,
      rr,
      wt,
      ht,
    } = req.body ?? {};

    if (!patientId || !followupDate) {
      return res.status(400).json({
        success: false,
        message: "Patient and consultation date are required.",
      });
    }

    const data = await saveEncodingFollowUpService({
      patientId: Number(patientId),
      consultationId: consultationId ? Number(consultationId) : null,
      followupDate: String(followupDate),
      impression: typeof impression === "string" ? impression : null,
      instruction: typeof instruction === "string" ? instruction : null,
      bp: typeof bp === "string" ? bp : null,
      temp: typeof temp === "string" ? temp : null,
      cr: typeof cr === "string" ? cr : null,
      rr: typeof rr === "string" ? rr : null,
      wt: typeof wt === "string" ? wt : null,
      ht: typeof ht === "string" ? ht : null,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message ?? "Unable to save encoded consultation.",
    });
  }
};
