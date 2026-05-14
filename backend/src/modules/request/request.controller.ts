import { Request, Response } from "express";
import { getPrevVitalSigns, createRequest, getAllRegisteredUsers, getRequestData } from "./request.services";
import { createNotification, resolveNotificationUsers } from "../notification/notification.services";
import { getIO } from "../../socket";

const labUpdateRooms = ["role_ADMIN", "role_DOCTOR", "role_LAB", "role_LABORATORY"] as const;

export const getPrevVitalSignsController = async (req: Request, res: Response) => {
  try {
    const patient_id = Number(req.query.patient_id);

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient_id",
      });
    }

    const vitals = await getPrevVitalSigns(patient_id);

    return res.status(201).json({
      success: true,
      data: vitals
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createRequestController = async (req: Request, res: Response) => {
  try {
    const request = await createRequest(req.body);
    const userIds = await resolveNotificationUsers(request);

    await createNotification({
      userIds,
      type: "NEW_REQUEST",
      title: "New Request",
      message: `New ${request.result.req_type} request created`,
      entity: "request",
      entity_id: request.result.req_id,
    });

    const io = getIO();

    io.to([...labUpdateRooms]).emit("request:updated");

    if (request.result.req_type === "LABORATORY") {
      io.to([...labUpdateRooms]).emit("lab:updated", {
        patientId: request.result.patient_id,
        reason: "request-created",
        requestId: request.result.req_id,
      });
    }

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllRegisteredUsersController = async (req: Request, res: Response) => {
  try {
    const data = await getAllRegisteredUsers();

    return res.status(201).json({
      success: true,
      data: data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRequestDataController = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);

    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation_id",
      });
    }

    const prescriptions = await getRequestData(requestId);

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
