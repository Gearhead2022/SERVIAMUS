import { Request, Response } from "express";
import {
  addPatient,
  getAllPatients,
  getPatientById,
  getPatientDeletionRequests,
  requestPatientDeletion,
  reviewPatientDeletionRequest,
  updatePatient,
} from "./patient.services";
import { createNotification, resolveUsersByRoleNames } from "../notification/notification.services";
import { getIO } from "../../socket";

const WORKFLOW_ROOMS = ["role_ADMIN", "role_CASHIER", "role_LAB", "role_LABORATORY", "role_STAFF", "role_DOCTOR", "role_ENCODER"] as const;

export const getAllPatientsController = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const patients = await getAllPatients(search);

    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addPatientController = async (req: Request, res: Response) => {
  try {
    const patient = await addPatient(req.body);

    const payload = {
      patientId: patient.patient_id,
      reason: "patient-created",
    };

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("admin:updated", payload);

    return res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getPatientByIdController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await getPatientById(patientId);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatientController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await updatePatient(patientId, req.body);

    const payload = {
      patientId: patient.patient_id,
      reason: "patient-created",
    };

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("admin:updated", payload);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePatientController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const requestedBy = req.user?.user_id;
    if (!requestedBy) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const outcome = await requestPatientDeletion(patientId, requestedBy);
    const payload = {
      patientId,
      reason: outcome.action === "deleted" ? "patient-deleted" : "patient-deletion-requested",
    };
    const io = getIO();

    if (outcome.action === "approval_required" && !outcome.already_pending) {
      const adminUserIds = await resolveUsersByRoleNames(["ADMIN"]);
      await createNotification({
        userIds: adminUserIds,
        type: "SYSTEM",
        title: "Patient Deletion Approval Required",
        message: "A staff member requested deletion of a patient with existing records.",
        entity: "patient-deletion",
        entity_id: outcome.deletion_request_id,
      });
    }

    io.to([...WORKFLOW_ROOMS]).emit(
      outcome.action === "deleted" ? "request:updated" : "admin:updated",
      payload
    );

    return res.status(outcome.action === "deleted" ? 200 : 202).json({
      success: true,
      data: outcome,
    });
  } catch (error: any) {
    return res.status(error.message === "Patient not found" ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPatientDeletionRequestsController = async (_req: Request, res: Response) => {
  try {
    const requests = await getPatientDeletionRequests();
    return res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewPatientDeletionRequestController = async (req: Request, res: Response) => {
  try {
    const deletionRequestId = Number(req.params.requestId);
    const decision = req.body?.decision;
    const reviewedBy = req.user?.user_id;

    if (!Number.isInteger(deletionRequestId) || !reviewedBy) {
      return res.status(400).json({ success: false, message: "Invalid deletion request." });
    }
    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return res.status(400).json({ success: false, message: "Invalid review decision." });
    }

    const request = await reviewPatientDeletionRequest(deletionRequestId, reviewedBy, decision);
    await createNotification({
      userIds: request.requested_by,
      type: decision === "APPROVED" ? "APPROVED" : "REJECTED",
      title: decision === "APPROVED" ? "Patient Deletion Approved" : "Patient Deletion Rejected",
      message:
        decision === "APPROVED"
          ? `${request.patient_name}'s record was deleted after administrator approval.`
          : `${request.patient_name}'s record was kept after administrator review.`,
      entity: "patient-deletion",
      entity_id: request.deletion_request_id,
    });
    const io = getIO();
    const payload = {
      patientId: request.patient_id ?? undefined,
      reason: decision === "APPROVED" ? "patient-deletion-approved" : "patient-deletion-rejected",
    };
    io.to([...WORKFLOW_ROOMS]).emit("admin:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);

    return res.status(200).json({ success: true, data: request });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
