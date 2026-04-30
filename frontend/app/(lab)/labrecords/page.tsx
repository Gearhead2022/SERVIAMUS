"use client";

import { useState } from "react";
import { FileSearch, Printer, Search, Users } from "lucide-react";
import { useDebounce } from "use-debounce";
import PatientCard from "@/components/PatientCard";
import PatientLabRecordsModal from "@/components/Modal/LabModal/PatientLabRecordsModal";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import ModalHeader from "@/components/Modal/ModalHeader";
import RoleGuard from "@/guards/RoleGuard";
import { useLabPatientDirectory } from "@/hooks/Lab/useLab";
import { LabRequest, PatientRecord } from "@/types/LabTypes";
import { openLabPrintPage } from "@/utils/lab-print";

export default function LabRecordsPage() {
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeRecord, setActiveRecord] = useState<LabRequest | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { data: patients = [], error, isLoading } = useLabPatientDirectory(debouncedSearch);
  const hasSearch = debouncedSearch.trim().length > 0;

  const closeRecordsModal = () => {
    setActiveRecord(null);
    setSelectedPatient(null);
  };

  const closePreviewModal = () => {
    setActiveRecord(null);
  };

  return (
    <RoleGuard allowedRoles={["LAB", "LABORATORY","DOCTOR"]}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        .records-page {
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
          min-height: 100vh;
        }

        /* ── Page Header ── */
        .page-header {
          background: #ffffff;
          border-bottom: 1px solid #e2eaf2;
          padding: 28px 32px 24px;
        }
        .page-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #7a8fa8;
          margin-bottom: 4px;
        }
        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f1e3c;
          letter-spacing: -0.02em;
        }
        .page-subtitle {
          font-size: 13px;
          color: #7a8fa8;
          margin-top: 2px;
        }

        /* ── Search Bar ── */
        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 480px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #2563a8;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          border: 1.5px solid #dde6f0;
          border-radius: 12px;
          background: #f8fafc;
          padding: 10px 14px 10px 42px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #0f1e3c;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }
        .search-input::placeholder {
          color: #a0b0c4;
        }
        .search-input:focus {
          border-color: #2563a8;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37,99,168,0.10);
        }

        /* ── Stat Card ── */
        .stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px 22px;
          border: 1px solid #e2eaf2;
          box-shadow: 0 1px 3px rgba(15,30,60,0.06), 0 4px 16px rgba(15,30,60,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1e4d8c, #2a9d8f);
          border-radius: 16px 16px 0 0;
        }
        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(15,30,60,0.10), 0 8px 32px rgba(15,30,60,0.06);
          transform: translateY(-2px);
        }
        .stat-label {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6b7d90;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #0f1e3c;
          line-height: 1;
          margin-top: 12px;
          font-variant-numeric: tabular-nums;
        }
        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef4fb;
          color: #2563a8;
          flex-shrink: 0;
        }

        /* ── Section header ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f1e3c;
          letter-spacing: -0.01em;
        }
        .results-count-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          background: #eef4fb;
          color: #2563a8;
        }

        /* ── Skeleton shimmer ── */
        .skeleton-card {
          height: 176px;
          border-radius: 16px;
          background: linear-gradient(90deg, #e8eef6 25%, #f0f5fb 50%, #e8eef6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty state ── */
        .empty-state {
          border: 1.5px dashed #c8d8e8;
          border-radius: 16px;
          padding: 52px 24px;
          text-align: center;
          background: #f8fafc;
        }
        .empty-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: #eef4fb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .empty-title {
          font-size: 14px;
          font-weight: 600;
          color: #4a607a;
          margin-bottom: 4px;
        }
        .empty-body {
          font-size: 12.5px;
          color: #8fa4bc;
        }

        /* ── Error state ── */
        .error-state {
          border: 1px solid #fad2d2;
          border-radius: 16px;
          padding: 28px;
          text-align: center;
          background: #fff8f8;
          font-size: 13px;
          color: #8a4040;
        }

        /* ── Search hint ── */
        .search-hint {
          font-size: 12px;
          color: #7a8fa8;
          background: #f0f4f8;
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid #dde6f0;
          white-space: nowrap;
        }
      `}</style>

      {selectedPatient ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Records — ${selectedPatient.name}`}
          subtitle="Review encoded laboratory results by category, date, and patient request."
          meta={selectedPatient.patient_code}
          sizeModal="2xlarge"
          onClose={closeRecordsModal}
        >
          <PatientLabRecordsModal
            patient={selectedPatient}
            onViewResult={setActiveRecord}
          />
        </ModalHeader>
      ) : null}

      {activeRecord?.resultPayload ? (
        <ModalHeader
          showModal={true}
          title={`Laboratory Result Preview — ${activeRecord.patientName}`}
          subtitle={activeRecord.testType}
          meta={`${activeRecord.id} - ${activeRecord.patientId}`}
          sizeModal="2xlarge"
          onClose={closePreviewModal}
        >
          <LabResultPreview
            request={activeRecord}
            form={activeRecord.resultPayload}
            backLabel="Back to Records"
            showPassToDoctor={false}
            onBack={closePreviewModal}
            onDownloadPdf={() =>
              openLabPrintPage(activeRecord.labId, {
                autoDownload: true,
              })
            }
            onOpenPrintPage={() =>
              openLabPrintPage(activeRecord.labId, {
                autoPrint: true,
              })
            }
          />
        </ModalHeader>
      ) : null}

      <div className="records-page">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div className="mx-auto max-w-7xl">
            <p className="page-eyebrow">Laboratory Management</p>
            <h1 className="page-title">Patient Directory</h1>
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto]">

            {/* Search + hint */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="search-wrapper">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, address, or patient ID…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="search-input"
                />
              </div>
              {hasSearch && (
                <span className="search-hint">
                  Results for &ldquo;{debouncedSearch}&rdquo;
                </span>
              )}
            </div>

            {/* Stat card */}
            <div className="stat-card" style={{ minWidth: 180 }}>
              <div className="flex items-start justify-between">
                <p className="stat-label">Visible Patients</p>
                <div className="stat-icon">
                  <Users size={16} />
                </div>
              </div>
              <p className="stat-value">
                {isLoading ? (
                  <span style={{ fontSize: 28, color: "#a0b0c4" }}>—</span>
                ) : (
                  patients.length
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── Patient Grid ── */}
        <div className="mx-auto max-w-7xl px-6 pb-12">
          <div className="section-header">
            <h2 className="section-title">Patient Cards</h2>
            {!isLoading && !error && patients.length > 0 && (
              <span className="results-count-pill">
                {patients.length} {patients.length === 1 ? "patient" : "patients"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="skeleton-card"
                  style={{ animationDelay: `${index * 80}ms` }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              Unable to load the patient laboratory directory right now.
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <FileSearch size={26} color="#5a80aa" />
              </div>
              <p className="empty-title">No patients found</p>
              <p className="empty-body">
                {search
                  ? "Try a different search term to locate a patient record."
                  : "Laboratory patient records will appear here once requests exist."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.patient_id}
                  patient={{
                    age: patient.age ?? undefined,
                    address: patient.address,
                    birth_date: patient.birth_date ?? undefined,
                    contact_number: patient.contact_number ?? undefined,
                    name: patient.name,
                    patient_code: patient.patient_code,
                    patient_id: patient.patient_id,
                    religion: patient.religion ?? undefined,
                    sex: patient.sex ?? undefined,
                  }}
                  onClick={() => setSelectedPatient(patient)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}