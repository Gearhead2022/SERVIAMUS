"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardPenLine,
  FileText,
  FlaskConical,
  HeartPulse,
  History,
  type LucideIcon,
  Plus,
  Save,
  Search,
  Stethoscope,
  UserRoundCheck,
  Users,
} from "lucide-react";
import ReactSelect from "react-select";
import AddPatientForm from "@/components/Modal/ChildModal/AddPatientForm";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/guards/RoleGuard";
import { useGetAllpatient } from "@/hooks/Patient/usePatientRegistration";
import {
  useEncodingConsultations,
  useSaveEncodingConsultation,
  useSaveEncodingFollowUp,
  useSaveEncodingLabResult,
} from "@/hooks/admin/useEncoding";
import type { LabCategory, LabResultPayload, LabSchemaKey } from "@/types/LabTypes";
import type { PatientProps } from "@/types/PatientTypes";
import { canAddPatient } from "@/utils/permissions";
import Label from "@/components/ui/label";

type FieldType = "date" | "text" | "textarea" | "select" | "checkbox";

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
  readOnly?: boolean;
};

type EncodingSection = {
  title: string;
  fields: EncodingField[];
};

type ClinicalChemistryTest = {
  value: string;
  label: string;
  testName: string;
  schemaKey: LabSchemaKey;
  fields: EncodingField[];
};

type ConversionDefinition = {
  field: string;
  convertedField: string;
  factor: number;
  label: string;
};

type EncodingOption = {
  value: string;
  label: string;
  group: "consultation" | "lab";
  category?: LabCategory;
  schemaKey?: LabSchemaKey;
  testName?: string;
  fields: EncodingField[] | EncodingSection[];
};

const today = () => new Date().toISOString().slice(0, 10);



const initialConsultationFields: EncodingSection[] = [
   {
    title: "Vital Signs & History",
    fields: [
      { key: "followupDate", label: "Consultation Date", type: "date" },
      { key: "bp", label: "Blood Pressure", placeholder: "120/80" },
      { key: "temp", label: "Temperature", placeholder: "36.7 °C" },
      { key: "cr", label: "Cardiac Rate", placeholder: "80 bpm" },
      { key: "rr", label: "Respiratory Rate", placeholder: "18" },
      { key: "wt", label: "Weight", placeholder: "50 kg" },
      { key: "ht", label: "Height", placeholder: "160 cm" },
      { key: "chief_complain", label: "Chief Complaint", type: "textarea" },
      { key: "hist_illness", label: "History of Present Illness", type: "textarea" },
      { key: "follow_up_date", label: "Follow-up Date", type: "date" },
    ],
  },

  {
    title: "Past Medical History",
    fields: [
      { key: "pmh_allergy", label: "Food & Drug Allergy", type: "checkbox" },
      { key: "pmh_admission", label: "Previous Admission", type: "checkbox" },
      { key: "pmh_others", label: "Others", type: "checkbox" },
      { key: "pmh_others_text", label: "Specify", placeholder: "Please specify..." },
    ],
  },

  {
    title: "Family History",
    fields: [
      { key: "fh_htn", label: "Hypertension", type: "checkbox" },
      { key: "fh_dm", label: "Diabetes Mellitus", type: "checkbox" },
      { key: "fh_ba", label: "Bronchial Asthma", type: "checkbox" },
      { key: "fh_cancer", label: "Cancer", type: "checkbox" },
      { key: "fh_others", label: "Others", type: "checkbox" },
      { key: "fh_others_text", label: "Specify", placeholder: "Please specify..." },
    ],
  },

  {
    title: "OB-Gyne History",
    fields: [
      { key: "ob_score", label: "G P", placeholder: "G2P1" },
      { key: "ob_nvsd", label: "NVSD", type: "checkbox" },
      { key: "ob_cs", label: "CS", type: "checkbox" },
      { key: "menarche", label: "Menarche", placeholder: "Age" },
      { key: "interval", label: "Interval", placeholder: "Days" },
      { key: "duration", label: "Duration", placeholder: "Days" },
      { key: "amount", label: "Amount", placeholder: "Pads/day" },
      { key: "ob_symptoms", label: "Symptoms" },
    ],
  },

  {
    title: "Personal & Social History",
    fields: [
      { key: "cigarette_use", label: "Cigarette Use", type: "checkbox" },
      { key: "alcohol_use", label: "Alcohol Use", type: "checkbox" },
      { key: "drug_use", label: "Drug Use", type: "checkbox" },
      { key: "exercise", label: "Exercise", type: "checkbox" },
      { key: "hygiene_prac", label: "Good Hygiene Practice", type: "checkbox" },
      { key: "coffee_cons", label: "Coffee Consumption", type: "checkbox" },
      { key: "soda_cons", label: "Soda Consumption", type: "checkbox" },
      { key: "travel_history", label: "Travel History" },
      { key: "diet", label: "Diet" },
      { key: "stress", label: "Stress / Coping Mechanism" },
      { key: "occupation", label: "Occupation" },
    ],
  },

  {
    title: "Examination & Assessment",
    fields: [
      { key: "examination", label: "Physical & Neurologic Examination", type: "textarea" },
      { key: "assessment", label: "Assessment", type: "textarea" },
      { key: "plans", label: "Plans", type: "textarea" },
    ],
  },
];

