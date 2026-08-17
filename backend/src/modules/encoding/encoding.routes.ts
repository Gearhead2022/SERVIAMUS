import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import {
  getEncodingLatestConsultationController,
  getEncodingConsultationsController,
  saveEncodingConsultationController,
  saveEncodingFollowUpController,
  saveEncodingLabResultController,
} from "./encoding.controller";

const router = Router();

router.use(authenticate, authorize(["ENCODER"]));

router.get(
  "/patients/:patientId/latest-consultation",
  getEncodingLatestConsultationController
);
router.get("/patients/:patientId/consultations", getEncodingConsultationsController);
router.post(
  "/consultations",
  saveEncodingConsultationController
);

router.post(
  "/lab-results",
  saveEncodingLabResultController
);

router.post(
  "/consultation-follow-ups",
  saveEncodingFollowUpController
);

export default router;
