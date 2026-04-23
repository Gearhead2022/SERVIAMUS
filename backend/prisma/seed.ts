import { PrismaClient, LaboratoryRequestItemStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createLaboratoryRequestWithItems } from "../src/modules/lab/lab.helpers";
import { upsertStructuredLabResult } from "../src/modules/lab/lab.result-writers";
import { normalizeLabForm, requestStatusFromItemStatuses } from "../src/modules/lab/lab.utils";

const prisma = new PrismaClient();

type SeedUserInput = {
    name: string;
    username: string;
    password: string;
    roleName: string;
    licenseNo?: string;
    title?: string;
    ptrNo?: string;
};

type SampleLabItem = {
    testName: string;
    status: LaboratoryRequestItemStatus;
    form?: Record<string, string>;
};

type SampleLabRequest = {
    patientId: number;
    reqDate: string;
    requestedBy: string;
    items: SampleLabItem[];
};

const ensureRole = async (roleName: string, roleDesc: string) => {
    const existing = await prisma.roleTypes.findFirst({
        where: {
            role_name: roleName,
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.roleTypes.create({
        data: {
            role_name: roleName,
            role_desc: roleDesc,
        },
    });
};

const ensureUser = async ({
    name,
    username,
    password,
    roleName,
    licenseNo,
    title,
    ptrNo,
}: SeedUserInput) => {
    const role = await prisma.roleTypes.findFirstOrThrow({
        where: {
            role_name: roleName,
        },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await prisma.users.findUnique({
        where: {
            username,
        },
    });

    const user = existing
        ? await prisma.users.update({
            where: {
                username,
            },
            data: {
                name,
                password: hashedPassword,
                license_no: licenseNo ?? null,
                title: title ?? null,
                ptr_no: ptrNo ?? null,
                is_active: true,
            },
        })
        : await prisma.users.create({
            data: {
                name,
                username,
                password: hashedPassword,
                license_no: licenseNo ?? null,
                title: title ?? null,
                ptr_no: ptrNo ?? null,
            },
        });

    const hasRole = await prisma.userRole.findUnique({
        where: {
            user_id_role_id: {
                user_id: user.user_id,
                role_id: role.role_id,
            },
        },
    });

    if (!hasRole) {
        await prisma.userRole.create({
            data: {
                user_id: user.user_id,
                role_id: role.role_id,
            },
        });
    }

    return user;
};

const ensurePatient = async (data: {
    patient_code: string;
    name: string;
    address: string;
    contact_number: string;
    birth_date: string;
    religion?: string;
    sex: "male" | "female";
    age: number;
}) => {
    const existing = await prisma.patients.findUnique({
        where: {
            patient_code: data.patient_code,
        },
    });

    if (existing) {
        return prisma.patients.update({
            where: {
                patient_code: data.patient_code,
            },
            data: {
                name: data.name,
                address: data.address,
                contact_number: data.contact_number,
                birth_date: new Date(data.birth_date),
                religion: data.religion ?? null,
                sex: data.sex,
                age: data.age,
            },
        });
    }

    return prisma.patients.create({
        data: {
            patient_code: data.patient_code,
            name: data.name,
            address: data.address,
            contact_number: data.contact_number,
            birth_date: new Date(data.birth_date),
            religion: data.religion ?? null,
            sex: data.sex,
            age: data.age,
        },
    });
};

const ensureSampleLabRequest = async (
    sample: SampleLabRequest,
    labUserId: number,
    pathologistUserId: number
) => {
    await prisma.$transaction(async (tx) => {
        let request = await tx.request.findFirst({
            where: {
                patient_id: sample.patientId,
                req_type: "LABORATORY",
                req_date: new Date(sample.reqDate),
                laboratory: {
                    req_by: sample.requestedBy,
                },
            },
            include: {
                laboratory: true,
            },
        });

        if (!request) {
            request = await tx.request.create({
                data: {
                    patient_id: sample.patientId,
                    req_type: "LABORATORY",
                    status: "WAITING",
                    req_date: new Date(sample.reqDate),
                },
                include: {
                    laboratory: true,
                },
            });

            await createLaboratoryRequestWithItems(tx, {
                reqId: request.req_id,
                requestedBy: sample.requestedBy,
                tests: sample.items.map((item) => item.testName),
            });

            request = await tx.request.findUniqueOrThrow({
                where: {
                    req_id: request.req_id,
                },
                include: {
                    laboratory: true,
                },
            });
        }

        if (!request.laboratory) {
            throw new Error(`Missing laboratory request for request ${request.req_id}`);
        }

        const items = await tx.laboratoryRequestItem.findMany({
            where: {
                laboratory_request_id: request.laboratory.id,
            },
            include: {
                test: {
                    select: {
                        name: true,
                        schema_key: true,
                    },
                },
            },
        });

        for (const item of sample.items) {
            const existingItem = items.find((record) => record.test.name === item.testName);

            if (!existingItem) {
                continue;
            }

            await tx.laboratoryRequestItem.updateMany({
                where: {
                    item_id: existingItem.item_id,
                },
                data: {
                    status: item.status,
                    processed_by: item.status === "QUEUED" ? null : labUserId,
                    completed_at: item.status === "DONE" ? new Date(sample.reqDate) : null,
                    result_payload: item.form ? normalizeLabForm(item.form) : Prisma.JsonNull,
                },
            });

            if (item.form) {
                await upsertStructuredLabResult({
                    tx,
                    patientId: sample.patientId,
                    labId: existingItem.item_id,
                    testName: existingItem.test.name,
                    schemaKey: existingItem.test.schema_key,
                    form: item.form,
                    medTechUserId: labUserId,
                    pathologistUserId,
                });
            }
        }

        await tx.request.update({
            where: {
                req_id: request.req_id,
            },
            data: {
                status: requestStatusFromItemStatuses(sample.items.map((item) => item.status)),
            },
        });
    });
};

async function main() {
    await ensureRole("ADMIN", "System administrator");
    await ensureRole("DOCTOR", "Attending physician");
    await ensureRole("LABORATORY", "Laboratory staff");

    const adminUser = await ensureUser({
        name: "Seed Admin",
        username: "seed.admin",
        password: "password123",
        roleName: "ADMIN",
    });

    const doctorUser = await ensureUser({
        name: "Dr. Seed Doctor",
        username: "seed.doctor",
        password: "password123",
        roleName: "DOCTOR",
        licenseNo: "DOC-1001",
        title: "MD",
        ptrNo: "PTR-1001",
    });

    const labUser = await ensureUser({
        name: "Seed MedTech",
        username: "seed.lab",
        password: "password123",
        roleName: "LABORATORY",
        licenseNo: "RMT-2001",
        title: "RMT",
        ptrNo: "PTR-2001",
    });

    const patientA = await ensurePatient({
        patient_code: "LAB-SEED-001",
        name: "Maria Test Patient",
        address: "Bacolod City, Seed Street 1",
        contact_number: "09170000001",
        birth_date: "1993-02-11",
        religion: "Catholic",
        sex: "female",
        age: 33,
    });

    const patientB = await ensurePatient({
        patient_code: "LAB-SEED-002",
        name: "Jose Sample Patient",
        address: "Bacolod City, Seed Street 2",
        contact_number: "09170000002",
        birth_date: "1988-07-21",
        religion: "Christian",
        sex: "male",
        age: 37,
    });

    const patientC = await ensurePatient({
        patient_code: "LAB-SEED-003",
        name: "Angela Demo Patient",
        address: "Bacolod City, Seed Street 3",
        contact_number: "09170000003",
        birth_date: "2001-10-14",
        religion: "Catholic",
        sex: "female",
        age: 24,
    });

    const samples: SampleLabRequest[] = [
        {
            patientId: patientA.patient_id,
            reqDate: "2026-04-13",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "CBC",
                    status: "DONE",
                    form: {
                        Hemoglobin: "13.8",
                        rbc_count: "4.82",
                        wbc_count: "7.10",
                        platelet_count: "288",
                        others_mcv: "90.2",
                        mchc: "33.1",
                        reticulocyte_count: "1.5",
                        nss_1: "58",
                        nss_2: "4",
                        nss_3: "0",
                        lymphocytes: "30",
                        monocytes: "6",
                        eosinophils: "2",
                        basophils: "0",
                        others1: "Within reference range",
                        clotting_time: "5 min",
                        bleeding_time: "2 min",
                        abo_type: "O",
                        rh_type: "Positive",
                        others2: "Sample seed hematology result",
                    },
                },
            ],
        },
        {
            patientId: patientA.patient_id,
            reqDate: "2026-04-14",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "Fecalysis",
                    status: "QUEUED",
                },
            ],
        },
        {
            patientId: patientB.patient_id,
            reqDate: "2026-04-14",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "Urinalysis",
                    status: "PROCESSING",
                    form: {
                        color: "Yellow",
                        transparency: "Clear",
                        ph_result: "6.0",
                        spec_grav_result: "1.020",
                        protein: "Negative",
                        nitrite: "Negative",
                        glucose: "Negative",
                        ketones: "Negative",
                        leukocytes: "Trace",
                        blood: "Negative",
                        pus_cells: "1-2",
                        rbc: "0-1",
                        bacteria: "Few",
                        squamous_cell: "Rare",
                        round_cell: "None",
                        mucous: "Few",
                        crystals: "None",
                        casts: "None",
                        others: "Seed urinalysis in progress",
                    },
                },
            ],
        },
        {
            patientId: patientB.patient_id,
            reqDate: "2026-04-15",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "Blood Chemistry",
                    status: "PROCESSING",
                    form: {
                        FBS: "92",
                        FBS_conv: "5.1",
                        RBS: "104",
                        RBS_conv: "5.8",
                        BUN: "13",
                        BUN_conv: "4.6",
                        creatinine: "0.9",
                        creatinine_conv: "79.6",
                        uric_acid: "4.7",
                        uric_acid_conv: "280",
                        cholesterol: "186",
                        cholesterol_conv: "4.8",
                        hdl_cholesterol: "56",
                        hdl_cholesterol_conv: "1.4",
                        ldl_cholesterol: "98",
                        ldl_cholesterol_conv: "2.5",
                        triglycerides: "130",
                        triglycerides_conv: "1.5",
                        sgpt: "24",
                        last_meal: "10 hours fasting",
                        time_taken: "08:10 AM",
                    },
                },
            ],
        },
        {
            patientId: patientC.patient_id,
            reqDate: "2026-04-15",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "Dengue NS1",
                    status: "QUEUED",
                },
            ],
        },
        {
            patientId: patientC.patient_id,
            reqDate: "2026-04-16",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "HbA1c",
                    status: "DONE",
                    form: {
                        test_method: "Immunoassay",
                        lot_no: "LOT-2026-01",
                        exp_date: "2027-12-31",
                        specimen: "Whole blood",
                        result: "5.7",
                        result_interpretation: "Borderline glycemic control",
                    },
                },
            ],
        },
        {
            patientId: patientC.patient_id,
            reqDate: "2026-04-16",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "OGTT 75G",
                    status: "QUEUED",
                },
            ],
        },
        {
            patientId: patientC.patient_id,
            reqDate: "2026-04-17",
            requestedBy: "Dr. Seed Doctor",
            items: [
                {
                    testName: "Sodium Potassium Chloride Ionized Calcium",
                    status: "PROCESSING",
                    form: {
                        sodium: "140",
                        potassium: "4.1",
                        chloride: "102",
                        ionized_calcium: "1.15",
                        others: "Seed chemistry panel",
                    },
                },
            ],
        },
    ];

    for (const sample of samples) {
        await ensureSampleLabRequest(sample, labUser.user_id, doctorUser.user_id);
    }

    console.log(
        JSON.stringify(
            {
                seededUsers: [adminUser.username, doctorUser.username, labUser.username],
                seededPatients: [patientA.patient_code, patientB.patient_code, patientC.patient_code],
                seededRequests: samples.length,
            },
            null,
            2
        )
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });