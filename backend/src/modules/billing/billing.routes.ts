import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import { getBillingsController, payBillingController } from "./billing.controller";

const router = Router();

router.get("/", authorize(["ADMIN", "CASHIER"]), getBillingsController);
router.patch("/:billingId/pay", authorize(["ADMIN", "CASHIER"]), payBillingController);

export default router;
