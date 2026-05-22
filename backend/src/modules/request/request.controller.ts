import { Request, Response } from "express";
import { getPrevVitalSigns, createRequest, getAllRegisteredUsers, getRequestData, getAllRequests, deleteRequest, updateRequest } from "./request.services";
import {
  createNotification,
  resolveNotificationUsers,
  resolveUsersByRoleNames,
} from "../notification/notification.services";
import { getIO } from "../../socket";
import { RequestType } from "@prisma/client";

const labUpdateRooms = ["role_ADMIN", "role_DOCTOR", "role_LAB", "role_LABORATORY"] as const;
const billingUpdateRooms = [
  "role_ADMIN",
  "role_CASHIER",
  "role_LAB",
  "role_LABORATORY",
] as const;
const requestUpdateRooms = [
  "role_ADMIN",
  "role_CASHIER",
  "role_LAB",
  "role_LABORATORY",
  "role_STAFF",
] as const;


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

    console.log(request)

    const io = getIO();

    io.to([...labUpdateRooms]).emit("request:updated");

    if (request.result.req_type === "LABORATORY") {
      io.to([...labUpdateRooms]).emit("lab:updated", {
        patientId: request.result.patient_id,
        reason: "request-created",
        requestId: request.result.req_id,
      });

      io.to([...billingUpdateRooms]).emit("billing:updated", {
        patientId: request.result.patient_id,
        reason: "billing-created",
        requestId: request.result.req_id,
      });

      const cashierUserIds = await resolveUsersByRoleNames(["CASHIER"]);
      await createNotification({
        userIds: cashierUserIds,
        type: "NEW_REQUEST",
        title: "New Laboratory Billing",
        message: "A laboratory billing record is ready for cashier processing.",
        entity: "billing",
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

export const getAllRequestController = async (req: Request, res: Response) => {
  try {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" && req.query.status !== ""
        ? req.query.status
        : undefined;

    const req_type =
      typeof req.query.req_type === "string" && req.query.req_type !== ""
        ? req.query.req_type
        : undefined;

    const dateFrom =
      typeof req.query.dateFrom === "string" && req.query.dateFrom !== ""
        ? req.query.dateFrom
        : undefined;

    const dateTo =
      typeof req.query.dateTo === "string" && req.query.dateTo !== ""
        ? req.query.dateTo
        : undefined;

    const sort =
      typeof req.query.sort === "string" && req.query.sort !== ""
        ? req.query.sort
        : undefined;

    const request = await getAllRequests(page, limit, search, status, req_type as RequestType, dateFrom, dateTo, sort);

    return res.status(200).json({
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

export const deleteRequestController = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.request_id);

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId",
      });
    }

    const request = await deleteRequest(requestId);

    const io = getIO();

    io.to([...requestUpdateRooms]).emit("request:updated");

    return res.status(201).json({
      success: true,
      data: request
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRequestController = async (req: Request, res: Response) => {
  try {
    const req_id = Number(req.params.request_id);

    if (!req_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId",
      });
    }

    const result = await updateRequest(req_id, req.body);
    const userIds = await resolveNotificationUsers(result);
    const io = getIO();

    io.to([...labUpdateRooms]).emit("request:updated");

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
