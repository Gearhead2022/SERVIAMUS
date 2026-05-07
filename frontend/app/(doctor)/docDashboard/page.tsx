"use client";

import RoleGuard from "@/guards/RoleGuard";
import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  Users, FlaskConical, UserPlus, CalendarCheck,
  ChevronRight, Clock, CheckCircle2, AlertCircle,
  Search, ArrowRight, Activity,
  Stethoscope, TestTube2, UserSearch,
  Calendar, TrendingUp,
  User, Hourglass, Ban, Plus, FileX
} from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  useGetAllRequest, useRequestAction, useConsultationRecords,
  useStatisticsRecords, useRequestPerWeek, useGetLabRequestByName
} from "@/hooks/Consultation/useConsultation";
import SweetAlert from "@/utils/SweetAlert";
import ModalHeader from "@/components/Modal/ModalHeader";
import PatientConsultationForm from "@/components/Modal/NestedModal/PatientConsultationForm";
import { useGetPrevVitalSigns } from "@/hooks/Patient/usePatientRegistration";
import { RequestProps, Status, RequestTypes } from "@/types/ConsultationTypes";
import AddPrescriptionForm from "@/components/Modal/ChildModal/AddPrescriptionForm";
import AddMedicalCertificateForm from "@/components/Modal/ChildModal/AddMedicalCertificateForm";
import { useRequestData } from "@/hooks/Consultation/useConsultation";
import { PatientProps } from "@/types/PatientTypes";
import { useAuth } from "@/context/AuthContext";
import { formattedIsoPH, formattedIsoTimePH } from "@/utils/Date";
import AddRequestForm from "@/components/Modal/NestedModal/AddRequestForm";

type RequestCardProps = {
  currentRequest: RequestProps;
  currentPatient: PatientProps;
};

type ConsultationCardProps = {
  currentRequest: RequestProps;
  onConsult: () => void;
  onPresc: () => void;
  onDone: (reqId: number, status: Status, request: RequestProps, consultationId: number) => void;
};

type CertificateCardProps = {
  currentRequest: RequestProps;
  onMedical: () => void;
  onDone: (reqId: number, status: Status, request: RequestProps, certificateId: number) => void;
};

type ModifRequestTypes = Exclude<RequestTypes, "LABORATORY">;

const MOCK_LAB_REQUESTS = [
  { id: 1, patient: "Jose Reyes", code: "P00031", test: "CBC", status: "released", requested: "Today 08:00" },
  { id: 2, patient: "Ana Cruz", code: "P00018", test: "Urinalysis", status: "pending", requested: "Today 08:30" },
  { id: 3, patient: "Liza Aquino", code: "P00062", test: "Blood Sugar", status: "pending", requested: "Today 09:30" },
  { id: 4, patient: "Carlos Mendoza", code: "P00009", test: "Lipid Profile", status: "released", requested: "Yesterday" },
];

const LAB_STATUS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  QUEUED: { label: "Queued", icon: CheckCircle2, color: "#f59e0b", bg: "#fffbeb" },
  DONE: { label: "Done", icon: CheckCircle2, color: "#0e7c7b", bg: "#e0f4f4" },
  PROCESSING: { label: "Processing", icon: Hourglass, color: "#d97706", bg: "#fffbeb" },
  CANCELLED: { label: "Cancelled", icon: Ban, color: "#94a3b8", bg: "#f1f5f9" },
};

const STATUS_META: Record<Status, { label: string; dot: string; text: string; bg: string; action_term: string }> = {
  WAITING: { label: "Waiting", dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", action_term: "Accept" },
  SERVING: { label: "In Progress", dot: "#0e7c7b", text: "#065050", bg: "#e0f4f4", action_term: "Accept" },
  DONE: { label: "Done", dot: "#22c55e", text: "#166534", bg: "#f0fdf4", action_term: "Done" },
  CANCELED: { label: "No-show", dot: "#94a3b8", text: "#475569", bg: "#f1f5f9", action_term: "Decline" },
};

const STAT_CONFIG = [
  { key: "totalPatients", label: "Total Patients", icon: Users, color: "#0f2244", bg: "#eef1f9", bar: "#0f2244" },
  { key: "totalConsultationRequest", label: "Today's Consultations", icon: CalendarCheck, color: "#0e7c7b", bg: "#e0f4f4", bar: "#0e7c7b" },
  { key: "totalPendingRequest", label: "Pending Requests", icon: AlertCircle, color: "#c8102e", bg: "#fdf0f2", bar: "#c8102e" },
  { key: "totalNewPatient", label: "New Registrations", icon: UserPlus, color: "#7c4dab", bg: "#f3eefb", bar: "#7c4dab" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={id}
      className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.08), 0 8px 24px rgba(15,34,68,0.05)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ borderBottom: "1px solid #f0f3fa" }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.13em]" style={{ color: "#8a99b8" }}>
      {children}
    </p>
  );
}

