import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  getAllBillingsController,
  payBillingController,
  createPaymentController,
  updateBillingStatusController,
  getAllpaymentsController,
  updateBillingDiscountController,
} from "./billing.controller";

const router = Router();

// Get all billings (CASHIER/ADMIN only)
router.get("/", getAllBillingsController);

// Get all payment records
router.get("/getAllPayments", getAllpaymentsController);

// Process payment - pay billing (CASHIER/ADMIN only)
router.patch("/:billingId/pay", payBillingController);

// Create payment record (CASHIER/ADMIN only)
router.post("/payment", createPaymentController);

// Update billing status (CASHIER/ADMIN only)
router.put("/:billing_id", updateBillingStatusController);

router.patch(
  "/:billing_id/discount",

  updateBillingDiscountController
);

export default router;