const ConsultationFields: EncodingField[] = [
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
const clinicalChemistryTests: ClinicalChemistryTest[] = [
  {
    value: "lipid-profile",
    label: "Lipid Profile",
    testName: "Lipid Profile",
    schemaKey: "clinical_chemistry",
    fields: [
      { key: "cholesterol", label: "TOTAL CHOLESTEROL" },
      { key: "hdl_cholesterol", label: "HDL-CHOLESTEROL" },
      { key: "ldl_cholesterol", label: "LDL-CHOLESTEROL" },
      { key: "triglycerides", label: "TRIGLYCERIDES" },
    ],
  },
  { value: "FBS", label: "Fasting Blood Sugar (FBS)", testName: "FBS", schemaKey: "FBS", fields: [{ key: "FBS", label: "FASTING BLOOD SUGAR (FBS)" }] },
  { value: "RBS", label: "Random Blood Sugar (RBS)", testName: "RBS", schemaKey: "RBS", fields: [{ key: "RBS", label: "RANDOM BLOOD SUGAR (RBS)" }] },
  { value: "BUN", label: "Urea (BUN)", testName: "BUN", schemaKey: "BUN", fields: [{ key: "BUN", label: "UREA (BUN)" }] },
  { value: "creatinine", label: "Creatinine", testName: "Creatinine", schemaKey: "clinical_chemistry", fields: [{ key: "creatinine", label: "Creatinine" }] },
  { value: "uric_acid", label: "Uric Acid", testName: "Uric Acid", schemaKey: "uricacid", fields: [{ key: "uric_acid", label: "Uric Acid" }] },
  { value: "cholesterol", label: "Total Cholesterol", testName: "Total Cholesterol", schemaKey: "totalcholesterol", fields: [{ key: "cholesterol", label: "CHOLESTEROL" }] },
  { value: "hdl_cholesterol", label: "HDL Cholesterol", testName: "HDL Cholesterol", schemaKey: "HDL", fields: [{ key: "hdl_cholesterol", label: "HDL-CHOLESTEROL" }] },
  { value: "ldl_cholesterol", label: "LDL Cholesterol", testName: "LDL Cholesterol", schemaKey: "LDL", fields: [{ key: "ldl_cholesterol", label: "LDL-CHOLESTEROL" }] },
  { value: "triglycerides", label: "Triglycerides", testName: "Triglycerides", schemaKey: "triglycerides", fields: [{ key: "triglycerides", label: "TRIGLYCERIDES" }] },
  { value: "sgpt", label: "ALT / SGPT", testName: "SGPT", schemaKey: "SGPT", fields: [{ key: "sgpt", label: "ALT/SGPT" }] },
];

const conversionDefinitions: ConversionDefinition[] = [
  { field: "FBS", convertedField: "FBS_conv", factor: 0.055, label: "FBS (mmol/L)" },
  { field: "RBS", convertedField: "RBS_conv", factor: 0.055, label: "RBS (mmol/L)" },
  { field: "BUN", convertedField: "BUN_conv", factor: 0.357, label: "BUN (mmol/L)" },
  { field: "creatinine", convertedField: "creatinine_conv", factor: 88.4, label: "Creatinine (umol/L)" },
  { field: "uric_acid", convertedField: "uric_acid_conv", factor: 0.059, label: "Uric Acid (mmol/L)" },
  { field: "cholesterol", convertedField: "cholesterol_conv", factor: 0.026, label: "Total Cholesterol (mmol/L)" },
  { field: "hdl_cholesterol", convertedField: "hdl_cholesterol_conv", factor: 0.026, label: "HDL-Cholesterol (mmol/L)" },
  { field: "ldl_cholesterol", convertedField: "ldl_cholesterol_conv", factor: 0.026, label: "LDL-Cholesterol (mmol/L)" },
  { field: "triglycerides", convertedField: "triglycerides_conv", factor: 0.011, label: "Triglycerides (mmol/L)" },
  { field: "ionized_calcium", convertedField: "ionized_calcium_conv", factor: 4.0078, label: "Ionized Calcium (mg/dL)" },
  { field: "fbs", convertedField: "FBS_conv", factor: 0.055, label: "FBS (mmol/L)" },
  { field: "onehagl", convertedField: "onehagl_conv", factor: 0.055, label: "1 Hour After Load (mmol/L)" },
  { field: "twohagl", convertedField: "twohagl_conv", factor: 0.055, label: "2 Hours After Load (mmol/L)" },
  { field: "threehagl", convertedField: "threehagl_conv", factor: 0.055, label: "3 Hours After Load (mmol/L)" },
];

const conversionByField = new Map(
  conversionDefinitions.map((definition) => [definition.field, definition])
);

const roundedConversion = (value: string, factor: number) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? String(Math.round(Math.abs(numericValue * factor) * 100) / 100)
    : "";
};

