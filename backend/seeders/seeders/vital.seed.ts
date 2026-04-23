import { PrismaClient } from "@prisma/client";

export async function seedVitals(prisma: PrismaClient) {
    const patient = await prisma.patients.findMany();

    const patient1 = await prisma.vitallSign.create({
        data: {
            patient_id: patient[0].patient_id,
            bp: "120/80",
            temp: "36.5",
            cr: "67",
            rr: "47",
            wt: "50",
            ht: "167"
        },
    });

    const patient2 = await prisma.vitallSign.create({
        data: {
            patient_id: patient[1].patient_id,
            bp: "110/70",
            temp: "38.1",
            cr: "62",
            rr: "57",
            wt: "55",
            ht: "141"
        },
    });

    const patient3 = await prisma.vitallSign.create({
        data: {
            patient_id: patient[2].patient_id,
            bp: "116/70",
            temp: "35",
            cr: "69",
            rr: "50",
            wt: "55",
            ht: "197"
        },
    });

    return { patient1, patient2, patient3 }
}