// Now Serving patient info card
function NowServingPatientCard({ currentRequest, currentPatient }: RequestCardProps) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
          style={{ background: "#0e7c7b" }}
        >
          {currentPatient?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>{currentPatient?.name}</p>
          <p className="text-[11px]" style={{ color: "#6b7da0" }}>
            {currentPatient?.age}y · {currentPatient?.sex}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: "#e0f4f4", color: "#065050" }}
          >
            {currentRequest.req_type}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={10} style={{ color: "#8a99b8" }} />
        <span className="text-[11px]" style={{ color: "#8a99b8" }}>
          {currentRequest.req_date}
        </span>
      </div>
    </div>
  );
}

function ConsultationActions({ currentRequest, onConsult, onPresc, onDone }: ConsultationCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      <Button onClick={onConsult} variant="consult" disabled={!!currentRequest?.consult?.consultation}>
        <Stethoscope size={12} /> Consult
      </Button>
      <Button variant="prescription" onClick={onPresc} disabled={!currentRequest?.consult?.consultation}>
        <ChevronRight size={10} /> Rx
      </Button>
      <Button
        variant="doneStatus"
        disabled={!currentRequest?.consult?.consultation}
        onClick={() =>
          onDone(
            currentRequest?.req_id ?? 0,
            "DONE",
            currentRequest!,
            Number(currentRequest.consult?.consultation.consultation_id)
          )
        }
      >
        Done
      </Button>
    </div>
  );
}

