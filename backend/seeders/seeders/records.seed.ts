import { PrismaClient } from "@prisma/client";

export async function seedConsultationRecords(prisma: PrismaClient) {
    const patients = await prisma.patients.findMany({
        include: {
            consultations: true, // make sure relation name matches your schema
        },
    });

    if (patients.length < 3) {
        throw new Error("Need at least 3 patients.");
    }

    const records = [];

    for (let i = 0; i < 3; i++) {
        const patient = patients[i];

        if (!patient.consultations || patient.consultations.length === 0) {
            throw new Error(`Patient ${patient.patient_id} has no consultation.`);
        }

        // 1. Create Consultation Record
        const record = await prisma.consultationRecords.create({
            data: {
                patient_id: patient.patient_id,

                // PMH
                pmh_allergy: i === 0,
                pmh_admission: i === 1,
                pmh_others: i === 2,
                pmh_others_text: i === 2 ? "Asthma history" : null,

                // FH
                fh_htn: i === 0,
                fh_dm: i === 1,
                fh_ba: i === 2,
                fh_cancer: false,
                fh_others: false,

                // OB
                ob_score: i === 0 ? "G2P1" : i === 1 ? "G1P0" : "G3P2",
                ob_nvsd: i !== 1,
                ob_cs: i === 1,

                menarche: "13 yrs",
                interval: "28 days",
                duration: "5 days",
                amount: "Moderate",
                ob_symptoms: "None",

                // Personal
                cigarette_use: i === 0,
                alcohol_use: i === 1,
                drug_use: false,
                exercise: true,
                hygiene_prac: true,
                coffee_cons: true,
                soda_cons: i === 2,

                // Social
                sh_allergy: false,
                sh_admission: false,

                travel_history: "No recent travel",
                diet: "Balanced diet",
                stress: i === 2 ? "High stress" : "Low stress",
                occupation: ["Engineer", "Teacher", "Driver"][i],
            },
        });

        // 2. Update Consultation with phr_id
        await prisma.consultation.update({
            where: {
                consultation_id: patient.consultations[i].consultation_id,
            },
            data: {
                phr_id: record.phr_id,
            },
        });

        records.push(record);
    }

    return records;
}