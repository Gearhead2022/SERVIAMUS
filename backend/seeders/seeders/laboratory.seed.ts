import { PrismaClient } from "@prisma/client";

export async function seedLaboratory(prisma: PrismaClient) {
    const patient = await prisma.patients.findFirst();

    const req = await prisma.request.create({
        data: {
            patient_id: patient!.patient_id,
            req_type: "LABORATORY",
            status: "WAITING",
            req_date: new Date(),
        },
    });

    const test = await prisma.laboratoryTest.findFirst({
        where: {
            name: "CBC",
        },
    });

    if (!test) {
        throw new Error("Static laboratory test catalog must include CBC before seeding laboratory requests.");
    }

    const lab = await prisma.laboratoryRequest.create({
        data: {
            req_id: req.req_id,
            req_by: "Doctor",
        },
    });

    // Link to the static laboratory_tests row instead of creating catalog entries from request seed data.
    return prisma.laboratoryRequestItem.create({
        data: {
            laboratory_request_id: lab.id,
            test_id: test.test_id,
        },
    });
}
