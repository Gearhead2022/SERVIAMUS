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


router.get(
  "/patients/:patientId/latest-consultation",
  getEncodingLatestConsultationController
);
router.get("/patients/:patientId/consultations", getEncodingConsultationsController);
router.post(
  "/consultations",
  authenticate,
  authorize(["ADMIN"]),
  saveEncodingConsultationController
);

router.post(
  "/lab-results",
  authenticate,
  authorize(["ADMIN"]),
  saveEncodingLabResultController
);

router.post(
  "/consultation-follow-ups",
  authenticate,
  authorize(["ADMIN"]),
  saveEncodingFollowUpController
);

export default router;
