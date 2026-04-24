// backend/src/modules/billing/billing.controller.ts

import { Request, Response } from "express";
import {
  createBilling,
  getBillingByRequestId,
  getBillingById,
  createPayment,
  updateBillingStatus,
  getAllBillings,
  payBilling,       
} from "./billing.services";

export const createBillingController = async (req: Request, res: Response) => {
  try {
    const { req_id, service_ids } = req.body;

    if (!req_id || !service_ids || !Array.isArray(service_ids)) {
      return res.status(400).json({
        success: false,
        message: "req_id and service_ids (array) are required",
      });
    }

    const billing = await createBilling(req_id, service_ids);

    return res.status(201).json({
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

export const getBillingByRequestIdController = async (req: Request, res: Response) => {
  try {
    const req_id = Array.isArray(req.params.req_id) ? req.params.req_id[0] : req.params.req_id;
    const requestId = parseInt(req_id, 10);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const billing = await getBillingByRequestId(requestId);

    return res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBillingByIdController = async (req: Request, res: Response) => {
  try {
    const billing_id = Array.isArray(req.params.billing_id) ? req.params.billing_id[0] : req.params.billing_id;
    const billingId = parseInt(billing_id, 10);

    if (isNaN(billingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing ID",
      });
    }

    const billing = await getBillingById(billingId);

    return res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

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
    const billings = await getAllBillings();
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
