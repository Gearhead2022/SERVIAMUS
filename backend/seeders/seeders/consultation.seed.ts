import { PrismaClient } from "@prisma/client";

export async function seedConsultations(prisma: PrismaClient) {
    const patients = await prisma.patients.findMany();
    const vitals = await prisma.vitallSign.findMany();

    if (patients.length < 3 || vitals.length < 3) {
        throw new Error("Need at least 3 patients and vital signs to seed consultations.");
    }

    const chiefComplaint = [
        "Chest pain for 2 hours",
        "Severe headache since morning",
        "Abdominal pain after eating"
    ];

    const histIllness = [
        "Patient reports sudden onset of chest tightness, no prior history of heart disease",
        "History of migraines, triggered by lack of sleep",
        "Pain started after eating oily food, with nausea"
    ];

    const examinations = [
        "BP: 140/90, HR: 98 bpm, ECG recommended",
        "BP: 120/80, neuro exam normal",
        "Abdomen tender on palpation, no rebound tenderness"
    ];

    const assessments = [
        "Possible angina, rule out myocardial infarction",
        "Migraine headache",
        "Gastritis or possible food-related irritation"
    ];

    const plans = [
        "Administer aspirin, schedule ECG and cardiac enzymes test",
        "Prescribe pain reliever and advise rest",
        "Prescribe antacids and recommend dietary changes"
    ];

    const followUps = [
        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ];

    const consultations = [];

    for (let i = 0; i < 3; i++) {
        const request = await prisma.request.create({
            data: {
                patient_id: patients[i].patient_id,
                req_type: "CONSULTATION",
                status: "WAITING",
                req_date: new Date(),
            },
        });

        const cons_req = await prisma.consultationRequest.create({
            data: {
                req_id: request.req_id,
                vs_id: vitals[i].vs_id,
                physician: 1
            },
        });

        const consultation = await prisma.consultation.create({
            data: {
                patient_id: patients[i].patient_id,
                vs_id: vitals[i].vs_id,
                cons_id: cons_req.cons_id,
                consultation_date: new Date(),
                chief_complaint: chiefComplaint[i],
                hist_illness: histIllness[i],
                examination: examinations[i],
                assessment: assessments[i],
                plans: plans[i],
                follow_up_date: followUps[i],
            },
        });

        consultations.push(consultation);
    }

    return consultations;
}