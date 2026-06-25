import { Router } from "express";
import { getPrevVitalSignsController, createRequestController, getAllRegisteredUsersController, getRequestDataController, getAllRequestController, deleteRequestController, updateRequestController, getLastRecordRequestController, getAllUsersController, updateUserController, deleteUserController } from "./request.controller";


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

router.get(
  "/:patient_id/lastRecord",
  getLastRecordRequestController
)

router.get(
  "/getUsers",
  getAllUsersController
);

router.patch(
  "/:user_id/updateUser",
  updateUserController
);

router.patch(
  "/:user_id/updateUser",
  updateUserController
);

router.delete(
  "/:user_id/deleteUser",
  deleteUserController
);

export default router;