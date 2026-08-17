import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getNotificationsController, markAllAsReadController, markAsReadController } from "./notification.controller";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    getNotificationsController
);

router.patch(
    "/mark-all-read",
    markAllAsReadController
);

router.patch(
    "/:notificationId/read",
    markAsReadController
);

export default router;
