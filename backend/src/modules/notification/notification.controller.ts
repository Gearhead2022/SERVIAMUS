import { Request, Response } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../notification/notification.services";

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user.",
            });
        }

        const data = await getNotifications(userId)

        return res.status(201).json({
            success: true,
            data: data
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const markAsReadController = async (req: Request, res: Response) => {
    try {
        const notifId = Number(req.params.notificationId);
        const userId = req.user?.user_id;

        if (!notifId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification.",
            });
        }

        const data = await markAsRead(notifId, userId)

        return res.status(201).json({
            success: true,
            data: data
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const markAllAsReadController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user_id",
            });
        }

        const data = await markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
