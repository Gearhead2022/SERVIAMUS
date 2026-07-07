"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ClipboardPenLine,
  FilePlusCorner,
  FlaskConical,
  Plus,
  Save,
  Search,
  UserRoundCheck,
} from "lucide-react";
import AddPatientForm from "@/components/Modal/ChildModal/AddPatientForm";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/guards/RoleGuard";
import { useGetAllpatient } from "@/hooks/Patient/usePatientRegistration";
import {
  useLatestEncodingConsultation,
  useSaveEncodingFollowUp,
  useSaveEncodingLabResult,
} from "@/hooks/admin/useEncoding";
import type { LabCategory, LabResultPayload, LabSchemaKey } from "@/types/LabTypes";
import type { PatientProps } from "@/types/PatientTypes";
import { canAddPatient } from "@/utils/permissions";

type FieldType = "date" | "text" | "textarea";

type EncodingField = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
};

type EncodingOption = {
  value: string;
  label: string;
  group: "consultation" | "lab";
  category?: LabCategory;
  schemaKey?: LabSchemaKey;
  testName?: string;
  fields: EncodingField[];
};

const today = () => new Date().toISOString().slice(0, 10);

const consultationFields: EncodingField[] = [
  { key: "followupDate", label: "Consultation Date", type: "date" },
  { key: "bp", label: "Blood Pressure", placeholder: "120/80" },
  { key: "temp", label: "Temperature", placeholder: "36.7 C" },
  { key: "cr", label: "Cardiac Rate", placeholder: "80" },
  { key: "rr", label: "Respiratory Rate", placeholder: "18" },
  { key: "wt", label: "Weight", placeholder: "60 kg" },
  { key: "ht", label: "Height", placeholder: "165 cm" },
  { key: "impression", label: "Impression", type: "textarea" },
  { key: "instruction", label: "Instruction / Plan", type: "textarea" },
];

