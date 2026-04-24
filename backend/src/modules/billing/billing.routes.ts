import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  getAllBillingsController,
  payBillingController,
  createBillingController,
  getBillingByRequestIdController,
  getBillingByIdController,
  createPaymentController,
  updateBillingStatusController,
} from "./billing.controller";

const router = Router();

// Get all billings (CASHIER/ADMIN only)
router.get("/", authorize(["CASHIER", "ADMIN"]), getAllBillingsController);

// Create billing from a request
router.post("/create", authorize(["CASHIER", "ADMIN"]), createBillingController);

// Get billing by request ID
router.get("/request/:req_id", authorize(["CASHIER", "ADMIN"]), getBillingByRequestIdController);

// Get billing by billing ID (CASHIER/ADMIN only)
router.get("/:billing_id", authorize(["CASHIER", "ADMIN"]), getBillingByIdController);

// Process payment - pay billing (CASHIER/ADMIN only)
router.patch("/:billingId/pay", authorize(["CASHIER", "ADMIN"]), payBillingController);

// Create payment record (CASHIER/ADMIN only)
router.post("/payment", authorize(["CASHIER", "ADMIN"]), createPaymentController);

// Update billing status (CASHIER/ADMIN only)
router.put("/:billing_id", authorize(["CASHIER", "ADMIN"]), updateBillingStatusController);

export default router;