import { Router } from "express";
import { createConsultarionResultController } from "./consultation.controller";

const router = Router();

// PUBLIC ROUTES
router.post(
  "/results",
  createConsultarionResultController
);

export default router;