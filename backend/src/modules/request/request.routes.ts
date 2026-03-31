import { Router } from "express";
import { getPrevVitalSignsController, createRequestController } from "./request.controller";


const router = Router();

// PUBLIC ROUTES

router.get(
  "/prevVitals",
  getPrevVitalSignsController
);

router.post(
  "/requestAdd",
  createRequestController
);

export default router;