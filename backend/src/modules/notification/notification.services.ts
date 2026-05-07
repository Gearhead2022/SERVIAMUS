import { prisma } from "../../config/prismaClient";
import { getIO } from "../../socket";
import { CreateNotificationParams } from "./notification.types";

// CREATE
export const createNotification = async ({
    userIds,
    type,
    title,
    message,
    entity,
    entity_id,
}: CreateNotificationParams) => {
    const io = getIO();

    const normalizedUserIds = Array.isArray(userIds)
        ? userIds
        : [userIds];

    await prisma.notification.createMany({
        data: normalizedUserIds.map((user_id) => ({
            user_id,
            type,
            title,
            message,
            entity,
            entity_id,
        })),
    });

    io.to(normalizedUserIds.map(id => `user_${id}`)).emit("notification", {
        type,
        title,
        message,
        entity,
        entity_id,
    });

    console.log("EMITTING NOTIFICATION TO:", userIds);
};

// GET
export const getNotifications = async (userId: number) => {
    return prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
    });
};

// MARK ONE
export const markAsRead = async (notifId: number) => {
    return prisma.notification.update({
        where: { notif_id: notifId },
        data: { is_read: true },
    });
};

// MARK ALL
export const markAllAsRead = async (userId: number) => {
    return prisma.notification.updateMany({
        where: {
            user_id: userId,
            is_read: false,
        },
        data: {
            is_read: true,
        },
    });
};

// user notif resolver

export const resolveNotificationUsers = async (request: any): Promise<number | number[]> => {
    const type = request.result.req_type;

    switch (type) {
        case "CONSULTATION":
            if (!request.consult?.physician) {
                throw new Error("No physician assigned");
            }
            return request.consult.physician;
        case "CERTIFICATE":
            if (!request.cert?.physician) {
                throw new Error("No physician assigned");
            }
            return request.cert.physician;

        default:
            const users = await prisma.users.findMany({
                where: {
                    roles: {
                        some: {
                            role: { role_name: "LAB" },
                        },
                    },
                },
                select: { user_id: true },
            });

            return users.map(u => u.user_id);
    }
};