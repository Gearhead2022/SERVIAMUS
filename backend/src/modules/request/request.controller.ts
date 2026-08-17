import { Request, Response } from "express";
import { getPrevVitalSigns, createRequest, getAllRegisteredUsers, getRequestData, getAllRequests, deleteRequest, updateRequest, getLastRecord, getAllUsers, updateUser, deleteUser } from "./request.services";
import { createNotification, resolveNotificationUsers, resolveUsersByRoleNames } from "../notification/notification.services";
import { getIO } from "../../socket";
import { RequestType } from "@prisma/client";

const WORKFLOW_ROOMS = ["role_ADMIN", "role_CASHIER", "role_LAB", "role_LABORATORY", "role_STAFF", "role_DOCTOR", "role_ENCODER"] as const;

const normalizeIds = (ids: number | number[]) => {
  return Array.isArray(ids) ? ids : [ids];
};

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

    return res.status(200).json({
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

    const requestUserIds = await resolveNotificationUsers(request);
    const adminUserIds = await resolveUsersByRoleNames(["ADMIN"]);
    const doctorUserIds = await resolveUsersByRoleNames(["DOCTOR"]);

    const notificationUserIds = Array.from(
      new Set([...normalizeIds(requestUserIds), ...adminUserIds, ...doctorUserIds])
    );

    await createNotification({
      userIds: notificationUserIds,
      type: "NEW_REQUEST",
      title: "New Request",
      message: `New ${request.result.req_type} request created`,
      entity: "request",
      entity_id: request.result.req_id,
    });

    const payload = {
      patientId: request.result.patient_id,
      reason: "request-created",
      requestId: request.result.req_id,
    };

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("consultation:updated", payload);

    if (request.result.req_type === "LABORATORY") {

      io.to([...WORKFLOW_ROOMS]).emit("lab:updated", payload);

      io.to([...WORKFLOW_ROOMS]).emit("billing:updated", {
        ...payload,
        reason: "billing-created",
      });

      const cashierUserIds = await resolveUsersByRoleNames(["CASHIER"]);
      await createNotification({
        userIds: cashierUserIds,
        type: "NEW_REQUEST",
        title: "New Laboratory Billing",
        message: "A laboratory billing record is ready for cashier processing.",
        entity: "billing",
        entity_id: request.result.req_id,
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

    return res.status(200).json({
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

    const payload = {
      requestId,
      reason: "request-deleted",
    };

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("request:deleted", payload);
    io.to([...WORKFLOW_ROOMS]).emit("consultation:deleted", payload);
    io.to([...WORKFLOW_ROOMS]).emit("billing:deleted", payload);
    io.to([...WORKFLOW_ROOMS]).emit("lab:deleted", payload);

    return res.status(200).json({
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

    const payload = {
      requestId: req_id,
      patientId: result?.result.patient_id,
      reason: "request-updated",
    };

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("request:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("consultation:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("billing:updated", payload);
    io.to([...WORKFLOW_ROOMS]).emit("lab:updated", payload);

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

export const getLastRecordRequestController = async (req: Request, res: Response) => {
  try {
    const patient_id = Number(req.params.patient_id);

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId",
      });
    }

    const result = await getLastRecord(patient_id);

    return res.status(200).json({
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

export const getAllUsersController = async (
  req: Request,
  res: Response
) => {
  try {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const sort =
      typeof req.query.sort === "string"
        ? req.query.sort
        : undefined;

    const role =
      typeof req.query.role === "string"
        ? req.query.role
        : undefined;

    const users =
      await getAllUsers(
        page,
        limit,
        search,
        sort,
        role
      );

    return res.status(200).json({
      success: true,
      ...users,
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const user_id = Number(req.params.user_id);

    if (isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const updatedUser = await updateUser(user_id, req.body);

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("users:updated", {
      userId: user_id,
      reason: "user-updated",
    });

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Account updated successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.user_id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId",
      });
    }

    const user = await deleteUser(userId);

    const io = getIO();

    io.to([...WORKFLOW_ROOMS]).emit("users:deleted", {
      userId,
      reason: "user-deleted",
    });

    return res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
