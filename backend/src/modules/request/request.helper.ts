import { prisma } from "../../config/prismaClient";

const resolveNotificationUsers = async (request: any): Promise<number | number[]> => {
    const type = request.result.req_type;

    switch (type) {
        case "CONSULTATION":
        case "CERTIFICATE":
            if (!request.consult?.physician) {
                throw new Error("No physician assigned");
            }
            return request.consult.physician;

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