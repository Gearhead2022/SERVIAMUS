import { prisma } from "../../config/prismaClient";
import { getIO } from "../../socket";
import { CreateNotificationParams } from "./notification.types";

export const resolveUsersByRoleNames = async (roleNames: string[]) => {
    const uniqueRoleNames = Array.from(
        new Set(roleNames.map((roleName) => roleName.trim()).filter(Boolean))
    );

    if (!uniqueRoleNames.length) {
        return [];
    }

    const users = await prisma.users.findMany({
        where: {
            roles: {
                some: {
                    role: {
                        role_name: {
                            in: uniqueRoleNames,
                        },
                    },
                },
            },
        },
        select: { user_id: true },
    });

    return users.map((user) => user.user_id);
};

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

    if (!normalizedUserIds.length) {
        return;
    }

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
export const markAsRead = async (notifId: number, userId: number) => {
    return prisma.notification.updateMany({
        where: {
            notif_id: notifId,
            user_id: userId,
        },
        data: { is_read: true },
    });
};

type DoctorNotificationParams = Omit<CreateNotificationParams, "userIds" | "type"> & {
    type?: CreateNotificationParams["type"];
};

export const notifyDoctors = async ({
    type = "SYSTEM",
    title,
    message,
    entity,
    entity_id,
}: DoctorNotificationParams) => {
    const doctorUserIds = await resolveUsersByRoleNames(["DOCTOR"]);

    await createNotification({
        userIds: doctorUserIds,
        type,
        title,
        message,
        entity,
        entity_id,
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
            if (!request?.med) {
                throw new Error("No physician assigned");
            }
            return request.med?.physician;

        default:
            return resolveUsersByRoleNames(["LAB", "LABORATORY"]);
    }
};
