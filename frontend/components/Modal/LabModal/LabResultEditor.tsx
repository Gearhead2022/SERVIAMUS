"use client";

import BloodTypingModal from "./BloodTypingModal";
import ClinicalChemistryModal from "./ClinicalChemistryModal";
import ChemistryResultModal from "./chemresultModal";
import FecalOccultBloodModal from "./FecalOccultBloodModal";
import GeneralResultModal from "./GeneralResultModal";
import HbAIcResultModal from "./HbAIcResultModal";
import HematologyModal from "./HematologyModal";
import OGTTResultModal from "./OGTTResultModal";
import ParasitologyModal from "./ParasitologyModal";
import SerologyResultModal from "./SerologyResultModal";
import SingleChemistryModal from "./SingleChemistryModal";
import UrinalysisModal from "./UrinalysisModal";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import { resolveLabTemplate } from "@/utils/lab-templates";

type Props = {
  request: LabRequest;
  onSubmit: (form: LabResultPayload) => void;
  onCancel: () => void;
};

export default function LabResultEditor({ request, onSubmit, onCancel }: Props) {
  const template = resolveLabTemplate(request);

  if (template.key === "cbc") {
    return (
      <HematologyModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "blood-typing") {
    return (
      <BloodTypingModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "parasitology") {
    return (
      <ParasitologyModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "urinalysis") {
    return (
      <UrinalysisModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "clinical-chemistry-panel") {
    return (
      <ClinicalChemistryModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "single-chemistry" && template.singleChemistry) {
    return (
      <SingleChemistryModal
        config={template.singleChemistry}
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "hba1c") {
    return (
      <HbAIcResultModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "ogtt" && template.ogtt) {
    return (
      <OGTTResultModal
        config={template.ogtt}
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "serology" || template.key === "dengue" || template.key === "pregnancy-test") {
    return (
      <SerologyResultModal
        config={template.serology}
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "fecal-occult-blood") {
    return (
      <FecalOccultBloodModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  if (template.key === "chemistry-panel") {
    return (
      <ChemistryResultModal
        initialValues={request.resultPayload}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  return (
    <GeneralResultModal
      testName={request.testType}
      initialValues={request.resultPayload}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
