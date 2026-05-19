import { PrismaClient } from "@prisma/client";

export async function seedLaboratory(prisma: PrismaClient) {

    // Clear existing seeded data
    await prisma.laboratoryRequestItem.deleteMany();
    await prisma.laboratoryRequest.deleteMany();
    await prisma.laboratoryTest.deleteMany();

    // Reinsert catalog
    await prisma.laboratoryTest.createMany({
        data: [
            {
                test_id: 1,
                name: "FBS",
                category: "Clinical_Chemistry",
                schema_key: "FBS",
            },
            {
                test_id: 2,
                name: "Random Blood Sugar",
                category: "Clinical_Chemistry",
                schema_key: "RBS",
            },
            {
                test_id: 3,
                name: "Urea (BUN)",
                category: "Clinical_Chemistry",
                schema_key: "BUN",
            },
            {
                test_id: 4,
                name: "Creatinine",
                category: "Clinical_Chemistry",
                schema_key: "clinical_chemistry",
            },
            {
                test_id: 5,
                name: "Blood Chemistry",
                category: "Clinical_Chemistry",
                schema_key: "clinical_chemistry",
            },
            {
                test_id: 6,
                name: "Uric Acid",
                category: "Clinical_Chemistry",
                schema_key: "uricacid",
            },
            {
                test_id: 7,
                name: "Total Cholesterol",
                category: "Clinical_Chemistry",
                schema_key: "totalcholesterol",
            },
            {
                test_id: 8,
                name: "HDL-Cholesterol",
                category: "Clinical_Chemistry",
                schema_key: "HDL",
            },
            {
                test_id: 9,
                name: "LDL-Cholesterol",
                category: "Clinical_Chemistry",
                schema_key: "LDL",
            },
            {
                test_id: 10,
                name: "Triglycerides",
                category: "Clinical_Chemistry",
                schema_key: "triglycerides",
            },
            {
                test_id: 11,
                name: "1H-OGTT",
                category: "Clinical_Chemistry",
                schema_key: "onehOGTT",
            },
            {
                test_id: 12,
                name: "2H-OGTT",
                category: "Clinical_Chemistry",
                schema_key: "twohOGTT",
            },
            {
                test_id: 13,
                name: "OGTT 75G",
                category: "Clinical_Chemistry",
                schema_key: "twohOGTT",
            },
            {
                test_id: 14,
                name: "OGTT",
                category: "Clinical_Chemistry",
                schema_key: "OGTT",
            },
            {
                test_id: 15,
                name: "Serum Glutamic Pyruvic Transaminase",
                category: "Clinical_Chemistry",
                schema_key: "SGPT",
            },
            {
                test_id: 16,
                name: "Sodium",
                category: "Clinical_Chemistry",
                schema_key: "sodium",
            },
            {
                test_id: 17,
                name: "Potassium",
                category: "Clinical_Chemistry",
                schema_key: "potassium",
            },
            {
                test_id: 18,
                name: "Sodium Potassium Chloride Ionized Calcium",
                category: "Clinical_Chemistry",
                schema_key: "chemistry",
            },
            {
                test_id: 19,
                name: "HbA1c",
                category: "Clinical_Chemistry",
                schema_key: "hba1c",
            },
            {
                test_id: 20,
                name: "Urinalysis",
                category: "Clinical_Microscopy",
                schema_key: "urinalysis",
            },
            {
                test_id: 21,
                name: "Fecalysis",
                category: "Clinical_Microscopy",
                schema_key: "parasitology",
            },
            {
                test_id: 22,
                name: "Fecal Occult Blood Test",
                category: "Clinical_Microscopy",
                schema_key: "FOBT",
            },
            {
                test_id: 23,
                name: "Pregnancy Test (Urine)",
                category: "Serology",
                schema_key: "urinePT",
            },
            {
                test_id: 24,
                name: "Pregnancy Test (Serum)",
                category: "Serology",
                schema_key: "serumPT",
            },
            {
                test_id: 25,
                name: "Dengue NS1",
                category: "Serology",
                schema_key: "dengue",
            },
            {
                test_id: 26,
                name: "Syphilis",
                category: "Serology",
                schema_key: "syphilis",
            },
            {
                test_id: 27,
                name: "Hepatitis B Surface Antigen",
                category: "Serology",
                schema_key: "hbsag",
            },
            {
                test_id: 28,
                name: "Complete Blood Count with Platelet Count",
                category: "Hematology",
                schema_key: "CBC",
            },
            {
                test_id: 29,
                name: "CBC",
                category: "Hematology",
                schema_key: "CBC",
            },
            {
                test_id: 30,
                name: "Blood Typing",
                category: "Hematology",
                schema_key: "BT",
            },
        ],
        skipDuplicates: true,
    });

    const patient = await prisma.patients.findFirst();

    if (!patient) {
        throw new Error("No patient found.");
    }

    const req = await prisma.request.create({
        data: {
            patient_id: patient.patient_id,
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
        throw new Error(
            "Static laboratory test catalog must include CBC before seeding laboratory requests."
        );
    }

    const lab = await prisma.laboratoryRequest.create({
        data: {
            req_id: req.req_id,
            req_by: "Doctor",
        },
    });

    return prisma.laboratoryRequestItem.create({
        data: {
            laboratory_request_id: lab.id,
            test_id: test.test_id,
        },
    });
}