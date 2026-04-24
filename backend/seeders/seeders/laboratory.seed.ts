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

    const lab = await prisma.laboratoryRequest.create({
        data: {
            req_id: req.req_id,
            test: "CBC",
            req_by: "Doctor",
        },
    });

    const test = await prisma.laboratoryTest.create({
        data: {
            name: "CBC",
            category: "HEMATOLOGY",
        },
    });

    return prisma.laboratoryRequestItem.create({
        data: {
            laboratory_request_id: lab.id,
            test_id: test.test_id,
        },
    });
}