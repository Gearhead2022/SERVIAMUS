import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getEncodingLatestConsultationController,
  saveEncodingFollowUpController,
  saveEncodingLabResultController,
} from "./encoding.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/patients/:patientId/latest-consultation",
  authorize(["ADMIN", "DOCTOR", "STAFF"]),
  getEncodingLatestConsultationController
);

router.post(
  "/lab-results",
  authorize(["ADMIN", "LAB", "LABORATORY"]),
  saveEncodingLabResultController
);

router.post(
  "/consultation-follow-ups",
  authorize(["ADMIN", "DOCTOR", "STAFF"]),
  saveEncodingFollowUpController
);

export default router;
