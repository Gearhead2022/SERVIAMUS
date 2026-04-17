import { Request, Response } from "express";
import { PaymentMethod } from "@prisma/client";
import { getBillingsService, payBillingService } from "./billing.services";

export const getBillingsController = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const billings = await getBillingsService(status);

    return res.status(200).json({
      success: true,
      data: billings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch billings.",
    });
  }
};

export const payBillingController = async (req: Request, res: Response) => {
  try {
    const billingId = Number(req.params.billingId);
    const rawMethod = typeof req.body?.method === "string" ? req.body.method : "CASH";
    const method = Object.values(PaymentMethod).includes(rawMethod as PaymentMethod)
      ? (rawMethod as PaymentMethod)
      : "CASH";

    if (!billingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing record.",
      });
    }

    const billing = await payBillingService(billingId, method);

    return res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update billing status.",
    });
  }
};
