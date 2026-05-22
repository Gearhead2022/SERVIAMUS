import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  getAllBillingsController,
  payBillingController,
  getBillingByRequestIdController,
  getBillingByIdController,
  createPaymentController,
  updateBillingStatusController,
  getAllpaymentsController,
} from "./billing.controller";

const router = Router();

// Get all billings (CASHIER/ADMIN only)
router.get("/", authorize(["CASHIER", "ADMIN"]), getAllBillingsController);

// Get all payment records
router.get("/getAllPayments", authorize(["CASHIER", "ADMIN"]), getAllpaymentsController);

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