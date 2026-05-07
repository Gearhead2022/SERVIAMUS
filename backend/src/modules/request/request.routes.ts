import { Router } from "express";
import { getPrevVitalSignsController, createRequestController, getAllRegisteredUsersController, getRequestDataController } from "./request.controller";


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

router.get(
  "/getAllUsers",
  getAllRegisteredUsersController
);

router.get(
  "/:id/requestData",
  getRequestDataController
);

export default router;