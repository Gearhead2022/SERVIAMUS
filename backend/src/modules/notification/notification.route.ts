import { Router } from "express";
import { getNotificationsController, markAllAsReadController, markAsReadController } from "./notification.controller";

const router = Router();

// PUBLIC ROUTES

router.get(
    "/:id/getAllNotification",
    getNotificationsController
);

router.patch(
    "/:id/markAsRead",
    markAsReadController
);

router.patch(
    "/:id/markAllAsRead",
    markAllAsReadController
);

export default router;