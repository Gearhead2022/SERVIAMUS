// backend/src/modules/billing/billing.controller.ts

import { Request, Response } from "express";
import {
  createPayment,
  updateBillingStatus,
  getAllBillings,
  payBilling,
  getAllPayment,
  updateBillingDiscount,
} from "./billing.services";
import { getIO } from "../../socket";
import { createNotification, resolveUsersByRoleNames } from "../notification/notification.services";
import { BillingFilter } from "./billing.types";
import { PaymentMethod, RequestType } from "@prisma/client";

const billingUpdateRooms = [
  "role_ADMIN",
  "role_CASHIER",
  "role_LAB",
  "role_LABORATORY",
] as const;

const emitBillingUpdated = (payload: {
  billingId?: number;
  patientId?: number;
  reason: string;
  requestId?: number;
}) => {
  getIO().to([...billingUpdateRooms]).emit("billing:updated", payload);
};

const notifyLaboratoryPaymentReady = async (billing: {
  billing_code: string;
  req_id: number;
  request?: {
    req_type?: string;
  } | null;
}) => {
  if (billing.request?.req_type !== "LABORATORY") {
    return;
  }

  const laboratoryUserIds = await resolveUsersByRoleNames(["LAB", "LABORATORY"]);

  await createNotification({
    userIds: laboratoryUserIds,
    type: "SYSTEM",
    title: "Laboratory Billing Paid",
    message: `Billing ${billing.billing_code} has been paid and is ready for laboratory processing.`,
    entity: "lab",
    entity_id: billing.req_id,
  });
};

// for applying discount

export const updateBillingDiscountController =
  async (req: Request, res: Response) => {
    try {

      const billing_id = Number(
        req.params.billing_id
      );

      const updated =
        await updateBillingDiscount({
          billing_id,
          discount: Number(req.body.discount),
          discount_reason:
            req.body.discount_reason ?? null,
        });

      return res.status(200).json({
        success: true,
        data: updated,
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// For Payment
export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const { billing_id, amount, method, reference_no } = req.body;

    if (!billing_id || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "billing_id, amount, and method are required",
      });
    }

    const result = await createPayment(
      billing_id,
      parseFloat(amount),
      method,
      reference_no
    );

    emitBillingUpdated({
      billingId: result.billing.billing_id,
      patientId: result.billing.request?.patient?.patient_id,
      reason: "payment-posted",
      requestId: result.billing.req_id,
    });

    await notifyLaboratoryPaymentReady(result.billing);

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

export const updateBillingStatusController = async (req: Request, res: Response) => {
  try {
    const billing_id = Array.isArray(req.params.billing_id) ? req.params.billing_id[0] : req.params.billing_id;
    const { status } = req.body;
    const billingId = parseInt(billing_id, 10);

    if (isNaN(billingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing ID",
      });
    }

    if (!["PENDING", "DONE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const billing = await updateBillingStatus(billingId, status);

    emitBillingUpdated({
      billingId: billing.billing_id,
      patientId: billing.request?.patient?.patient_id,
      reason: "billing-status-updated",
      requestId: billing.req_id,
    });

    return res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllBillingsController = async (req: Request, res: Response) => {
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

    const billings = await getAllBillings(
      page, limit, search, status as BillingFilter, dateFrom, dateTo, sort
    );

    return res.status(200).json({
      success: true,
      data: billings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const payBillingController = async (req: Request, res: Response) => {
  try {
    const billingId = Array.isArray(req.params.billingId) ? req.params.billingId[0] : req.params.billingId;
    const id = parseInt(billingId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing ID",
      });
    }

    const billing = await payBilling(id);

    emitBillingUpdated({
      billingId: billing.billing_id,
      patientId: billing.request?.patient?.patient_id,
      reason: "billing-paid",
      requestId: billing.req_id,
    });

    await notifyLaboratoryPaymentReady(billing);

    return res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllpaymentsController = async (req: Request, res: Response) => {
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

    const method =
      typeof req.query.method === "string" && req.query.method !== ""
        ? req.query.method
        : undefined;

    const type =
      typeof req.query.type === "string" && req.query.type !== ""
        ? req.query.type
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


    const billings = await getAllPayment(
      page,
      limit,
      search,
      status as BillingFilter,
      method as PaymentMethod,
      type as RequestType,
      dateFrom,
      dateTo,
      sort,
    );

    return res.status(200).json({
      success: true,
      data: billings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
