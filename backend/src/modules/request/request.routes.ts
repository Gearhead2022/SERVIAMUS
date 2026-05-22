import { Router } from "express";
import { getPrevVitalSignsController, createRequestController, getAllRegisteredUsersController, getRequestDataController, getAllRequestController, deleteRequestController, updateRequestController } from "./request.controller";


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

router.get(
  "/requestList",
  getAllRequestController
);

router.delete(
  "/:request_id/deleteRequest",
  deleteRequestController
);

router.put(
  "/:request_id/updateRequest",
  updateRequestController
);

export default router;