function CertificateActions({ currentRequest, onMedical, onDone }: CertificateCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      <Button onClick={onMedical} variant="consult" disabled={!!currentRequest?.cert?.certificate}>
        <Stethoscope size={12} /> Cert
      </Button>
      <Button variant="secondary" onClick={onMedical} disabled={!currentRequest?.cert?.certificate}>
        <ChevronRight size={10} /> Preview
      </Button>
      <Button
        variant="doneStatus"
        onClick={() =>
          onDone(
            currentRequest?.req_id ?? 0,
            "DONE",
            currentRequest!,
            Number(currentRequest.cert?.mcr_id)
          )
        }
      >
        Done
      </Button>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: requestList } = useGetAllRequest(debouncedSearch, ["CERTIFICATE", "CONSULTATION"] as ModifRequestTypes[]);
  const { mutateAsync: requestAction } = useRequestAction();

  const [addConsultationOpen, setAddConsultationOpen] = useState(false);
  const [addAssesmentOpen, setAddAssesmentOpen] = useState(false);
  const [addPrescriptionOpen, setAddPrescriptionOpen] = useState(false);
  const [addLaboratoryOpen, setAddLaboratoryOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<PatientProps | null>(null);

  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
  const { data: currentRequest } = useRequestData(currentRequestId!);

  const [selectedConsultationId, setSelectedConsultationId] = useState(() => {
    try {
      const stored = localStorage.getItem("consult_id");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch { return null; }
  });

  const [selectedCertificateId, setSelectedCertificateId] = useState(() => {
    try {
      const stored = localStorage.getItem("cert_id");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch { return null; }
  });

  const currentPatient = currentRequest?.patient;
  const waitingList = requestList?.filter((r) => r.status === "WAITING") ?? [];
  const servingList = requestList?.filter((r) => r.status === "SERVING") ?? [];
  const doneCount = requestList?.filter((r) => r.status === "DONE").length ?? 0;

  const { data: prevVitalSigns } = useGetPrevVitalSigns(currentPatient?.patient_id);
  const { data: consultationRecords } = useConsultationRecords(currentPatient?.patient_id);
  const { data: statisticsRecords } = useStatisticsRecords();
  const { data: WeeklyData } = useRequestPerWeek(['CONSULTATION', 'CERTIFICATE']);
  const { data: labRequest } = useGetLabRequestByName("abdon sugrarartr", currentPatient?.patient_id ?? 0);

  const dayCounts = [
    WeeklyData?.Monday ?? 0,
    WeeklyData?.Tuesday ?? 0,
    WeeklyData?.Wednesday ?? 0,
    WeeklyData?.Thursday ?? 0,
    WeeklyData?.Friday ?? 0,
    WeeklyData?.Saturday ?? 0,
    WeeklyData?.Sunday ?? 0,
  ];

  const STATS = STAT_CONFIG.map((item) => ({
    ...item,
    value: statisticsRecords?.[item.key as keyof typeof statisticsRecords] ?? 0,
  }));

  useEffect(() => {
    const stored = localStorage.getItem("request_id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setCurrentRequestId(Number(stored));
  }, []);

  const getStorageKey = (type: string) => (type === "CONSULTATION" ? "consult_id" : "cert_id");

  const handleRequestAction = async (
    request_id: number,
    status: Status,
    request: RequestProps,
    custom_id: number | undefined
  ) => {
    const confirmed = await SweetAlert.confirmationAlert2(
      "Are you sure?",
      `You are about to ${STATUS_META[status].action_term} this request.`
    );
    if (!confirmed) return;

    await requestAction({ request_id, status });

    const key = getStorageKey(request.req_type);
    if (status === "SERVING") {
      localStorage.setItem("request_id", String(request_id));
      localStorage.setItem(key, JSON.stringify(custom_id));
      if (key === "cert_id") setSelectedCertificateId(custom_id);
      else setSelectedConsultationId(custom_id);
      setCurrentRequestId(request_id);
    } else if (status === "CANCELED") {
      return;
    } else {
      localStorage.removeItem("request_id");
      localStorage.removeItem(key);
      setCurrentRequestId(null);
    }
  };

  const handleActiveConsult = (request: RequestProps, consult?: number) => {
    localStorage.setItem("request_id", String(request.req_id));
    localStorage.setItem("consult_id", JSON.stringify(consult));
    setCurrentRequestId(request.req_id);
    setSelectedConsultationId(consult);
  };

  const handleActiveMedical = (request: RequestProps, cert?: number) => {
    localStorage.setItem("request_id", String(request.req_id));
    localStorage.setItem("cert_id", JSON.stringify(cert));
    setCurrentRequestId(request.req_id);
    setSelectedCertificateId(cert);
  };

  const getRelatedId = (info: RequestProps) =>
    info.req_type === "CONSULTATION" ? info.consult?.cons_id : info.cert?.mcr_id;

  const handleAcceptRequest = (info: RequestProps, type: string) => {
    const relatedId = getRelatedId(info);
    if (!relatedId) return;
    handleRequestAction(info.req_id, type as Status, info, relatedId);
  };

  const pendingLabCount = MOCK_LAB_REQUESTS.filter((l) => l.status === "pending").length;
  const todayIndex = new Date().getDay() === 0 ? -1 : new Date().getDay() - 1;
  const weeklyTotal = dayCounts.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...dayCounts, 1);

  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>

      {/* ── Modals ── */}
      {addConsultationOpen && (
        <ModalHeader showModal title="Patient Consultation Results" subtitle="Fill in the details below" sizeModal="xlarge" onClose={() => setAddConsultationOpen(false)}>
          <PatientConsultationForm patient={currentPatient} vitals={prevVitalSigns ?? undefined} consult={consultationRecords ?? undefined} cons_id={selectedConsultationId} onClose={() => setAddConsultationOpen(false)} />
        </ModalHeader>
      )}
      {addPrescriptionOpen && (
        <ModalHeader showModal title="Patient Prescription" subtitle="" sizeModal="xlarge" onClose={() => setAddPrescriptionOpen(false)}>
          <AddPrescriptionForm patient={currentPatient} consult_id={selectedConsultationId} onClose={() => setAddPrescriptionOpen(false)} />
        </ModalHeader>
      )}
      {addAssesmentOpen && (
        <ModalHeader showModal title="Patient Medical Certificate" subtitle="" sizeModal="xlarge" onClose={() => setAddAssesmentOpen(false)}>
          <AddMedicalCertificateForm mcrId={selectedCertificateId} patient={currentPatient} requestEntry={currentRequest?.cert} onClose={() => setAddAssesmentOpen(false)} />
        </ModalHeader>
      )}

      {selectedPatient && addLaboratoryOpen && (
        <ModalHeader showModal={true} title="Patient Request Form" subtitle="Fill in details below to create request" sizeModal="2xlarge" onClose={() => setAddLaboratoryOpen(false)}>
          <AddRequestForm patient={selectedPatient} vitals={prevVitalSigns ?? undefined} onClose={() => setAddLaboratoryOpen(false)} />
        </ModalHeader>
      )}

      <div
        className="min-h-screen font-['DM_Sans']"
        style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}
      >

        {/* ── Top Header ── */}
        <div className="px-8 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "#c8102e", boxShadow: "0 4px 16px rgba(200,16,46,0.35)" }}
              >
                <User size={18} />
              </div>
              <div>
                <h1 className="text-[17px] leading-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "#0f2244" }}>
                  <span className="opacity-50">Good morning,</span> {user?.name ?? "Doctor"}
                </h1>
                <p className="text-[11px] mt-0.5" style={{ color: "#6b7da0" }}>
                  {user?.title ?? "Doctor"} &nbsp;·&nbsp; {formattedIsoPH()} &nbsp;·&nbsp;
                  <span className="font-mono">{formattedIsoTimePH()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-5">

          {/* ── ① Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color, bg, bar }) => (
              <Card key={label}>
                <div className="h-[3px]" style={{ background: bar }} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>
                      {(value as number).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[12px] font-semibold" style={{ color: "#6b7da0" }}>{label}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* ── ② Main Area: Queue (left) + Action Column (right) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

            {/* ── Queue Table ── */}
            <Card id="queue">
              <div className="h-[3px]" style={{ background: "#0e7c7b" }} />
              <CardHeader>
                <div>
                  <CardLabel>Today&apos;s Queue</CardLabel>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>
                      {requestList?.length ?? 0} patients
                    </p>
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fffbeb", color: "#92400e" }}>
                      {waitingList.length} waiting
                    </span>
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#166534" }}>
                      {doneCount} done
                    </span>
                    {currentPatient && (
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ background: "#e0f4f4", color: "#065050" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c7b] animate-pulse" />
                        {currentPatient.name} in progress
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                  <input
                    type="text"
                    placeholder="Search patient…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                    style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "160px" }}
                  />
                </div>
              </CardHeader>

              <div className="overflow-y-auto" style={{ maxHeight: "520px" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                      {["#", "Patient", "Time", "Type", "Status", "Actions", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8a99b8" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requestList?.map((p, i) => {
                      const pat = p.patient;
                      const isActive = currentRequest?.req_id === p.req_id;
                      return (
                        <tr
                          key={p.req_id}
                          className="group transition-all"
                          style={{
                            borderBottom: "1px solid #f4f6fb",
                            background: isActive ? "rgba(14,124,123,0.06)" : "white",
                          }}
                        >
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono" style={{ color: "#c0ccd8" }}>{i + 1}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={{ background: isActive ? "#e0f4f4" : "#eef1f9", color: isActive ? "#0e7c7b" : "#0f2244" }}
                              >
                                {pat.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                              </div>
                              <div>
                                <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{pat.name}</p>
                                <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{pat.age}y · {pat.sex}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Clock size={10} style={{ color: "#c0ccd8" }} />
                              <span className="text-[11px]" style={{ color: "#6b7da0" }}>{p.req_date}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px]" style={{ color: "#4a5568" }}>{p.req_type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status as Status} />
                          </td>
                          <td className="px-4 py-3">
                            {p.status?.toLowerCase() === "waiting" ? (
                              <div className="flex items-center gap-1.5">
                                <Button variant="acceptRequest" className="!text-[10px] !px-2 !py-1 !rounded-lg" onClick={() => handleAcceptRequest(p, "SERVING")}>
                                  Accept
                                </Button>
                                <Button variant="declineRequest" className="!text-[10px] !px-2 !py-1 !rounded-lg" onClick={() => handleAcceptRequest(p, "CANCELED")}>
                                  Decline
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px]" style={{ color: "#c0ccd8" }}>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/doctor/patients/${p.req_id}`}
                              className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: "#0f2244" }}
                            >
                              View <ChevronRight size={11} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 flex justify-end" style={{ borderTop: "1px solid #f0f3fa" }}>
                <Link href="/doctor/patients" className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "#0f2244" }}>
                  View all patients <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* ── Right Action Column ── */}
            <div className="flex flex-col gap-4">

              {/* Now Serving */}
              <Card id="now-serving">
                <div className="h-[3px]" style={{ background: "#c8102e" }} />
                <CardHeader>
                  <div>
                    <CardLabel>Now Serving</CardLabel>
                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Current Patient</p>
                  </div>
                  <span
                    className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase px-2 py-1 rounded-full"
                    style={{ background: "#e0f4f4", color: "#065050", border: "1px solid rgba(14,124,123,0.2)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c7b] animate-pulse" />
                    Live
                  </span>
                </CardHeader>

                {currentRequest && currentPatient ? (
                  <div className="p-4">
                    <NowServingPatientCard currentRequest={currentRequest} currentPatient={currentPatient} />
                    {currentRequest.req_type === "CONSULTATION" ? (
                      <ConsultationActions
                        currentRequest={currentRequest}
                        onConsult={() => setAddConsultationOpen(true)}
                        onPresc={() => setAddPrescriptionOpen(true)}
                        onDone={handleRequestAction}
                      />
                    ) : (
                      <CertificateActions
                        currentRequest={currentRequest}
                        onMedical={() => setAddAssesmentOpen(true)}
                        onDone={handleRequestAction}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: "#f0f3fa" }}>
                      <Stethoscope size={18} style={{ color: "#c0ccd8" }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>No active consultation</p>
                    <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>Accept a patient from the queue</p>
                  </div>
                )}
              </Card>

              {/* In-Progress Requests */}
              <Card id="in-progress">
                <div className="h-[3px]" style={{ background: "#0e7c7b" }} />
                <CardHeader>
                  <div>
                    <CardLabel>In Progress</CardLabel>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>{servingList.length} open</p>
                    </div>
                  </div>
                  <AlertCircle size={14} style={{ color: "#0e7c7b" }} />
                </CardHeader>

                <div className="overflow-y-auto" style={{ minHeight: "220px", maxHeight: "320px" }}>
                  {servingList.length ? (
                    servingList.map((r, i) => {
                      const isSelected = currentRequest?.req_id === r.req_id;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (r.req_type === "CONSULTATION") handleActiveConsult(r, r.consult?.cons_id);
                            else handleActiveMedical(r, r.cert?.mcr_id);
                          }}
                          className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors group hover:bg-[#f8f9fc]"
                          style={{
                            borderBottom: i < servingList.length - 1 ? "1px solid #f4f6fb" : "none",
                            background: isSelected ? "rgba(14,124,123,0.06)" : "white",
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: isSelected ? "#e0f4f4" : "#eef1f9", color: isSelected ? "#0e7c7b" : "#0f2244" }}
                          >
                            {r.req_type === "LABORATORY" ? <TestTube2 size={13} /> : <Stethoscope size={13} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[12.5px] truncate" style={{ color: "#1a2a45" }}>{r.patient.name}</p>
                            <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{r.req_type}</p>
                          </div>
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "#6b7da0" }} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>All caught up 🎉</p>
                      <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>No ongoing requests</p>
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </div>

          {/* ── ③ Bottom Strip: Unified Card — Chart left, Lab cards horizontal scroll right ── */}
          <Card>
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #0e7c7b 50%, #7c4dab 50%)" }} />

            <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-[#f0f3fa]">

              {/* ── Weekly Chart (left, fixed width) ── */}
              <div className="xl:w-[340px] flex-shrink-0 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardLabel>Weekly Overview</CardLabel>
                    <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Consultations this week</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: "#8a99b8" }}>Total</span>
                    <span className="text-[15px] font-bold" style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>{weeklyTotal}</span>
                    <Calendar size={13} style={{ color: "#b0bcd4" }} />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const count = dayCounts[i];
                    const isToday = i === todayIndex;
                    const pct = count / maxCount;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-semibold" style={{ color: isToday ? "#0f2244" : "#b0bcd4" }}>
                          {day}
                        </span>
                        <div className="w-full rounded-lg relative overflow-hidden" style={{ height: "72px", background: "#f4f6fb" }}>
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-lg transition-all"
                            style={{
                              height: `${Math.max(pct * 100, count === 0 ? 6 : 0)}%`,
                              background: isToday
                                ? "linear-gradient(to top, #c8102e, #e8405a)"
                                : "linear-gradient(to top, #1a3560, #3a5a90)",
                              opacity: count === 0 ? 0.15 : 1,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: isToday ? "#c8102e" : "#8a99b8" }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Lab Requests (right, horizontal scroll) ── */}
              <div className="flex-1 min-w-0 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardLabel>Lab Request Status</CardLabel>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>
                        {labRequest?.length} requests
                      </p>
                      {pendingLabCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fffbeb", color: "#92400e" }}>
                          {pendingLabCount} pending
                        </span>
                      )}
                      {/* {labRequest && labRequest.filter((l) => l.items.status.toUpperCase() === "DONE").length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#e0f4f4", color: "#065050" }}>
                          {labRequest?.filter((l) => l.items.status.toUpperCase() === "DONE").length} released
                        </span>
                      )} */}
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors"
                    style={{ background: "#f3eefb", color: "#7c4dab", border: "1.5px solid #e0d4f5" }}
                    onClick={() => [setSelectedPatient(currentRequest?.patient ?? null), setAddLaboratoryOpen(true)]}
                  >
                    <Plus size={11} /> New Request
                  </button>
                </div>

                {/* Horizontal scroll row of cards */}
                <div
                  className="flex gap-3 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#dce3ef transparent" }}
                >
                  {labRequest && labRequest.length > 0 ? (
                    labRequest.map((lab) => {
                      const s = LAB_STATUS[lab.status.toUpperCase()];
                      const totalTests = 1;
                      // Math.floor(Math.random() * 3) + 1;
                      const completedTests = lab.status.toUpperCase() === "DONE" ? totalTests : 0;
                      // const completedTests = 0;
                      const pct = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
                      const billStatus = lab.billing.status;

                      return (
                        <div
                          key={lab.item_id}
                          className="flex-shrink-0 rounded-2xl p-4 cursor-pointer group transition-all hover:shadow-md"
                          style={{
                            width: "220px",
                            border: "1.5px solid #d5ebe6",
                            background: "#fbfefe",
                          }}
                        >
                          {/* Header: id + status */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: "#e6f7f3", color: "#2e7a6e" }}
                            >
                              {lab.patient.patient_code}
                            </span>
                            <span
                              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: s.bg, color: s.color }}
                            >
                              <s.icon size={10} />
                              {s.label}
                            </span>
                          </div>

                          {/* Patient name */}
                          <p className="font-semibold text-[13px] truncate mt-1" style={{ color: "#173f39" }}>
                            {lab.patient.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#63867f" }}>
                            {billStatus} PAYMENT
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#9bb5b0" }}>
                            {lab.request.req_by}
                          </p>

                          {/* Progress bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#63867f" }}>
                                Progress
                              </span>
                              <span className="text-[11px] font-bold" style={{ color: "#143a35" }}>
                                {completedTests}/{totalTests}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e3f3ef" }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: lab.status.toUpperCase() === "DONE" ? "#0e7c7b" : "#152859",
                                }}
                              />
                            </div>
                          </div>

                          {/* View link */}
                          <div className="mt-3 flex justify-end">
                            <span
                              className="flex items-center gap-1 text-[10.5px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: "#0f2244" }}
                              hidden={lab.status.toUpperCase() != 'DONE'}
                            >
                              View <ChevronRight size={11} />
                            </span>
                          </div>
                        </div>
                      );
                    })) :
                    <div className="w-full flex flex-col items-center justify-center py-10 opacity-80">
                      <FileX size={32} className="mb-2 text-gray-400" />
                      <p className="text-[14px] font-semibold text-gray-600">
                        No records found
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Try adjusting your filters or search
                      </p>
                    </div>
                  };
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </RoleGuard >
  );
};

export default Dashboard;