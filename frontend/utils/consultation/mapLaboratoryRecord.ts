import {
    LabRequest,
    LabResultPayload,
    LabRecordGroup,
    LabCategory,
    RequestStatus,
} from "@/types/LabTypes";

import {
    LaboratoryHistoryItem,
} from "@/hooks/Consultation/useConsultation";

export const mapLaboratoryRecordToRequest = (
    record: LaboratoryHistoryItem,
    itemId?: number
): LabRequest => {

    const selectedTest =
        itemId
            ? record.tests.find(
                (t) => t.item_id === itemId
            )
            : record.tests.find(
                (t) =>
                    t.result_payload &&
                    t.status === "done"
            ) ?? record.tests[0];

    return {

        labId:
            record.laboratory.id,

        requestId:
            record.request.req_id,

        laboratoryRequestId:
            record.laboratory.id,

        id:
            record.request.request_code,

        patientName:
            record.patient.name,

        patientId:
            record.patient.patient_code,

        rawPatientId:
            record.patient.patient_id ?? 0,

        testType:
            selectedTest?.test.name ?? "",

        category:
            selectedTest?.test.category as LabCategory,

        tests:
            record.tests.map(
                (t) => t.test.name
            ),

        completedTests:
            record.tests
                .filter(
                    (t) => t.status === "done"
                )
                .map(
                    (t) => t.test.name
                ),

        pendingTests:
            record.tests
                .filter(
                    (t) => t.status !== "done"
                )
                .map(
                    (t) => t.test.name
                ),

        totalTests: record.lab.totalTests,
        completedCount: record.lab.completedTests,

        requestedAt:
            "",

        requestedDate:
            record.request.req_date,

        age:
            String(
                record.patient.age ?? ""
            ),

        priority:
            "Routine",

        status:
            record.request.status as RequestStatus,

        requestStatus:
            record.request.status as RequestStatus,

        billingCode:
            null,

        billingStatus:
            "unpaid",

        billingTotal:
            0,

        isPaid:
            false,

        paidAt:
            null,

        schemaKey:
            selectedTest?.test
                ?.schema_key ?? null,

        recordGroup:
            selectedTest?.test.category
                ?.toLowerCase() as LabRecordGroup,

        requestedBy:
            record.laboratory.req_by,

        address:
            record.patient.address ?? '',

        sex:
            record.patient.sex ?? '',

        resultPayload:
            selectedTest?.result_payload as LabResultPayload,
    };
};