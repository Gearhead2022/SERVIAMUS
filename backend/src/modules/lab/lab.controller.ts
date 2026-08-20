import { Request, Response } from "express";
import { getIO } from "../../socket";
import {
  createNotification,
  notifyDoctors,
  resolveUsersByRoleNames,
} from "../notification/notification.services";
import { handleLabModuleError } from "./lab.errors";
import {
  createLabRequestService,
  getAllUsersService,
  getLabRequestByIdService,
  getLabRequestsService,
  getLabTestsService,
  getPatientLabRequestsService,
  getPatientLabRecordsService,
  getPatientRecordsService,
  saveLabResultService,
  searchPatientsService,
  updateLabRequestStatusService,
  getLabPreviewService,
} from "./lab.services";
import {
  createExternalLabAttachment,
  getAttachmentHeaderValue,
  getExternalLabAttachmentFile,
  getExternalLabAttachments,
  getExternalLabAttachmentWorklist,
} from "./lab.attachments";

const labStatusValues = ["queued", "pending", "done"] as const;
const labCategoryValues = ["clinical-chemistry", "hematology", "parasitology", "urinalysis", "other"] as const;
const labRecordGroupValues = ["clinical-chemistry", "clinical-microscopy", "hematology", "other", "serology"] as const;

const WORKFLOW_ROOMS = ["role_ADMIN", "role_CASHIER", "role_LAB", "role_LABORATORY", "role_PATHOLOGIST", "role_STAFF", "role_DOCTOR", "role_ENCODER"] as const;

const emitLabUpdated = (payload: {
  labId?: number;
  patientId?: number;
  reason: string;
  requestId?: number;
}) => {
  getIO().to([...WORKFLOW_ROOMS]).emit("lab:updated", payload);
};

const emitBillingUpdated = (payload: {
  patientId?: number;
  reason: string;
  requestId?: number;
}) => {
  getIO().to([...WORKFLOW_ROOMS]).emit("billing:updated", payload);
};

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch users.");
  }
};

export const searchPatientsController = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const patients = await searchPatientsService(search);

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to search patients.");
  }
};

export const getLabTestsController = async (_req: Request, res: Response) => {
  try {
    const tests = await getLabTestsService();

    return res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch laboratory tests.");
  }
};

export const getPatientRecordsController = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const records = await getPatientRecordsService(search);

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch patient records.");
  }
};

export const getPatientLabRecordsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);
    const dateFrom =
      typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
    const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;
    const recordGroup =
      typeof req.query.recordGroup === "string" ? req.query.recordGroup : undefined;
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient record request.",
      });
    }

    if (
      recordGroup &&
      !labRecordGroupValues.includes(
        recordGroup as (typeof labRecordGroupValues)[number]
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid laboratory record category filter.",
      });
    }

    const records = await getPatientLabRecordsService(patientId, {
      dateFrom,
      dateTo,
      recordGroup,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: records.data,
      pagination: records.pagination,
    });
  } catch (error) {
    return handleLabModuleError(
      res,
      error,
      "Failed to fetch patient laboratory records."
    );
  }
};

export const getPatientLabRequestsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient request.",
      });
    }

    const requests = await getPatientLabRequestsService(patientId);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return handleLabModuleError(
      res,
      error,
      "Failed to fetch patient laboratory requests."
    );
  }
};

export const getExternalLabAttachmentsController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.params.patientId);
    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid patient." });
    }

    const attachments = await getExternalLabAttachments(patientId);
    return res.status(200).json({ success: true, data: attachments });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch laboratory attachments.");
  }
};

export const getExternalLabAttachmentWorklistController = async (
  _req: Request,
  res: Response
) => {
  try {
    const worklist = await getExternalLabAttachmentWorklist();
    return res.status(200).json({ success: true, data: worklist });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch the external laboratory worklist.");
  }
};

export const uploadExternalLabAttachmentController = async (req: Request, res: Response) => {
  try {
    const patientId = Number(req.query.patientId);
    const labId = req.query.labId ? Number(req.query.labId) : null;
    const uploadedBy = req.user?.user_id;

    if (!Number.isInteger(patientId) || patientId <= 0 || !uploadedBy) {
      return res.status(400).json({ success: false, message: "A valid patient is required." });
    }

    if (labId !== null && (!Number.isInteger(labId) || labId <= 0)) {
      return res.status(400).json({ success: false, message: "Invalid laboratory request." });
    }

    const attachment = await createExternalLabAttachment({
      body: req.body,
      patientId,
      labId,
      uploadedBy,
      fileName: getAttachmentHeaderValue(req.header("x-file-name")) || "laboratory-result",
      mimeType: getAttachmentHeaderValue(req.header("x-file-type")),
      sourceLaboratory: getAttachmentHeaderValue(req.header("x-source-laboratory")),
      description: getAttachmentHeaderValue(req.header("x-description")),
    });

    await notifyDoctors({
      type: "SYSTEM",
      title: "External Laboratory Result Attached",
      message: `An external laboratory result is now available for patient ID ${patientId}.`,
      entity: "lab-attachment",
      entity_id: attachment.attachment_id,
    });

    emitLabUpdated({ labId: labId ?? undefined, patientId, reason: "external-result-attached" });
    return res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to upload laboratory attachment.");
  }
};

