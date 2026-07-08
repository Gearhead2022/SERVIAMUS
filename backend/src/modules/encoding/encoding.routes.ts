import { Router } from "express";
import {
  getEncodingLatestConsultationController,
  saveEncodingFollowUpController,
  saveEncodingLabResultController,
} from "./encoding.controller";

const router = Router();


router.get(
  "/patients/:patientId/latest-consultation",
  getEncodingLatestConsultationController
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
