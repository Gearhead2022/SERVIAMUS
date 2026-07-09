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
import ReactSelect, { SingleValue } from "react-select";
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
import Label from "@/components/ui/label";

type FieldType = "date" | "text" | "textarea" | "select";

type PatientOption = {
  value: string;
  label: string;
  patient: PatientProps;
};

type EncodingField = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
   options?: {
    value: string;
    label: string;
  }[];
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
  { key: "cr", label: "CR", placeholder: "80" },
  { key: "rr", label: "RR", placeholder: "18" },
  { key: "wt", label: "Weight", placeholder: "60 kg" },
  { key: "ht", label: "Height", placeholder: "165 cm" },
  { key: "impression", label: "Impression", type: "textarea" },
  { key: "instruction", label: "Instruction / Plan", type: "textarea" },
];

const encodingOptions: EncodingOption[] = [
  {
    value: "consultation-follow-up",
    label: "Latest Consultation",
    group: "consultation",
    fields: consultationFields,
  },
  {
    value: "lab-clinical-chemistry",
    label: "Clinical Chemistry - Panel",
    group: "lab",
    category: "clinical-chemistry",
    schemaKey: "clinical_chemistry",
    testName: "Clinical Chemistry",
    fields: [
      { key: "fbs", label: "FASTING BLOOD SUGAR (FBS)" },
      { key: "rbs", label: "RANDOM BLOOD SUGAR (RBS)" },
      { key: "bun", label: "UREA (BUN)" },
      { key: "creatinine", label: "Creatinine" },
      { key: "uric_acid", label: "Uric Acid" },
    { key: "cholesterol", label: "CHOLESTEROL" },
      { key: "hdl_cholesterol", label: "HDL-CHOLESTEROL" },
      { key: "ldl_cholesterol", label: "LDL-CHOLESTEROL" },
      { key: "triglycerides", label: "TRIGLYCERIDES" },
      { key: "sgpt", label: "ALT/SGPT" },
      { key: "last_meal", label: "LAST MEAL" },
      { key: "time_taken", label: "TIME TAKEN" },
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
      { key: "sodium", label: "SODIUM (Na)" },
      { key: "potassium", label: "POTASSIUM (K)" },
      { key: "chloride", label: "CHLORIDE (Cl)" },
      { key: "ionized_calcium", label: "IONIZED CALCIUM (iCa)" },
      { key: "others", label: "OTHER FINDINGS", type: "textarea" },
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
      { key: "test_type", label: "TEST TYPE", placeholder: "50G / 75G / 100G", type: "select", options: [ { value: "50G", label: "50G 1H-OGTT" }, { value: "75G", label: "75G 2H-OGTT (NON-GESTATIONAL)" },{ value: "75G", label: "75G 2H-OGTT (GESTATIONAL)" }, { value: "100G", label: "100G OGTT" } ] },
      { key: "fbs", label: "FBS" },
      { key: "onehagl", label: "1 HOUR AFTER LOAD" },
      { key: "twohagl", label: "2 HOURS AFTER LOAD" },
      { key: "threehagl", label: "3 HOURS AFTER LOAD" },
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
      { key: "test_method", label: "TEST METHOD" },
      { key: "lot_no", label: "LOT NUMBER" },
      { key: "exp_date", label: "EXPIRATION DATE", type: "date" },
      { key: "specimen", label: "SPECIMEN" },
      { key: "result", label: "RESULT" },
      { key: "result_interpretation", label: "INTERPRETATION", type: "textarea" },
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
      { key: "color", label: "COLOR" },
      { key: "transparency", label: "TRANSPARENCY" },
      { key: "ph_result", label: "pH REACTION" },
      { key: "spec_grav_result", label: "SPECIFIC GRAVITY" },
      { key: "protein", label: "PROTEIN" },
      { key: "nitrite", label: "NITRITE" },
      { key: "glucose", label: "GLUCOSE" },
      { key: "ketones", label: "KETONES" },
      { key: "leukocytes", label: "LEUKOCYTES" },
      { key: "blood", label: "BLOOD" },
      { key: "pus_cells", label: "PUS CELLS" },
      { key: "rbc", label: "RBC" },
      { key: "bacteria", label: "BACTERIA" },
      { key: "others", label: "OTHER FINDINGS", type: "textarea" },
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
      { key: "time_collected", label: "TIME COLLECTED" },
      { key: "time_received", label: "TIME RECEIVED" },
      { key: "color", label: "COLOR" },
      { key: "consistency", label: "CONSISTENCY" },
      { key: "pus_cells", label: "PUS CELLS" },
      { key: "rbc", label: "RBC" },
      { key: "bacteria", label: "BACTERIA" },
      { key: "hookworm", label: "HOOKWORM" },
      { key: "ascaris", label: "ASCARIS" },
      { key: "trichuris", label: "TRICHURIS" },
      { key: "others", label: "OTHER FINDINGS", type: "textarea" },
    ],
  },

  {
    value: "lab-FOBT",
    label: "Fecal Occult Blood",
    group: "lab",
    category: "other",
    schemaKey: "FOBT",
    testName: "Fecal Occult Blood",
    fields: [
      { key: "test", label: "Test Name", placeholder: "Fecal Occult Blood" },
      { key: "method", label: "METHOD" },
      { key: "specimen", label: "SPECIMEN" },
      { key: "day_of_fever", label: "DAYS OF FEVER" },
      { key: "result", label: "RESULT INTERPRETATION", type: "textarea" },
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
      { key: "test", label: "Test Name", placeholder: "Dengue / HBsAg / Syphilis", type: "select", options: [{ value: "Dengue", label: "DENGUE" }, { value: "HBsAg", label: "HBsAg" }, { value: "Syphilis", label: "SYPHILIS" }, { value: "Pregnancy Test", label: "PREGNANCY TEST (HCG)"} ] },
      { key: "method", label: "METHOD" },
      { key: "specimen", label: "SPECIMEN" },
      { key: "day_of_fever", label: "DAYS OF FEVER" },
      { key: "result", label: "RESULT INTERPRETATION", type: "textarea" },
    ],
  },
  {
    value: "lab-cbc",
    label: "Hematology - CBC",
    group: "lab",
    category: "hematology",
    schemaKey: "CBC",
    testName: "CBC",
    fields: [
      { key: "hemoglobin", label: "HEMOGLOBIN" },
      { key: "rbc_count", label: "RBC COUNT" },
      { key: "wbc_count", label: "WBC COUNT" },
      { key: "platelet_count", label: "PLATELET COUNT" },
      { key: "others", label: "OTHERS:MCV" },
      { key: "mchc", label: "MCHC" },
      { key: "reticulocyte_count", label: "RETICULOCYTE COUNT" },
      { key: "nss_1", label: "NEUTROPHILS SEGMENTERS STAB 1" },
      { key: "nss_2", label: "NEUTROPHILS SEGMENTERS STAB 2" },
      { key: "nss_3", label: "NEUTROPHILS SEGMENTERS STAB 3" },
      { key: "lymphocytes", label: "LYMPHOCYTES" },
      { key: "monocytes", label: "MONOCYTES" },
      { key: "eosinophils", label: "EOSINOPHILS" },
      { key: "basophils", label: "BASOPHILS" },
      { key: "others1", label: "OTHER FINDINGS", type: "textarea" },
      { key: "clotting_time", label: "CLOTTING TIME (CT)" },
      { key: "bleeding_time", label: "Bleeding Time (BT)" },
      { key: "others2", label: "REMARKS", type: "textarea" },
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
      { key: "abo_type", label: "ABO TYPE", type: "select", options: [ { value: "A", label: "A" }, { value: "B", label: "B" }, { value: "AB", label: "AB" }, { value: "O", label: "O" } ] },
      { key: "rh_type", label: "Rh TYPE", type: "select", options: [ { value: "Positive", label: "POSITIVE (+)" }, { value: "Negative", label: "NEGATIVE (-)" } ] },
      { key: "others1", label: "OTHERS" },
      { key: "others2", label: "REMARKS", type: "textarea" },
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

  const patientOptions: PatientOption[] = patients.map((patient) => ({
  value: String(patient.patient_id),
  label: `${patient.name}${
    patient.patient_code ? ` (${patient.patient_code})` : ""
  }`,
  patient,
}));

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

const filteredPatients = patients.filter((patient: PatientProps) => {
  const keyword = patientSearch.toLowerCase();

  return (
    patient.name.toLowerCase().includes(keyword) ||
    patient.patient_code?.toLowerCase().includes(keyword)
  );
});

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
                Register archived patients and encode their medical records.
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
                <div>
                  <Label>Patient</Label>
                  <ReactSelect
                    options={patientOptions}
                    placeholder="Search patient..."
                    isClearable
                    value={
                      patientOptions.find(
                        (option) => option.value === selectedPatientId
                      ) ?? null
                    }
                    onChange={(selected) => {
                      if (!selected) {
                        setSelectedPatientId("");
                        return;
                      }

                      setSelectedPatientId(selected.value);
                    }}
                    onInputChange={(value) => {
                      setPatientSearch(value);
                    }}
                    menuPortalTarget={
                      typeof document !== "undefined"
                        ? document.body
                        : undefined
                    }
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),

                      control: (base) => ({
                        ...base,
                        borderRadius: "12px",
                        borderColor: "#dce3ef",
                        background: "#f4f6fb",
                        minHeight: "42px",
                        fontSize: "14px",
                      }),

                      menuList: (base) => ({
                        ...base,
                        maxHeight: 220,
                        color: "#000",
                      }),
                    }}
                  />
                </div>

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
                        Data Category Selection
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
                    {/* {selectedOption.group === "consultation" && (
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
                    )} */}

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
                            ) : field.type === "select" ? (
                              <Select
                                label={field.label}
                                value={formValues[field.key] ?? ""}
                                onChange={(event) =>
                                  updateField(field.key, event.target.value)
                                }
                              >
                                <option value="">
                                  Select...
                                  {/* {field.placeholder ?? `Select ${field.label}`} */}
                                </option>

                                {field.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
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
                  Saves are isolated to the encoding and will not change active
                  request queues or billing workflows.
                </p>
                <Button
                  icon={<Save size={17} />}
                  type="submit"
                  disabled={
                    !selectedPatient ||
                    isSaving
                    // || (selectedOption.group === "consultation" && !latestConsultation)
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
