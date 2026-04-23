import { PrismaClient } from "@prisma/client";

export async function seedMedicalCertificateRequest(prisma: PrismaClient) {
    const requests = await prisma.request.findMany({
        where: { req_type: "CERTIFICATE" }, // adjust if needed
    });

    const medTech = await prisma.users.findFirst({
        where: {
            roles: {
                some: {
                    role: {
                        role_name: "DOCTOR"
                    }
                }
            }
        },
    });

    if (requests.length < 3) {
        throw new Error("Need at least 3 medical certificate requests.");
    }

    if (!medTech) {
        throw new Error("No med tech user found.");
    }

    const data = [];

    for (let i = 0; i < 3; i++) {
        const record = await prisma.medicalCertificateRequest.create({
            data: {
                req_id: requests[i].req_id,
                physician: medTech.user_id,
            },
        });

        data.push(record);
    }

    return data;
}