export const downloadExternalLabAttachmentController = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.attachmentId);
    if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid laboratory attachment." });
    }

    const attachment = await getExternalLabAttachmentFile(attachmentId);
    res.setHeader("Content-Type", attachment.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${attachment.file_name.replace(/\"/g, "")}"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(attachment.file);
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to open laboratory attachment.");
  }
};

export const createLabRequestController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { patientId, requestedBy, tests, requestedDate } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!patientId || !Array.isArray(tests)) {
      return res.status(400).json({
        success: false,
        message: "Patient and requested tests are required.",
      });
    }

    const request = await createLabRequestService({
      patientId: Number(patientId),
      userId,
      requestedBy: typeof requestedBy === "string" ? requestedBy : undefined,
      requestedDate: typeof requestedDate === "string" ? requestedDate : undefined,
      tests,
    });

    emitLabUpdated({
      labId: request.labId,
      patientId: request.rawPatientId,
      reason: "request-created",
      requestId: request.requestId,
    });
    emitBillingUpdated({
      patientId: request.rawPatientId,
      reason: "billing-created",
      requestId: request.requestId,
    });

    const cashierUserIds = await resolveUsersByRoleNames(["CASHIER"]);
    await createNotification({
      userIds: cashierUserIds,
      type: "NEW_REQUEST",
      title: "New Laboratory Billing",
      message: "A laboratory billing record is ready for cashier processing.",
      entity: "billing",
    });

    await notifyDoctors({
      type: "NEW_REQUEST",
      title: "New Laboratory Request",
      message: `A laboratory request for patient ${request.patientId} is ready for doctor review.`,
      entity: "request",
      entity_id: request.requestId,
    });

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to create the lab request.");
  }
};

export const getLabRequestsController = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const requests = await getLabRequestsService(status);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch lab requests.");
  }
};

export const getLabRequestByIdController = async (req: Request, res: Response) => {
  try {
    const labId = Number(req.params.labId);

    if (!Number.isInteger(labId) || labId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid laboratory request id.",
      });
    }

    const request = await getLabRequestByIdService(labId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to fetch the lab request.");
  }
};

export const updateLabRequestStatusController = async (req: Request, res: Response) => {
  try {
    const labId = Number(req.params.labId);
    const status = req.body?.status;
    const userId = req.user?.user_id;

    if (!labId || !labStatusValues.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab request status update.",
      });
    }

    const currentRequest = await getLabRequestByIdService(labId);
    const isStartingLaboratoryRequest =
      status === "pending" && currentRequest.requestStatus === "queued";
    const request = await updateLabRequestStatusService(labId, status, userId);

    emitLabUpdated({
      labId: request.labId,
      patientId: request.rawPatientId,
      reason: "status-updated",
      requestId: request.requestId,
    });

    if (
      isStartingLaboratoryRequest ||
      (status === "done" && request.requestStatus === "done")
    ) {
      const staffUserIds = await resolveUsersByRoleNames(["STAFF"]);
      const isCompleted = status === "done";

      await createNotification({
        userIds: staffUserIds,
        type: "SYSTEM",
        title: isCompleted
          ? "Laboratory Request Completed"
          : "Laboratory Request Now Serving",
        message: isCompleted
          ? `Laboratory request for patient ${request.patientId} has been completed.`
          : `Laboratory request for patient ${request.patientId} is now being served.`,
        entity: "request",
        entity_id: request.requestId,
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to update the lab request status.");
  }
};

export const saveLabResultController = async (req: Request, res: Response) => {
  try {
    const { labId, category, form, medTechUserId, pathologistUserId } = req.body ?? {};
    const userId = req.user?.user_id;

    if (
      !labId ||
      !labCategoryValues.includes(category) ||
      !form ||
      typeof form !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid lab result payload.",
      });
    }

    const result = await saveLabResultService({
      labId: Number(labId),
      category,
      form,
      medTechUserId: typeof medTechUserId === "number" ? medTechUserId : null,
      userId,
      pathologistUserId:
        typeof pathologistUserId === "number" ? pathologistUserId : null,
    });

    emitLabUpdated({
      labId: result.labId,
      patientId: result.rawPatientId,
      reason: "result-saved",
      requestId: result.requestId,
    });

    await notifyDoctors({
      type: "SYSTEM",
      title: "Laboratory Result Ready",
      message: `A laboratory result for patient ${result.patientId} is ready for doctor review.`,
      entity: "request",
      entity_id: result.requestId,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleLabModuleError(res, error, "Failed to save the lab result.");
  }
};

// added by john

export const getLabPreviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const labid = Number(req.params.labid);

    if (!Number.isFinite(labid) || labid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid laboratory request id.",
      });
    }

    const itemId = req.query.itemId
      ? Number(req.query.itemId)
      : undefined;

    const data = await getLabPreviewService(
      labid,
      itemId
    );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Unable to load laboratory preview.",
    });
  }
};