const encodingOptions: EncodingOption[] = [
  {
    value: "consultation-follow-up",
    label: "Consultation - latest follow-up",
    group: "consultation",
    fields: consultationFields,
  },
  {
    value: "lab-cbc",
    label: "Hematology - CBC",
    group: "lab",
    category: "hematology",
    schemaKey: "CBC",
    testName: "CBC",
    fields: [
      { key: "hemoglobin", label: "Hemoglobin" },
      { key: "rbc_count", label: "RBC Count" },
      { key: "wbc_count", label: "WBC Count" },
      { key: "platelet_count", label: "Platelet Count" },
      { key: "lymphocytes", label: "Lymphocytes" },
      { key: "monocytes", label: "Monocytes" },
      { key: "eosinophils", label: "Eosinophils" },
      { key: "basophils", label: "Basophils" },
      { key: "others1", label: "Other Findings", type: "textarea" },
    ],
  },
  {
    value: "lab-blood-typing",
    label: "Hematology - Blood Typing",
    group: "lab",
    category: "hematology",
    schemaKey: "BT",
    testName: "Blood Typing",
    fields: [
      { key: "abo_type", label: "ABO Type", placeholder: "A / B / AB / O" },
      { key: "rh_type", label: "Rh Type", placeholder: "Positive / Negative" },
      { key: "others2", label: "Remarks", type: "textarea" },
    ],
  },
  {
    value: "lab-clinical-chemistry",
    label: "Clinical Chemistry - Panel",
    group: "lab",
    category: "clinical-chemistry",
    schemaKey: "clinical_chemistry",
    testName: "Clinical Chemistry",
    fields: [
      { key: "fbs", label: "FBS" },
      { key: "rbs", label: "RBS" },
      { key: "bun", label: "BUN" },
      { key: "creatinine", label: "Creatinine" },
      { key: "uric_acid", label: "Uric Acid" },
      { key: "cholesterol", label: "Cholesterol" },
      { key: "hdl_cholesterol", label: "HDL Cholesterol" },
      { key: "ldl_cholesterol", label: "LDL Cholesterol" },
      { key: "triglycerides", label: "Triglycerides" },
      { key: "sgpt", label: "SGPT" },
      { key: "last_meal", label: "Last Meal" },
      { key: "time_taken", label: "Time Taken" },
    ],
  },
  {
    value: "lab-chemistry",
    label: "Clinical Chemistry - Electrolytes",
    group: "lab",
    category: "clinical-chemistry",
    schemaKey: "chemistry",
    testName: "Electrolytes",
    fields: [
      { key: "sodium", label: "Sodium" },
      { key: "potassium", label: "Potassium" },
      { key: "chloride", label: "Chloride" },
      { key: "ionized_calcium", label: "Ionized Calcium" },
      { key: "others", label: "Other Findings", type: "textarea" },
    ],
  },
  {
    value: "lab-hba1c",
    label: "Clinical Chemistry - HbA1c",
    group: "lab",
    category: "clinical-chemistry",
    schemaKey: "hba1c",
    testName: "HbA1c",
    fields: [
      { key: "test_method", label: "Test Method" },
      { key: "lot_no", label: "Lot Number" },
      { key: "exp_date", label: "Expiration Date", type: "date" },
      { key: "specimen", label: "Specimen" },
      { key: "result", label: "Result" },
      { key: "result_interpretation", label: "Interpretation", type: "textarea" },
    ],
  },
  {
    value: "lab-ogtt",
    label: "Clinical Chemistry - OGTT",
    group: "lab",
    category: "clinical-chemistry",
    schemaKey: "OGTT",
    testName: "OGTT",
    fields: [
      { key: "test_type", label: "Test Type", placeholder: "50G / 75G / 100G" },
      { key: "fbs", label: "FBS" },
      { key: "onehagl", label: "1 Hour After Load" },
      { key: "twohagl", label: "2 Hours After Load" },
      { key: "threehagl", label: "3 Hours After Load" },
    ],
  },
  {
    value: "lab-urinalysis",
    label: "Clinical Microscopy - Urinalysis",
    group: "lab",
    category: "urinalysis",
    schemaKey: "urinalysis",
    testName: "Urinalysis",
    fields: [
      { key: "color", label: "Color" },
      { key: "transparency", label: "Transparency" },
      { key: "ph_result", label: "pH" },
      { key: "spec_grav_result", label: "Specific Gravity" },
      { key: "protein", label: "Protein" },
      { key: "glucose", label: "Glucose" },
      { key: "pus_cells", label: "Pus Cells" },
      { key: "rbc", label: "RBC" },
      { key: "bacteria", label: "Bacteria" },
      { key: "others", label: "Other Findings", type: "textarea" },
    ],
  },
  {
    value: "lab-parasitology",
    label: "Clinical Microscopy - Parasitology",
    group: "lab",
    category: "parasitology",
    schemaKey: "parasitology",
    testName: "Parasitology",
    fields: [
      { key: "time_collected", label: "Time Collected" },
      { key: "time_received", label: "Time Received" },
      { key: "color", label: "Color" },
      { key: "consistency", label: "Consistency" },
      { key: "pus_cells", label: "Pus Cells" },
      { key: "rbc", label: "RBC" },
      { key: "bacteria", label: "Bacteria" },
      { key: "hookworm", label: "Hookworm" },
      { key: "ascaris", label: "Ascaris" },
      { key: "trichuris", label: "Trichuris" },
      { key: "others", label: "Other Findings", type: "textarea" },
    ],
  },
  {
    value: "lab-serology",
    label: "Serology - General",
    group: "lab",
    category: "other",
    schemaKey: "serology",
    testName: "Serology",
    fields: [
      { key: "test", label: "Test Name", placeholder: "Dengue / HBsAg / Syphilis" },
      { key: "method", label: "Method" },
      { key: "specimen", label: "Specimen" },
      { key: "day_of_fever", label: "Day of Fever" },
      { key: "result", label: "Result", type: "textarea" },
    ],
  },
];

const emptyValuesFor = (option: EncodingOption) => {
  const values: Record<string, string> = {};

  for (const field of option.fields) {
    values[field.key] = field.type === "date" ? today() : "";
  }

  return values;
};

const formatDate = (value?: string | null) => {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
};

