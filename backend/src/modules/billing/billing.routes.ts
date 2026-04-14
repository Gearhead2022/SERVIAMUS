import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  createBillingController,
  getBillingByRequestIdController,
  getBillingByIdController,
  createPaymentController,
  updateBillingStatusController,
  getAllBillingsController,
} from "./billing.controller";

const router = Router();

// Get all billings (CASHIER only)
router.get("/", authorize(["CASHIER"]), getAllBillingsController);

// Create billing from a request
router.post("/create", createBillingController);

// Get billing by request ID
router.get("/request/:req_id", getBillingByRequestIdController);

// Get billing by billing ID (CASHIER only)
router.get("/:billing_id", authorize(["CASHIER"]), getBillingByIdController);

// Process payment (CASHIER only)
router.post("/payment", authorize(["CASHIER"]), createPaymentController);

// Update billing status (CASHIER only)
router.put("/:billing_id", authorize(["CASHIER"]), updateBillingStatusController);

export default router;