const clinicalChemistryCommonFields: EncodingField[] = [
  { key: "last_meal", label: "Last Meal", placeholder: "e.g. 6 hours ago" },
  { key: "time_taken", label: "Time Taken", placeholder: "e.g. 08:30 AM" },
];

const encodingOptions: EncodingOption[] = [
  {
    value: "initial-consultation",
    label: "Consultation",
    group: "consultation",
    fields: initialConsultationFields,
  },
  {
    value: "consultation-follow-up",
    label: "Follow-up Check-up",
    group: "consultation",
    fields: ConsultationFields,
  },
  {
    value: "lab-clinical-chemistry",
    label: "Clinical Chemistry - Panel",
    group: "lab",
    category: "clinical-chemistry",
    fields: [
      {
        key: "chemistry_tests",
        label: "Clinical Chemistry Tests",
        type: "checkbox",
      },
      { key: "sodium", label: "SODIUM (Na)" },
      { key: "potassium", label: "POTASSIUM (K)" },
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
      { key: "test_type", label: "TEST TYPE", placeholder: "50G / 75G / 100G", type: "select", options: [ { value: "50G", label: "50G 1H-OGTT" }, { value: "75G", label: "75G 2H-OGTT (NON-GESTATIONAL)" },{ value: "75Gv2", label: "75G 2H-OGTT (GESTATIONAL)" }, { value: "100G", label: "100G 3H-OGTT" } ] },
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
      { key: "squamous_cell", label: "SQUAMOUS CELLS" },
      { key: "round_cell", label: "ROUND CELLS" },
      { key: "mucous", label: "MUCOUS THREADS" },
      { key: "crystals", label: "CRYSTALS" },
      { key: "casts", label: "CASTS" },
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
      { key: "strongloides", label: "STRONGYLOIDES" },
      { key: "histolytica_cyst", label: "E. HISTOLYTICA CYST" },
      { key: "histolytica_trophozoite", label: "E. HISTOLYTICA TROPHOZOITE" },
      { key: "coli_cyst", label: "E. COLI CYST" },
      { key: "coli_trophozoite", label: "E. COLI TROPHOZOITE" },
      { key: "others", label: "OTHER FINDINGS", type: "textarea" },
    ],
  },

  {
    value: "lab-FOBT",
    label: "Clinical Microscopy - Fecal Occult Blood",
    group: "lab",
    category: "other",
    schemaKey: "FOBT",
    testName: "Fecal Occult Blood",
    fields: [
      { key: "test", label: "Test Name", placeholder: "Fecal Occult Blood" },
      { key: "method", label: "METHOD" },
      { key: "specimen", label: "SPECIMEN" },
      { key: "daysoffever", label: "DAYS OF FEVER" },
      { key: "results", label: "RESULTS", type: "textarea" },
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
      { key: "others_mcv", label: "OTHERS: MCV" },
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

const defaultEncodingOption =
  encodingOptions.find((option) => option.value === "initial-consultation") ??
  encodingOptions[0];

const emptyValuesFor = (option: EncodingOption) => {
  const values: Record<string, string> = {};

  for (const item of option.fields) {
    if ("fields" in item) {
      // It's an EncodingSection
      for (const field of item.fields) {
        values[field.key] = field.type === "date" && field.key !== "follow_up_date" ? today() : "";
      }
    } else {
      // It's an EncodingField
      values[item.key] = item.type === "date" && item.key !== "follow_up_date" ? today() : "";
    }
  }

  return values;
};

const formatDate = (value?: string | null) => {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
};

const isEncodingSection = (
  item: EncodingField | EncodingSection
): item is EncodingSection => "fields" in item;

// Maps each consultation section title to a small glyph so the section
// nav and section headers stay quickly scannable at a glance.
const sectionIconMap: Record<string, LucideIcon> = {
  "Vital Signs & History": Stethoscope,
  "Past Medical History": History,
  "Family History": Users,
  "OB-Gyne History": HeartPulse,
  "Personal & Social History": Activity,
  "Examination & Assessment": ClipboardCheck,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// A single reusable checkbox control styled as a chip, so selected items
// are visible at a glance instead of relying on a small tick mark alone.
const CheckboxChip = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label
    htmlFor={id}
    className={`flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
      checked
        ? "border-[#0e7c7b] bg-[#eff6f4] text-[#0e7c7b]"
        : "border-[#dce3ef] bg-white text-[#14233d] hover:border-[#0e7c7b]/50"
    }`}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 shrink-0 rounded border-[#c6d1e3] text-[#0e7c7b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7c7b]"
    />
    <span>{label}</span>
  </label>
);

const EncodingPage = () => {
  const { user } = useAuth();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedOptionValue, setSelectedOptionValue] = useState(
    defaultEncodingOption.value
  );
  const [labResultDate, setLabResultDate] = useState(today());
  const [formValues, setFormValues] = useState<Record<string, string>>(
    emptyValuesFor(defaultEncodingOption)
  );
  const [showPatientForm, setShowPatientForm] = useState(false);

  const { data: patients = [] } = useGetAllpatient(patientSearch);
  const saveLab = useSaveEncodingLabResult();
  const saveConsultation = useSaveEncodingConsultation();
  const saveFollowUp = useSaveEncodingFollowUp();
  const [selectedConsultationId, setSelectedConsultationId] = useState("");

  const patientOptions: PatientOption[] = patients.map((patient) => ({
  value: String(patient.patient_id),
  label: `${patient.name}${
    patient.patient_code ? ` (${patient.patient_code})` : ""
  }`,
  patient,
}));

  const selectedPatient =
    patients.find(
      (patient: PatientProps) => String(patient.patient_id) === selectedPatientId
    ) ?? null;

  const selectedOption = useMemo(
    () =>
      encodingOptions.find((option) => option.value === selectedOptionValue) ??
      encodingOptions[0],
    [selectedOptionValue]
  );

  const selectedClinicalChemistryTests = useMemo(
    () => {
      const selectedValues = new Set(
        (formValues.chemistry_tests ?? "").split(",").filter(Boolean)
      );

      return clinicalChemistryTests.filter((test) => selectedValues.has(test.value));
    },
    [formValues.chemistry_tests]
  );

  const isLipidProfile = selectedClinicalChemistryTests.some(
    (test) => test.value === "lipid-profile"
  );

  const selectedClinicalChemistryFields = useMemo(() => {
    const fieldsByKey = new Map<string, EncodingField>();

    selectedClinicalChemistryTests.forEach((test) => {
      test.fields.forEach((field) => {
        fieldsByKey.set(field.key, field);
      });
    });

    return Array.from(fieldsByKey.values());
  }, [selectedClinicalChemistryTests]);

  const visibleFields = useMemo(() => {
    if (selectedOption.value === "lab-clinical-chemistry") {
      const selector = selectedOption.fields[0] as EncodingField;
      const showMealFields = selectedClinicalChemistryFields.some(
        (field) => field.key === "FBS" || field.key === "RBS"
      );
      const resultFields = selectedClinicalChemistryFields.flatMap((field) => {
        const conversion = conversionByField.get(field.key);
        const isCalculatedLdl = isLipidProfile && field.key === "ldl_cholesterol";

        return conversion
          ? [
              { ...field, readOnly: isCalculatedLdl },
              {
                key: conversion.convertedField,
                label: conversion.label,
                readOnly: true,
              },
            ]
          : [field];
      });

      return [
        selector,
        ...(showMealFields ? clinicalChemistryCommonFields : []),
        ...resultFields,
      ];
    }

    if (selectedOption.value === "lab-ogtt") {
      const fields = selectedOption.fields as EncodingField[];
      const testType = formValues.test_type;
      const visibleKeys =
        testType === "50G"
          ? ["test_type", "fbs", "onehagl"]
          : testType === "75G" || testType === "75Gv2"
            ? ["test_type", "fbs", "onehagl", "twohagl"]
            : testType === "100G"
              ? ["test_type", "fbs", "onehagl", "twohagl", "threehagl"]
              : ["test_type"];

      return fields
        .filter((field) => visibleKeys.includes(field.key))
        .flatMap((field) => {
          const conversion = conversionByField.get(field.key);

          return conversion
            ? [
                field,
                {
                  key: conversion.convertedField,
                  label: conversion.label,
                  readOnly: true,
                },
              ]
            : [field];
        });
    }

    return selectedOption.fields;
  }, [formValues.test_type, isLipidProfile, selectedClinicalChemistryFields, selectedOption]);

  const renderedSections = useMemo(() => {
    if (visibleFields.every((item) => !isEncodingSection(item))) {
      return [{ title: null, fields: visibleFields as EncodingField[] }];
    }

    return visibleFields.map((item) =>
      isEncodingSection(item)
        ? { title: item.title, fields: item.fields }
        : { title: null, fields: [item] }
    );
  }, [visibleFields]);

  // Named sections only (used to build the quick-jump nav for long forms
  // like the initial consultation, which has six stacked sections).
  const sectionNavItems = useMemo(
    () => renderedSections.filter((section) => Boolean(section.title)),
    [renderedSections]
  );

  const { data: consultations = [], isFetching: isLoadingConsultations } =
    useEncodingConsultations(
      selectedPatient?.patient_id && selectedOption.value === "consultation-follow-up"
        ? selectedPatient.patient_id
        : undefined
    );

  const isSaving = saveLab.isPending || saveConsultation.isPending || saveFollowUp.isPending;
  const isLabTestSelectionMissing =
    (selectedOption.value === "lab-clinical-chemistry" &&
      selectedClinicalChemistryTests.length === 0) ||
    (selectedOption.value === "lab-ogtt" && !formValues.test_type);

  // Plain-language reason the Save button is disabled, surfaced next to
  // it so encoders don't have to guess what's missing.
  const saveBlockedReason = (() => {
    if (!selectedPatient) return "Select a patient to begin encoding.";
    if (selectedOption.value === "consultation-follow-up" && !selectedConsultationId) {
      return "Choose an existing consultation record to attach this follow-up.";
    }
    if (selectedOption.value === "lab-ogtt" && !formValues.test_type) {
      return "Select a test type to continue.";
    }
    if (
      selectedOption.value === "lab-clinical-chemistry" &&
      selectedClinicalChemistryTests.length === 0
    ) {
      return "Select at least one lab test to continue.";
    }
    return null;
  })();

  const updateSelectedOption = (value: string) => {
    const nextOption =
      encodingOptions.find((option) => option.value === value) ?? encodingOptions[0];
    setSelectedOptionValue(nextOption.value);
    setLabResultDate(today());
    setFormValues(emptyValuesFor(nextOption));
    setSelectedConsultationId("");
  };

  const updateField = (key: string, value: string) => {
    if (key === "test_type" && selectedOption.value === "lab-ogtt") {
      setFormValues({ [key]: value });
      return;
    }

    setFormValues((current) => {
      const nextValues = {
        ...current,
        [key]: value,
      };
      const conversion = conversionByField.get(key);

      if (conversion) {
        nextValues[conversion.convertedField] = roundedConversion(
          value,
          conversion.factor
        );
      }

      if (selectedOption.value === "lab-clinical-chemistry" && isLipidProfile) {
        const totalCholesterol = Number(nextValues.cholesterol);
        const hdlCholesterol = Number(nextValues.hdl_cholesterol);
        const triglycerides = Number(nextValues.triglycerides);

        if ([totalCholesterol, hdlCholesterol, triglycerides].every(Number.isFinite)) {
          if (triglycerides >= 400) {
            nextValues.ldl_cholesterol = "N/A";
            nextValues.ldl_cholesterol_conv = "N/A";
          } else {
            const calculatedLdl = Math.round(
              totalCholesterol - hdlCholesterol - triglycerides / 5
            );

            nextValues.ldl_cholesterol = String(calculatedLdl);
            nextValues.ldl_cholesterol_conv = roundedConversion(
              nextValues.ldl_cholesterol,
              0.026
            );
          }
        }
      }

      return nextValues;
    });
  };

  const toggleClinicalChemistryTest = (testValue: string) => {
    setFormValues((current) => {
      const selectedValues = new Set(
        (current.chemistry_tests ?? "").split(",").filter(Boolean)
      );

      if (selectedValues.has(testValue)) {
        selectedValues.delete(testValue);
      } else {
        if (testValue === "lipid-profile") {
          ["cholesterol", "hdl_cholesterol", "ldl_cholesterol", "triglycerides"].forEach(
            (lipidTest) => selectedValues.delete(lipidTest)
          );
        } else if (
          ["cholesterol", "hdl_cholesterol", "ldl_cholesterol", "triglycerides"].includes(
            testValue
          )
        ) {
          selectedValues.delete("lipid-profile");
        }
        selectedValues.add(testValue);
      }

      const visibleKeys = new Set(
        clinicalChemistryTests
          .filter((test) => selectedValues.has(test.value))
          .flatMap((test) => test.fields.map((field) => field.key))
      );
      const conversionKeys = new Set(
        Array.from(visibleKeys).flatMap((key) => {
          const conversion = conversionByField.get(key);
          return conversion ? [conversion.convertedField] : [];
        })
      );
      const nextValues = Object.fromEntries(
        Object.entries(current).filter(
          ([key]) =>
            key === "chemistry_tests" ||
            key === "last_meal" ||
            key === "time_taken" ||
            key === "note" ||
            visibleKeys.has(key) ||
            conversionKeys.has(key)
        )
      );

      return {
        ...nextValues,
        chemistry_tests: Array.from(selectedValues).join(","),
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPatient?.patient_id) {
      return;
    }

    if (selectedOption.group === "consultation") {
      if (selectedOption.value === "initial-consultation") {
        await saveConsultation.mutateAsync({
          patientId: selectedPatient.patient_id,
          consultationDate: formValues.followupDate || today(),
          fields: formValues,
        });
        setFormValues(emptyValuesFor(selectedOption));
        return;
      }

      if (!selectedConsultationId) return;
      await saveFollowUp.mutateAsync({
        patientId: selectedPatient.patient_id,
        consultationId: Number(selectedConsultationId),
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

    if (
      selectedOption.value === "lab-clinical-chemistry" &&
      selectedClinicalChemistryTests.length === 0
    ) {
      return;
    }

    if (selectedOption.value === "lab-clinical-chemistry") {
      for (const test of selectedClinicalChemistryTests) {
        const testFieldKeys = new Set([
          "last_meal",
          "time_taken",
          "note",
          ...test.fields.flatMap((field) => {
            const conversion = conversionByField.get(field.key);
            return conversion
              ? [field.key, conversion.convertedField]
              : [field.key];
          }),
        ]);
        const form: LabResultPayload = Object.fromEntries(
          Object.entries(formValues).filter(
            ([key, value]) => testFieldKeys.has(key) && value.trim() !== ""
          )
        );

        await saveLab.mutateAsync({
          patientId: selectedPatient.patient_id,
          category: selectedOption.category ?? "other",
          form,
          resultDate: labResultDate || today(),
          schemaKey: test.schemaKey,
          testName: test.testName,
        });
      }

      setFormValues(emptyValuesFor(selectedOption));
      return;
    }

    if (selectedOption.value === "lab-ogtt" && !formValues.test_type) {
      return;
    }

    const form: LabResultPayload = Object.fromEntries(
      Object.entries(formValues).filter(
        ([key, value]) => key !== "chemistry_test" && value.trim() !== ""
      )
    );

    const ogttDetails =
      formValues.test_type === "50G"
        ? { schemaKey: "onehOGTT" as const, testName: "50G 1H-OGTT" }
        : formValues.test_type === "75G"
          ? { schemaKey: "twohOGTT" as const, testName: "75G 2H-OGTT (Non-Gestational)" }
          : formValues.test_type === "75Gv2"
            ? { schemaKey: "twohOGTTv2" as const, testName: "75G 2H-OGTT (Gestational)" }
          : { schemaKey: "OGTT" as const, testName: "100G 3H-OGTT" };

    const labDetails =
      selectedOption.value === "lab-ogtt" ? ogttDetails : selectedOption;

    await saveLab.mutateAsync({
      patientId: selectedPatient.patient_id,
      category: selectedOption.category ?? "other",
      form,
      resultDate: labResultDate || today(),
      schemaKey: labDetails.schemaKey ?? null,
      testName: labDetails.testName ?? selectedOption.label,
    });
    setFormValues(emptyValuesFor(selectedOption));
  };

  return (
    <RoleGuard allowedRoles={["ENCODER"]}>
      <main className="min-h-full scroll-smooth bg-[#eef2f7] font-['DM_Sans'] text-[#14233d]">
        <header className="border-b border-[#cfd9e8] bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e7c7b]">
                Clinical operations desk
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f2244]">
                Encoder workspace
              </h1>
              <p className="mt-1 text-sm text-[#61718e]">
                Select the patient, choose the record, then save a complete entry.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-[#d8e1ef] bg-[#f8fafc] px-3 py-2 text-xs text-[#50617f]">
                <span className={`h-2 w-2 rounded-full ${selectedPatient ? "bg-[#0e7c7b]" : "bg-[#94a3b8]"}`} />
                <span className="font-semibold text-[#14233d]">
                  {selectedPatient ? "Patient file active" : "Waiting for patient"}
                </span>
              </div>
              {canAddPatient(user?.roles) && (
                <Button
                  icon={<Plus size={18} />}
                  variant="addPatient"
                  type="button"
                  onClick={() => setShowPatientForm((current) => !current)}
                >
                  {showPatientForm ? "Close patient form" : "Add patient"}
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-5">
            {showPatientForm && (
              <section className="overflow-hidden rounded-xl border border-[#b9dfdc] bg-white shadow-sm">
                <AddPatientForm
                  patient={null}
                  onClose={() => setShowPatientForm(false)}
                />
              </section>
            )}


            <section className="overflow-hidden rounded-xl border border-[#d8e1ef] bg-white shadow-[0_10px_28px_rgba(15,34,68,0.08)] lg:sticky lg:top-4">
              <div className="border-b border-[#18335f] bg-[#0f2244] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d3b6b] text-[#d6f4ef]">
                    <Search size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Patient file</h2>
                    <p className="text-xs text-[#c6d3e7]">Keep the active patient visible while encoding.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <Label>Find patient</Label>
                  <ReactSelect
                    options={patientOptions}
                    placeholder="Search by name or patient code..."
                    isClearable
                    value={
                      patientOptions.find(
                        (option) => option.value === selectedPatientId
                      ) ?? null
                    }
                    onChange={(selected) => {
                      if (!selected) {
                        setSelectedPatientId("");
                        setSelectedConsultationId("");
                        return;
                      }

                      setSelectedPatientId(selected.value);
                      setSelectedConsultationId("");
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

                      control: (base, state) => ({
                        ...base,
                        borderRadius: "10px",
                        borderColor: state.isFocused ? "#0e7c7b" : "#dce3ef",
                        boxShadow: state.isFocused
                          ? "0 0 0 3px rgba(14,124,123,0.15)"
                          : "none",
                        background: "#f8fafc",
                        minHeight: "44px",
                        fontSize: "14px",
                        "&:hover": {
                          borderColor: "#0e7c7b",
                        },
                      }),

                      menuList: (base) => ({
                        ...base,
                        maxHeight: 220,
                        color: "#000",
                      }),
                    }}
                  />
                </div>

                {selectedPatient ? (
                  <div className="relative overflow-hidden rounded-xl border border-[#b9dfdc] bg-[#f2fbfa] p-4">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#0e7c7b]" />
                    <div className="flex items-start gap-3 pt-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0e7c7b] text-white">
                        <UserRoundCheck size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0e7c7b]">
                          Selected patient
                        </p>
                        <p className="truncate text-base font-bold text-[#0f2244]">
                          {selectedPatient.name}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-[#6b7da0]">Patient code</dt>
                        <dd className="mt-1 font-semibold text-[#14233d]">{selectedPatient.patient_code || "-"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-[#6b7da0]">Age / sex</dt>
                        <dd className="mt-1 font-semibold text-[#14233d]">
                          {selectedPatient.age ?? "-"} / {selectedPatient.sex ?? "-"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-semibold uppercase tracking-wide text-[#6b7da0]">Address</dt>
                        <dd className="mt-1 break-words font-medium leading-relaxed text-[#14233d]">
                          {selectedPatient.address || "No address recorded"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-semibold uppercase tracking-wide text-[#6b7da0]">Contact</dt>
                        <dd className="mt-1 font-medium text-[#14233d]">{selectedPatient.contact_number || "-"}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#c6d1e3] bg-[#f8fafc] p-4 text-sm leading-relaxed text-[#6b7da0]">
                    Search by name or patient code to open a patient file.
                  </div>
                )}

                <div className="border-t border-[#e3e9f2] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7da0]">
                    Today&apos;s workflow
                  </p>
                  <ol className="mt-3 space-y-2.5 text-xs">
                    {[
                      { label: "Open patient file", complete: Boolean(selectedPatient) },
                      { label: "Choose record type", complete: Boolean(selectedOptionValue) },
                      { label: "Review and save", complete: !saveBlockedReason && Boolean(selectedPatient) },
                    ].map((step, index) => (
                      <li key={step.label} className="flex items-center gap-2.5 text-[#50617f]">
                        {step.complete ? (
                          <CheckCircle2 size={16} className="shrink-0 text-[#0e7c7b]" aria-hidden="true" />
                        ) : (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#b7c4d8] text-[9px] font-bold text-[#6b7da0]">
                            {index + 1}
                          </span>
                        )}
                        <span className={step.complete ? "font-semibold text-[#14233d]" : ""}>{step.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>


          </aside>

          <section className={`overflow-hidden rounded-xl border bg-white shadow-[0_10px_28px_rgba(15,34,68,0.08)] ${
            selectedOption.group === "lab"
              ? "border-[#f1d2d9]"
              : "border-[#d8e1ef]"
          }`}>
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className={`border-b p-5 sm:p-6 ${
                selectedOption.group === "lab"
                  ? "border-[#f1d2d9] bg-[#fffafb]"
                  : "border-[#dce3ef] bg-[#fbfcfe]"
              }`}>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
                  <div>
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${
                          selectedOption.group === "lab" ? "bg-[#c8102e]" : "bg-[#0e7c7b]"
                        }`}
                      >
                        {selectedOption.group === "lab" ? (
                          <FlaskConical size={19} />
                        ) : (
                          <ClipboardPenLine size={19} />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b7da0]">
                            Active record
                          </p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            selectedOption.group === "lab"
                              ? "bg-[#fff0f3] text-[#b20f2a]"
                              : "bg-[#e9f7f4] text-[#08726f]"
                          }`}>
                            {selectedOption.group === "lab" ? "Laboratory" : "Consultation"}
                          </span>
                        </div>
                        <h2 className="mt-0.5 text-xl font-bold text-[#0f2244]">
                          {selectedOption.label}
                        </h2>
                        <p className="mt-1 text-sm text-[#6b7da0]">
                          {selectedOption.group === "lab"
                            ? "Enter verified laboratory values and supporting details."
                            : "Document a consultation history, assessment, and follow-up plan."}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#dce3ef] pt-3 text-xs">
                      <span className="flex items-center gap-1.5 text-[#50617f]">
                        <UserRoundCheck size={14} className="text-[#0e7c7b]" />
                        <span className="font-semibold text-[#14233d]">
                          {selectedPatient ? selectedPatient.name : "No patient selected"}
                        </span>
                      </span>
                      {selectedPatient?.patient_code && (
                        <span className="font-medium text-[#6b7da0]">{selectedPatient.patient_code}</span>
                      )}
                    </div>
                  </div>

                  <Select
                    label="Specific record type"
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

              <div className="flex-1 p-5 sm:p-6">
                {!selectedPatient ? (
                  <div className="flex min-h-[390px] flex-col items-center justify-center rounded-xl border border-dashed border-[#c6d1e3] bg-[#f8fafc] p-6 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0f2244] text-[#d6f4ef] shadow-sm">
                      <FileText size={26} />
                    </div>
                    <h3 className="text-base font-bold text-[#0f2244]">
                      Open a patient file to begin
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-[#6b7da0]">
                      Search by name or patient code in the patient file panel. Add a patient only when the record is not already in the system.
                    </p>
                    <p className="mt-4 rounded-md bg-white px-3 py-2 text-xs font-medium text-[#50617f] shadow-sm">
                      Step 1 of 3: select the patient whose record you are updating.
                    </p>
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
                      <div className="grid gap-4 rounded-xl border border-[#f2d7dd] bg-[#fffafb] p-4 md:grid-cols-[minmax(0,240px)_1fr] md:items-end">
                        <Input
                          label="Result date"
                          type="date"
                          value={labResultDate}
                          onChange={(event) => setLabResultDate(event.target.value)}
                        />
                        <div className="flex items-center gap-3 rounded-lg border border-[#f1d2d9] bg-white px-3 py-2.5 text-sm text-[#50617f]">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#fff0f3] text-[#b20f2a]">
                            <CalendarDays size={16} />
                          </span>
                          <span>
                            <span className="block font-semibold text-[#14233d]">Result entry</span>
                            <span className="text-xs">Use the date the result was verified.</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedOption.value === "consultation-follow-up" && (
                      <div className="max-w-xl rounded-lg border border-[#dce3ef] bg-[#f8fafc] p-4">
                        <Select
                          label="Existing Consultation Record"
                          required
                          value={selectedConsultationId}
                          onChange={(event) => setSelectedConsultationId(event.target.value)}
                        >
                          <option value="">
                            {isLoadingConsultations ? "Loading consultations..." : "Select a consultation..."}
                          </option>
                          {consultations.map((consultation) => (
                            <option key={consultation.consultation_id} value={consultation.consultation_id}>
                              {formatDate(consultation.consultation_date)} — {consultation.chief_complaint || "No chief complaint"}
                            </option>
                          ))}
                        </Select>
                        {!isLoadingConsultations && consultations.length === 0 && (
                          <p className="mt-2 text-sm text-[#c8102e]">This patient has no consultation record to attach a follow-up to.</p>
                        )}
                      </div>
                    )}

                    {sectionNavItems.length > 1 && (
                      <div className="sticky top-0 z-10 -mx-5 flex gap-2 overflow-x-auto border-y border-[#dce3ef] bg-white/95 px-5 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
                        {sectionNavItems.map((section) => (
                          <a
                            key={section.title}
                            href={`#${slugify(section.title as string)}`}
                            className="shrink-0 rounded-full border border-[#dce3ef] px-3 py-1.5 text-xs font-semibold text-[#50617f] transition-colors hover:border-[#0e7c7b] hover:text-[#0e7c7b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7c7b]"
                          >
                            {section.title}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="space-y-6">
                      {renderedSections.map((section, index) => {
                        const SectionIcon = section.title
                          ? sectionIconMap[section.title] ?? ClipboardPenLine
                          : null;

                        return (
                          <section
                            key={section.title ?? `fields-${index}`}
                            id={section.title ? slugify(section.title) : undefined}
                            className={
                              section.title
                                ? "scroll-mt-16 rounded-xl border border-[#dce3ef] bg-[#fbfcfe] p-4 sm:p-5"
                                : ""
                            }
                          >
                            {section.title && SectionIcon && (
                              <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eff6f4] text-[#0e7c7b]">
                                  <SectionIcon size={15} />
                                </span>
                                <h3 className="text-sm font-bold text-[#0f2244]">
                                  {section.title}
                                </h3>
                              </div>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              {section.fields.map((field) => {
                                const isWide =
                                  field.type === "textarea" ||
                                  field.key === "chemistry_tests";

                                return (
                                  <div key={field.key} className={isWide ? "col-span-full" : ""}>
                                    {field.type === "textarea" ? (
                                      <Textarea
                                        label={field.label}
                                        rows={4}
                                        placeholder={field.placeholder}
                                        value={formValues[field.key] ?? ""}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                      />
                                    ) : field.type === "select" ? (
                                      <Select
                                        label={field.label}
                                        required={
                                          field.key === "test_type"
                                        }
                                        value={formValues[field.key] ?? ""}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                      >
                                        <option value="">Select...</option>
                                        {field.options?.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </Select>
                                    ) : field.key === "chemistry_tests" ? (
                                      <fieldset className="rounded-xl border border-[#dce3ef] bg-[#f8fafc] p-4">
                                        <legend className="px-1 text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0]">
                                          {field.label}
                                        </legend>
                                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                          {clinicalChemistryTests.map((test) => {
                                            const isSelected = selectedClinicalChemistryTests.some(
                                              (selectedTest) => selectedTest.value === test.value
                                            );

                                            return (
                                              <CheckboxChip
                                                key={test.value}
                                                id={`chem-${test.value}`}
                                                label={test.label}
                                                checked={isSelected}
                                                onChange={() => toggleClinicalChemistryTest(test.value)}
                                              />
                                            );
                                          })}
                                        </div>
                                      </fieldset>
                                    ) : field.type === "checkbox" ? (
                                      <CheckboxChip
                                        id={`field-${field.key}`}
                                        label={field.label}
                                        checked={formValues[field.key] === "true"}
                                        onChange={() =>
                                          updateField(
                                            field.key,
                                            String(formValues[field.key] !== "true")
                                          )
                                        }
                                      />
                                    ) : (
                                      <Input
                                        label={field.label}
                                        type={field.type ?? "text"}
                                        placeholder={field.placeholder}
                                        readOnly={field.readOnly}
                                        value={formValues[field.key] ?? ""}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-[#dce3ef] bg-white/95 p-5 shadow-[0_-8px_20px_rgba(15,34,68,0.04)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className={`flex items-center gap-2 text-xs font-medium ${
                  saveBlockedReason ? "text-[#c8102e]" : "text-[#0e7c7b]"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    saveBlockedReason ? "bg-[#c8102e]" : "bg-[#0e7c7b]"
                  }`} />
                  <p role="status">
                    {saveBlockedReason ?? "Ready to save this record."}
                  </p>
                </div>
                <Button
                  icon={<Save size={17} />}
                  type="submit"
                  disabled={
                    !selectedPatient ||
                    isSaving ||
                    isLabTestSelectionMissing ||
                    (selectedOption.value === "consultation-follow-up" && !selectedConsultationId)
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