const EncodingPage = () => {
  const { user } = useAuth();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedOptionValue, setSelectedOptionValue] = useState("consultation-follow-up");
  const [labResultDate, setLabResultDate] = useState(today());
  const [formValues, setFormValues] = useState<Record<string, string>>(
    emptyValuesFor(encodingOptions[0])
  );
  const [showPatientForm, setShowPatientForm] = useState(false);

  const { data: patients = [] } = useGetAllpatient(patientSearch);
  const saveLab = useSaveEncodingLabResult();
  const saveFollowUp = useSaveEncodingFollowUp();

  const selectedPatient = useMemo(
    () =>
      patients.find(
        (patient: PatientProps) => String(patient.patient_id) === selectedPatientId
      ) ?? null,
    [patients, selectedPatientId]
  );

  const selectedOption = useMemo(
    () =>
      encodingOptions.find((option) => option.value === selectedOptionValue) ??
      encodingOptions[0],
    [selectedOptionValue]
  );

  const { data: latestConsultation, isFetching: isLoadingLatest } =
    useLatestEncodingConsultation(
      selectedPatient?.patient_id && selectedOption.group === "consultation"
        ? selectedPatient.patient_id
        : undefined
    );

  const isSaving = saveLab.isPending || saveFollowUp.isPending;

  const updateSelectedOption = (value: string) => {
    const nextOption =
      encodingOptions.find((option) => option.value === value) ?? encodingOptions[0];
    setSelectedOptionValue(nextOption.value);
    setLabResultDate(today());
    setFormValues(emptyValuesFor(nextOption));
  };

  const updateField = (key: string, value: string) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPatient?.patient_id) {
      return;
    }

    if (selectedOption.group === "consultation") {
      await saveFollowUp.mutateAsync({
        patientId: selectedPatient.patient_id,
        consultationId: latestConsultation?.consultation_id ?? null,
        followupDate: formValues.followupDate || today(),
        impression: formValues.impression,
        instruction: formValues.instruction,
        bp: formValues.bp,
        temp: formValues.temp,
        cr: formValues.cr,
        rr: formValues.rr,
        wt: formValues.wt,
        ht: formValues.ht,
      });
      setFormValues(emptyValuesFor(selectedOption));
      return;
    }

    const form: LabResultPayload = Object.fromEntries(
      Object.entries(formValues).filter(([, value]) => value.trim() !== "")
    );

    await saveLab.mutateAsync({
      patientId: selectedPatient.patient_id,
      category: selectedOption.category ?? "other",
      form,
      resultDate: labResultDate || today(),
      schemaKey: selectedOption.schemaKey ?? null,
      testName: selectedOption.testName ?? selectedOption.label,
    });
    setFormValues(emptyValuesFor(selectedOption));
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "STAFF", "DOCTOR", "LAB", "LABORATORY"]}>
      <main className="min-h-screen bg-[#edf1f7] font-['DM_Sans'] text-[#14233d]">
        <div className="border-b border-[#dce3ef] bg-white px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-[#eff6f4] px-3 py-1 text-xs font-semibold text-[#0e7c7b]">
                <FilePlusCorner size={14} />
                Admin Encoding
              </div>
              <h1 className="font-['DM_Serif_Display'] text-3xl text-[#0f2244]">
                Records Encoding
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-[#6b7da0]">
                Register missing patients, select existing patients, then encode
                consultation follow-ups or laboratory results from one page.
              </p>
            </div>

            {canAddPatient(user?.roles) && (
              <Button
                icon={<Plus size={18} />}
                variant="addPatient"
                type="button"
                onClick={() => setShowPatientForm((current) => !current)}
              >
                {showPatientForm ? "Hide Patient Form" : "Add Patient"}
              </Button>
            )}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="space-y-5">
            {showPatientForm && (
              <section className="overflow-hidden rounded-lg border border-[#dce3ef] bg-white shadow-sm">
                <AddPatientForm
                  patient={null}
                  onClose={() => setShowPatientForm(false)}
                />
              </section>
            )}

            <section className="rounded-lg border border-[#dce3ef] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f2244] text-white">
                  <Search size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f2244]">Patient</h2>
                  <p className="text-xs text-[#6b7da0]">Search and select a record</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Search Patient"
                  placeholder="Name or patient code"
                  value={patientSearch}
                  onChange={(event) => setPatientSearch(event.target.value)}
                />

                <Select
                  label="Selected Patient"
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                >
                  <option value="">Select patient</option>
                  {patients.map((patient: PatientProps) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.name} {patient.patient_code ? `(${patient.patient_code})` : ""}
                    </option>
                  ))}
                </Select>

                {selectedPatient && (
                  <div className="rounded-lg border border-[#dce3ef] bg-[#f8fafc] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0f2244]">
                      <UserRoundCheck size={16} />
                      {selectedPatient.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#50617f]">
                      <span>Age: {selectedPatient.age ?? "-"}</span>
                      <span>Sex: {selectedPatient.sex ?? "-"}</span>
                      <span className="col-span-2">
                        Contact: {selectedPatient.contact_number || "-"}
                      </span>
                      <span className="col-span-2">
                        Address: {selectedPatient.address || "-"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </aside>

          <section className="rounded-lg border border-[#dce3ef] bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="border-b border-[#dce3ef] p-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8102e] text-white">
                      {selectedOption.group === "lab" ? (
                        <FlaskConical size={19} />
                      ) : (
                        <ClipboardPenLine size={19} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0f2244]">
                        Encode Record
                      </h2>
                      <p className="text-sm text-[#6b7da0]">
                        Fields change based on the selected record category.
                      </p>
                    </div>
                  </div>

                  <Select
                    label="Record Type"
                    value={selectedOptionValue}
                    onChange={(event) => updateSelectedOption(event.target.value)}
                  >
                    <optgroup label="Consultation">
                      {encodingOptions
                        .filter((option) => option.group === "consultation")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Laboratory Results">
                      {encodingOptions
                        .filter((option) => option.group === "lab")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </optgroup>
                  </Select>
                </div>
              </div>

              <div className="flex-1 p-5">
                {!selectedPatient ? (
                  <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[#c6d1e3] bg-[#f8fafc] p-6 text-center">
                    <div>
                      <Search className="mx-auto mb-3 text-[#6b7da0]" size={32} />
                      <h3 className="text-base font-bold text-[#0f2244]">
                        Select a patient to start encoding
                      </h3>
                      <p className="mt-1 text-sm text-[#6b7da0]">
                        Use Add Patient only for records that do not exist in the system.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {selectedOption.group === "consultation" && (
                      <div className="rounded-lg border border-[#dce3ef] bg-[#f8fafc] p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7da0]">
                          Latest Initial Consultation
                        </p>
                        {isLoadingLatest ? (
                          <p className="mt-2 text-sm text-[#50617f]">Loading...</p>
                        ) : latestConsultation ? (
                          <div className="mt-2 text-sm text-[#14233d]">
                            <p className="font-semibold">
                              {formatDate(latestConsultation.consultation_date)}
                            </p>
                            <p className="mt-1 text-[#50617f]">
                              {latestConsultation.chief_complaint || "No chief complaint recorded."}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-[#c8102e]">
                            This patient has no initial consultation yet. A follow-up
                            cannot be attached until one exists.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedOption.group === "lab" && (
                      <div className="max-w-xs">
                        <Input
                          label="Result Date"
                          type="date"
                          value={labResultDate}
                          onChange={(event) => setLabResultDate(event.target.value)}
                        />
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedOption.fields.map((field) => {
                        const isWide = field.type === "textarea";

                        return (
                          <div key={field.key} className={isWide ? "md:col-span-2" : ""}>
                            {field.type === "textarea" ? (
                              <Textarea
                                label={field.label}
                                rows={4}
                                placeholder={field.placeholder}
                                value={formValues[field.key] ?? ""}
                                onChange={(event) =>
                                  updateField(field.key, event.target.value)
                                }
                              />
                            ) : (
                              <Input
                                label={field.label}
                                type={field.type ?? "text"}
                                placeholder={field.placeholder}
                                value={formValues[field.key] ?? ""}
                                onChange={(event) =>
                                  updateField(field.key, event.target.value)
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#dce3ef] bg-[#f8fafc] p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#6b7da0]">
                  Saves are isolated to the encoding API and will not change active
                  request queues or billing workflows.
                </p>
                <Button
                  icon={<Save size={17} />}
                  type="submit"
                  disabled={
                    !selectedPatient ||
                    isSaving ||
                    (selectedOption.group === "consultation" && !latestConsultation)
                  }
                  isLoading={isSaving}
                >
                  Save Encoded Record
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
};

export default EncodingPage;
