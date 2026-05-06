"use client";

import { useMemo, useState } from "react";
import BloodTypingModal from "./BloodTypingModal";
import ClinicalChemistryModal from "./ClinicalChemistryModal";
import ChemistryResultModal from "./chemresultModal";
import FecalOccultBloodModal from "./FecalOccultBloodModal";
import GeneralResultModal from "./GeneralResultModal";
import HbAIcResultModal from "./HbAIcResultModal";
import HematologyModal from "./HematologyModal";
import LabResultPersonnelPanel from "./LabResultPersonnelPanel";
import OGTTResultModal from "./OGTTResultModal";
import ParasitologyModal from "./ParasitologyModal";
import SerologyResultModal from "./SerologyResultModal";
import SingleChemistryModal from "./SingleChemistryModal";
import UrinalysisModal from "./UrinalysisModal";
import { LabRequest, LabResultPayload } from "@/types/LabTypes";
import { useLabUsers } from "@/hooks/Lab/useLab";
import {
  buildLabPersonnelPayload,
  findLabUserById,
  getMedTechUsers,
  getPathologistUsers,
  getSavedMedTechUserId,
  getSavedPathologistUserId,
} from "@/utils/lab-personnel";
import {
  resolveChemistryPanelFieldNames,
  resolveClinicalChemistryFieldNames,
  resolveLabTemplate,
} from "@/utils/lab-templates";
import SweetAlert from "@/utils/SweetAlert";

type Props = {
  request: LabRequest;
  onSubmit: (form: LabResultPayload) => void;
  onCancel: () => void;
};

export default function LabResultEditor({ request, onSubmit, onCancel }: Props) {
  const [medTechUserId, setMedTechUserId] = useState<number | "">(
    () => getSavedMedTechUserId(request.resultPayload) ?? ""
  );
  const [pathologistUserId, setPathologistUserId] = useState<number | "">(
    () => getSavedPathologistUserId(request.resultPayload) ?? ""
  );
  const { data: labUsers = [], isLoading: isLoadingLabUsers } = useLabUsers();
  // The backend hands us one workflow entry, and the template resolver decides
  // whether that entry opens a single-test form or a morphed consolidated panel.
  const template = resolveLabTemplate(request);
  const clinicalChemistryFieldNames = resolveClinicalChemistryFieldNames(request);
  const chemistryPanelFieldNames = resolveChemistryPanelFieldNames(request);
  const medTechUsers = useMemo(() => getMedTechUsers(labUsers), [labUsers]);
  const pathologistUsers = useMemo(() => getPathologistUsers(labUsers), [labUsers]);

  const handleResultSubmit = (form: LabResultPayload) => {
    if (!medTechUserId || !pathologistUserId) {
      SweetAlert.errorAlert(
        "Personnel Required",
        "Please select both the medical technologist and the pathologist before saving the laboratory result."
      );
      return;
    }

    const medTechUser = findLabUserById(labUsers, medTechUserId);
    const pathologistUser = findLabUserById(labUsers, pathologistUserId);

    if (!medTechUser || !pathologistUser) {
      SweetAlert.errorAlert(
        "Personnel Missing",
        "The selected laboratory personnel could not be resolved. Please reselect both users and try again."
      );
      return;
    }

    onSubmit({
      ...form,
      ...buildLabPersonnelPayload({
        medTechUser,
        pathologistUser,
      }),
    });
  };

  const editor = (() => {
    if (template.key === "cbc") {
      return (
        <HematologyModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "blood-typing") {
      return (
        <BloodTypingModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "parasitology") {
      return (
        <ParasitologyModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "urinalysis") {
      return (
        <UrinalysisModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "clinical-chemistry-panel") {
      return (
        <ClinicalChemistryModal
          fieldNames={clinicalChemistryFieldNames}
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "single-chemistry" && template.singleChemistry) {
      return (
        <SingleChemistryModal
          config={template.singleChemistry}
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "hba1c") {
      return (
        <HbAIcResultModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "ogtt" && template.ogtt) {
      return (
        <OGTTResultModal
          config={template.ogtt}
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (
      template.key === "serology" ||
      template.key === "dengue" ||
      template.key === "pregnancy-test"
    ) {
      return (
        <SerologyResultModal
          config={template.serology}
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "fecal-occult-blood") {
      return (
        <FecalOccultBloodModal
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    if (template.key === "chemistry-panel") {
      return (
        <ChemistryResultModal
          fieldNames={chemistryPanelFieldNames}
          initialValues={request.resultPayload}
          onSubmit={handleResultSubmit}
          onCancel={onCancel}
        />
      );
    }

    return (
      <GeneralResultModal
        testName={request.testType}
        initialValues={request.resultPayload}
        onSubmit={handleResultSubmit}
        onCancel={onCancel}
      />
    );
  })();

  return (
    <div className="space-y-5">
      <LabResultPersonnelPanel
        isLoading={isLoadingLabUsers}
        medTechOptions={medTechUsers}
        medTechUserId={medTechUserId}
        onMedTechChange={setMedTechUserId}
        onPathologistChange={setPathologistUserId}
        pathologistOptions={pathologistUsers}
        pathologistUserId={pathologistUserId}
      />
      {editor}
    </div>
  );
}
