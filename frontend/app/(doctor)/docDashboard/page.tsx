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
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useGetAllRequest, useRequestAction, useConsultationRecords, useStatisticsRecords } from "@/hooks/Consultation/useConsultation";
import SweetAlert from "@/utils/SweetAlert";
import ModalHeader from "@/components/Modal/ModalHeader";
import PatientConsultationForm from "@/components/Modal/NestedModal/PatientConsultationForm";
import { useGetPrevVitalSigns } from "@/hooks/Patient/usePatientRegistration";
import { RequestProps, Status } from "@/types/ConsultationTypes";
import AddPrescriptionForm from "@/components/Modal/ChildModal/AddPrescriptionForm";
import AddMedicalCertificateForm from "@/components/Modal/ChildModal/AddMedicalCertificateForm";
import { useRequestData } from "@/hooks/Consultation/useConsultation";
import { PatientProps } from "@/types/PatientTypes";

const DOCTOR = { name: "Dr. Maria Santos", title: "General Practitioner", initials: "MS" };

interface ActivityItem {
  id: number; action: string; patient: string;
  time: string; type: "consultation" | "lab" | "registration";
}

type RequestCardProps = {
  currentRequest: RequestProps;
  currentPatient: PatientProps;
};

type ConsultationCardProps = {
  currentRequest: RequestProps;
  onConsult: () => void;
  onPresc: () => void;
  onDone: (
    reqId: number,
    status: Status,
    request: RequestProps,
    consultationId: number
  ) => void;
};

type CertificateCardProps = {
  currentRequest: RequestProps;
  onMedical: () => void;
  onDone: (
    reqId: number,
    status: Status,
    request: RequestProps,
    certificateId: number
  ) => void;
};

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 1, action: "Consultation completed", patient: "Ana Cruz", time: "08:52 AM", type: "consultation" },
  { id: 2, action: "Lab result received", patient: "Jose Reyes", time: "08:40 AM", type: "lab" },
  { id: 3, action: "New patient registered", patient: "Xyryl Pedrosa", time: "08:15 AM", type: "registration" },
  { id: 4, action: "Lab request submitted", patient: "Cynthia Gomez", time: "Yesterday", type: "lab" },
  { id: 5, action: "Consultation completed", patient: "Danilo Torres", time: "Yesterday", type: "consultation" },
];

// STATUS CONFIG
const STATUS_META: Record<Status, { label: string; dot: string; text: string; bg: string, action_term: string }> = {
  "WAITING": { label: "Waiting", dot: "#f59e0b", text: "#92400e", bg: "#fffbeb", action_term: "asd" },
  "SERVING": { label: "In Progress", dot: "#0e7c7b", text: "#065050", bg: "#e0f4f4", action_term: "Accept" },
  "DONE": { label: "Done", dot: "#22c55e", text: "#166534", bg: "#f0fdf4", action_term: "Done" },
  "CANCELED": { label: "No-show", dot: "#94a3b8", text: "#475569", bg: "#f1f5f9", action_term: "Decline" },
};

const STAT_CONFIG = [
  { key: "totalPatients", label: "Total Patients", value: 1_284, delta: "+12 this week", icon: Users, color: "#0f2244", bg: "#eef1f9", bar: "#0f2244" },
  { key: "totalConsultationRequest", label: "Today's Consultations", value: 14, delta: "3 remaining", icon: CalendarCheck, color: "#0e7c7b", bg: "#e0f4f4", bar: "#0e7c7b" },
  { key: "totalPendingRequest", label: "Pending Consultation Requests", value: 7, delta: "2 urgent", icon: FlaskConical, color: "#c8102e", bg: "#fdf0f2", bar: "#c8102e" },
  { key: "totalNewPatient", label: "New Registrations", value: 28, delta: "+5 today", icon: UserPlus, color: "#7c4dab", bg: "#f3eefb", bar: "#7c4dab" },
];

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em]" style={{ color: "#8a99b8" }}>
      {children}
    </p>
  );
}

function Card({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.10), 0 8px 24px rgba(15,34,68,0.06)" }}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ borderBottom: "1px solid #f0f3fa" }}>
      {children}
    </div>
  );
}

function RequestCard({ currentRequest, currentPatient }: RequestCardProps) {
  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ background: "#f0f9f9", border: "1.5px solid #b0dede" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "#0e7c7b", color: "white" }}>
          {currentRequest.req_id}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>
            {currentPatient?.name}
          </p>
          <p className="text-[11px]" style={{ color: "#6b7da0" }}>
            {currentRequest.req_id} · {currentPatient?.age} {currentPatient?.sex}
          </p>
        </div>
      </div>

      <div className="rounded-lg px-3 py-2.5"
        style={{ background: "white", border: "1px solid #dce3ef" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
          style={{ color: "#8a99b8" }}>
          Applied for
        </p>
        <p className="text-[13px] font-semibold" style={{ color: "#1a2a45" }}>
          {currentRequest.req_type}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Clock size={11} style={{ color: "#8a99b8" }} />
        <span className="text-[11px]" style={{ color: "#8a99b8" }}>
          Scheduled at {currentRequest.req_date}
        </span>
      </div>
    </div>
  );
};

function ConsultationActions({ currentRequest, onConsult, onPresc, onDone }: ConsultationCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button onClick={onConsult} variant="consult"
        disabled={!!currentRequest?.consult?.consultation}>
        <Stethoscope size={13} /> Consult
      </Button>

      <Button
        variant="prescription"
        onClick={onPresc}
        disabled={!currentRequest?.consult?.consultation}
      >
        <ChevronRight size={10} /> Prescription
      </Button>

      <Button
        variant="doneStatus"
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
};

function CertificateActions({ currentRequest, onMedical, onDone }: CertificateCardProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        onClick={onMedical}
        variant="consult"
        disabled={!!currentRequest?.cert?.certificate}
      >
        <Stethoscope size={13} /> Certificate
      </Button>

      <Button
        variant="secondary"
        onClick={onMedical}
        disabled={!currentRequest?.cert?.certificate}
      >
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

//  MAIN PAGE
const Dashboard = () => {

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: requestList, isLoading: requestListLoading } = useGetAllRequest(debouncedSearch);
  const { mutateAsync: requestAction } = useRequestAction();
  const [addConsultationOpen, setAddConsultationOpen] = useState<boolean>(false);
  const [addAssesmentOpen, setAddAssesmentOpen] = useState<boolean>(false);
  const [addPrescriptionOpen, setAddPrescriptionOpen] = useState<boolean>(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });

  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);

  const { data: currentRequest, isLoading: currReqLoading } = useRequestData(currentRequestId!);

  const acceptedRequests = requestList?.filter((r) => r.status === "SERVING");

  const [selectedConsultationId, setSelectedConsultationId] = useState(() => {
    try {
      const stored = localStorage.getItem("consult_id");

      if (!stored || stored === "undefined") return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
      return null;
    }
  });

  const [selectedCertificateId, setSelectedCertificateId] = useState(() => {
    try {
      const stored = localStorage.getItem("cert_id");

      if (!stored || stored === "undefined") return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
      return null;
    }
  });

  const currentPatient = currentRequest?.patient;
  const waitingCount = requestList?.filter((r) => r.status === "WAITING").length;
  const doneCount = requestList?.filter((r) => r.status === "DONE").length;

  const { data: prevVitalSigns, isLoading: vitalsLoading } = useGetPrevVitalSigns(currentPatient?.patient_id);
  const { data: consultationRecords, isLoading: consultationLoading } = useConsultationRecords(currentPatient?.patient_id);
  const { data: statisticsRecords, isLoading: statisticsLoading } = useStatisticsRecords();

  const statsData = statisticsRecords;

  const STATS = STAT_CONFIG.map((item) => ({
    ...item,
    value: statsData?.[item.key as keyof typeof statsData] ?? 0,
    delta: "",
  }));

  useEffect(() => {
    const stored = localStorage.getItem("request_id");
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentRequestId(Number(stored));
    }
  }, []);

  const getStorageKey = (type: string) =>
    type === "CONSULTATION" ? "consult_id" : "cert_id";

  console.log('data_from_main', currentRequest)

  const handleRequestAction = async (request_id: number, status: Status, request: RequestProps, custom_id: number | undefined) => {
    const confirmed = await SweetAlert.confirmationAlert2(
      "Are you sure?",
      `You are about to ${STATUS_META[status].action_term} this request.`,
    );

    if (!confirmed) return;

    await requestAction({ request_id, status });

    const key = getStorageKey(request.req_type);

    if (status === "SERVING") {
      localStorage.setItem("request_id", String(request_id));
      localStorage.setItem(key, JSON.stringify(custom_id));
      if (key === 'cert_id') {
        setSelectedCertificateId(custom_id);
      } else {
        setSelectedConsultationId(custom_id);
      }

      setCurrentRequestId(request_id);
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

  return (
    <RoleGuard allowedRoles={["DOCTOR"]}>
      {addConsultationOpen && (
        <ModalHeader showModal={true} title="Patient Consultation Results" subtitle="Fill in the details below to register a patient" sizeModal="xlarge" onClose={() => setAddConsultationOpen(false)}>
          <PatientConsultationForm patient={currentPatient} vitals={prevVitalSigns ?? undefined} consult={consultationRecords ?? undefined} cons_id={selectedConsultationId} onClose={() => setAddConsultationOpen(false)} />
        </ModalHeader>
      )}

      {addPrescriptionOpen && (
        <ModalHeader showModal={true} title="Patient Prescription" subtitle="" sizeModal="xlarge" onClose={() => setAddPrescriptionOpen(false)}>
          <AddPrescriptionForm patient={currentPatient} consult_id={selectedConsultationId} onClose={() => setAddPrescriptionOpen(false)}></AddPrescriptionForm>
        </ModalHeader>
      )}

      {addAssesmentOpen && (
        <ModalHeader showModal={true} title="Patient Medical Certificate" subtitle="" sizeModal="xlarge" onClose={() => setAddAssesmentOpen(false)}>
          <AddMedicalCertificateForm mcrId={selectedCertificateId} patient={currentPatient} requestEntry={currentRequest?.cert} onClose={() => setAddAssesmentOpen(false)} />
        </ModalHeader>
      )}

      <div className="min-h-screen font-['DM_Sans'] relative"
        style={{ background: "linear-gradient(160deg, #f0f2f5 0%, #d1d8e4 50%, #a8b7ce 100%)" }}>
        <div className="relative z-10">

          <div className="px-8 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: "#c8102e", boxShadow: "0 4px 20px rgba(200,16,46,0.4)" }}>
                  {DOCTOR.initials}
                </div>
                <div>
                  <h1 className="text-black text-xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    <strong className="text-black/50">Good morning,</strong> {DOCTOR.name}
                  </h1>
                  <p className="text-[12px] mt-0.5 text-black/50">
                    {DOCTOR.title} &nbsp;·&nbsp; {dateStr} &nbsp;·&nbsp;
                    <span className="font-mono">{timeStr}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { label: "View Requests", href: "#pending", solid: false },
                  { label: "Patient Search", href: "/doctor/patients", solid: false },
                  { label: "Start Consult", href: "#queue", solid: true },
                ].map(({ label, href, solid }) => (
                  <Link key={label} href={href}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={solid
                      ? { background: "#c8102e", color: "white", boxShadow: "0 4px 14px rgba(200,16,46,0.4)" }
                      : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }
                    }>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-[95%] mx-auto px-6 py-8 space-y-7">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map(({ label, value, delta, icon: Icon, color, bg, bar }) => (
                <Card key={label}>
                  {/* Top accent line */}
                  <div className="h-[3px]" style={{ background: bar }} />
                  <div className="p-5">
                    <div className="flex justify-between">
                      <div className="w-15 h-15 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon size={30} style={{ color }} />
                      </div>
                      <p className="text-3xl font-bold leading-none"
                        style={{ color: "#0f2244", fontFamily: "'DM Serif Display', serif" }}>
                        {value.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-md font-bold mt-1.5" style={{ color: "#6b7da0" }}>{label}</p>
                    <p className="text-[10.5px] font-semibold mt-2" style={{ color }}>{delta}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* ── TODAY'S QUEUE ── */}
              <div className="xl:col-span-2 gap-5 space-y-5">
                <Card className="xl:col-span-2 h-[65%]" id="queue">
                  <CardHeader>
                    <div>
                      <CardLabel>Today&apos;s Queue</CardLabel>
                      <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                        <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>
                          {requestList?.length} patients
                        </p>
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#fffbeb", color: "#92400e" }}>
                          {waitingCount} waiting
                        </span>
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#f0fdf4", color: "#166534" }}>
                          {doneCount} done
                        </span>
                        {currentPatient && (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"
                            style={{ background: "#e0f4f4", color: "#065050" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c7b] animate-pulse" />
                            {currentPatient.name} in progress
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0bcd4" }} />
                      <input type="text" placeholder="Search patient…" value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 pr-3 py-2 text-xs rounded-xl outline-none transition"
                        style={{ background: "#f4f6fb", border: "1.5px solid #dce3ef", color: "#1a2a45", width: "170px" }} />
                    </div>
                  </CardHeader>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #eef1f9" }}>
                          {["#", "Patient", "Time", "Chief Complaint", "Status", "Actions", ""].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: "#8a99b8" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>

                        {requestList?.map((p, i) => {

                          const requestPatient = requestList[i].patient;
                          const requestInfo = requestList[i];

                          const getRelatedId = (requestInfo: RequestProps) => {
                            if (requestInfo.req_type === "CONSULTATION") {
                              return requestInfo.consult?.cons_id;
                            }

                            return requestInfo.cert?.mcr_id;
                          };

                          const handleAcceptRequest = (requestInfo: RequestProps) => {
                            const relatedId = getRelatedId(requestInfo);

                            if (!relatedId) {
                              console.error("Missing related ID");
                              return;
                            }

                            handleRequestAction(
                              requestInfo.req_id,
                              "SERVING",
                              requestInfo,
                              relatedId
                            );
                          };

                          return (
                            <tr key={p.req_id} className="group transition-all"
                              style={{
                                borderBottom: "1px solid #f4f6fb",
                                background: requestInfo.status === "serving" ? "rgba(14,124,123,0.04)" : "white",
                              }}
                            >
                              <td className="px-5 py-3.5">
                                <span className="text-[11px] font-mono" style={{ color: "#c0ccd8" }}>{i + 1}</span>
                              </td>

                              {/* Patient */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                                    style={{ background: "#eef1f9", color: "#0f2244" }}>
                                    {requestPatient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[13px]" style={{ color: "#1a2a45" }}>{requestPatient.name}</p>
                                    <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>
                                      {p.req_id} · {requestPatient.age}y {requestPatient.sex}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Time */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={11} style={{ color: "#c0ccd8" }} />
                                  <span className="text-[12px] font-medium" style={{ color: "#6b7da0" }}>{p.req_date}</span>
                                </div>
                              </td>

                              {/* Chief complaint */}
                              <td className="px-5 py-3.5">
                                <span className="text-[12px]" style={{ color: "#4a5568" }}>{p.req_type}</span>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3.5 text-black">
                                <StatusBadge status={requestInfo.status as Status} />
                              </td>

                              {/* Actions column */}
                              <td className="px-5 py-3.5">
                                {requestInfo.status?.toLocaleLowerCase() === "waiting" ? (
                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      variant="acceptRequest"
                                      className="!text-[10.5px] !px-2.5 !py-1 !rounded-lg !font-semibold"
                                      iconPosition="left"
                                      onClick={() => handleAcceptRequest(requestInfo)}
                                    >
                                      Accept
                                    </Button>
                                    <Button variant="declineRequest"
                                      className="!text-[10.5px] !px-2.5 !py-1 !rounded-lg !font-semibold"
                                      iconPosition="left"
                                      onClick={() => handleAcceptRequest(requestInfo)}>
                                      Decline
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-[11px]" style={{ color: "#c0ccd8" }}>—</span>
                                )}
                              </td>

                              {/* View link */}
                              <td className="px-5 py-3.5">
                                <Link href={`/doctor/patients/${p.req_id}`}
                                  className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: "#0f2244" }}>
                                  View <ChevronRight size={12} />
                                </Link>
                              </td>
                            </tr>
                          );
                        }
                        )}

                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-3 flex justify-end" style={{ borderTop: "1px solid #f0f3fa" }}>
                    <Link href="/doctor/patients"
                      className="flex items-center gap-1.5 text-[11.5px] font-semibold"
                      style={{ color: "#0f2244" }}>
                      View all patients <ArrowRight size={13} />
                    </Link>
                  </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[33%]">

                  {/* Weekly bar chart */}
                  <Card>
                    <div className="h-[3px]" style={{ background: "#0e7c7b" }} >
                      <CardHeader>
                        <div>
                          <CardLabel>Weekly Overview</CardLabel>
                          <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Consultations this week</p>
                        </div>
                        <Calendar size={14} style={{ color: "#b0bcd4" }} />
                      </CardHeader>
                      <div className="p-6">
                        <div className="grid grid-cols-7 gap-2">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                            const counts = [8, 11, 14, 6, 9, 3, 0];
                            const isToday = i === 2;
                            const pct = counts[i] / 15;
                            return (
                              <div key={day} className="flex flex-col items-center gap-2 ">
                                <span className="text-[10px] font-semibold"
                                  style={{ color: isToday ? "#0f2244" : "#b0bcd4" }}>
                                  {day}
                                </span>
                                <div className="w-full rounded-lg relative overflow-hidden"
                                  style={{ height: "120px", background: "#f4f6fb" }}>
                                  <div className="absolute bottom-0 left-0 right-0 rounded-lg"
                                    style={{
                                      height: `${pct * 100}%`,
                                      background: isToday
                                        ? "linear-gradient(to top, #c8102e, #e8405a)"
                                        : "linear-gradient(to top, #1a3560, #3a5a90)",
                                      opacity: counts[i] === 0 ? 0.2 : 1,
                                    }} />
                                </div>
                                <span className="text-[10px] font-semibold tabular-nums"
                                  style={{ color: isToday ? "#c8102e" : "#8a99b8" }}>
                                  {counts[i]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[11px] mt-4" style={{ color: "#8a99b8" }}>
                          Total this week:{" "}
                          <strong style={{ color: "#0f2244" }}>51 consultations</strong>
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Quick navigation */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardLabel>Navigate</CardLabel>
                        <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Quick Access</p>
                      </div>
                    </CardHeader>
                    <div className="p-5 grid grid-cols-2 gap-3">
                      {[
                        { label: "All Patients", desc: "Browse registry", icon: Users, href: "/doctor/patients", color: "#0f2244", bg: "#eef1f9" },
                        { label: "Consultations", desc: "View history", icon: Stethoscope, href: "/doctor/consultation", color: "#0e7c7b", bg: "#e0f4f4" },
                        { label: "Lab Requests", desc: "Manage tests", icon: FlaskConical, href: "#pending", color: "#7c4dab", bg: "#f3eefb" },
                        { label: "New Registration", desc: "Add patient", icon: UserPlus, href: "/doctor/patients/new", color: "#c8102e", bg: "#fdf0f2" },
                      ].map(({ label, desc, icon: Icon, href, color, bg }) => (
                        <Link key={label} href={href}
                          className="flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                          style={{ border: "1.5px solid #eef1f9" }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: bg }}>
                            <Icon size={16} style={{ color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold leading-tight" style={{ color: "#1a2a45" }}>{label}</p>
                            <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{desc}</p>
                          </div>
                          <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color }} />
                        </Link>
                      ))}
                    </div>
                  </Card>
                </div>

              </div>

              <div className="flex flex-col gap-5">
                <Card id="pending">
                  <div className="h-[3px]" style={{ background: "#0e7c7b" }} />

                  <CardHeader>
                    <div>
                      <CardLabel>Now Serving</CardLabel>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Current Patient</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                      style={{ background: "#e0f4f4", color: "#065050", border: "1px solid rgba(14,124,123,0.2)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0e7c7b] animate-pulse" />
                      Live
                    </span>
                  </CardHeader>


                  {currentRequest ? (

                    <div className="p-5">
                      <RequestCard
                        currentRequest={currentRequest}
                        currentPatient={currentPatient!}
                      />

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
                    <div className="p-8 flex flex-col items-center text-center">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: "#f0f3fa" }}
                      >
                        <Stethoscope size={20} style={{ color: "#c0ccd8" }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: "#8a99b8" }}>
                        No active consultation
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: "#b0bcd4" }}>
                        Accept a patient to begin
                      </p>
                    </div>
                  )}
                </Card>

                {/* ── PENDING REQUESTS ── */}
                <Card>
                  <div className="h-[3px]" style={{ background: "#065050" }} />
                  <CardHeader>
                    <div>
                      <CardLabel>Pending Requests</CardLabel>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-semibold text-sm" style={{ color: "#0f2244" }}>{acceptedRequests?.length} open</p>
                        <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#c5e9e9", color: "#065050" }}>
                          {acceptedRequests?.filter((r) => r.status === 'SERVING')?.length ?? 0} On Going
                        </span>
                      </div>
                    </div>
                    <AlertCircle size={15} style={{ color: "#065050" }} />
                  </CardHeader>

                  <div>
                    {acceptedRequests?.length ? (
                      acceptedRequests.map((r, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (r.req_type === "CONSULTATION") {
                              handleActiveConsult(r, r.consult?.cons_id);
                            } else {
                              handleActiveMedical(r, r.cert?.mcr_id);
                            }
                          }}
                          className={`px-5 py-3.5 flex items-center gap-3 cursor-pointer transition-colors group ${currentRequest && r.req_id === currentRequest?.req_id
                            ? "!bg-blue-900/15"
                            : "bg-white"
                            }`}
                          style={{
                            borderBottom:
                              i < acceptedRequests.length - 1 ? "1px solid #f4f6fb" : "none",
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "#eef1f9", color: "#0f2244" }}
                          >
                            {r.req_type === "LABORATORY" ? (
                              <TestTube2 size={13} />
                            ) : (
                              <Stethoscope size={13} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-1.5">
                              <p
                                className="font-semibold text-[12.5px] truncate"
                                style={{ color: "#1a2a45" }}
                              >
                                {r.patient.name}
                              </p>

                              {r.status === "SERVING" && (
                                <span
                                  className="text-[8.5px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                >
                                  <StatusBadge status={r.status as Status} />
                                  {r.status}
                                </span>
                              )}
                            </div>

                            <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>
                              {/* {r.request.request_code} */}
                            </p>

                            <p className="text-[10px]" style={{ color: "#b0bcd4" }}>
                              requested
                            </p>
                          </div>

                          <ChevronRight
                            size={13}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: "#6b7da0" }}
                          />
                        </div>
                      ))
                    ) : (
                      <div key={1} className="px-5 py-10 text-center">
                        <div className="text-gray-400 text-sm font-medium">
                          No on going requests
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          You’re all caught up 🎉
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid #f0f3fa" }}>
                    <button className="w-full flex items-center justify-center gap-1.5 text-[11.5px] font-semibold py-3 transition-colors hover:bg-[#f8f9fc]"
                      style={{ color: "#6b7da0" }}>
                      View all on going requests <ArrowRight size={12} />
                    </button>
                  </div>
                </Card>

                {/* ── RECENT ACTIVITY ── */}
                <Card>
                  <CardHeader>
                    <div>
                      <CardLabel>Recent Activity</CardLabel>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "#0f2244" }}>Latest updates</p>
                    </div>
                    <Activity size={14} style={{ color: "#b0bcd4" }} />
                  </CardHeader>
                  <div className="px-5 py-2">
                    {RECENT_ACTIVITY.map((a) => {
                      const cfg =
                        a.type === "consultation" ? { Icon: CheckCircle2, color: "#0e7c7b", bg: "#e0f4f4" } :
                          a.type === "lab" ? { Icon: TestTube2, color: "#7c4dab", bg: "#f3eefb" } :
                            { Icon: UserPlus, color: "#0f2244", bg: "#eef1f9" };
                      return (
                        <div key={a.id} className="flex items-center gap-3 py-2.5"
                          style={{ borderBottom: "1px solid #f4f6fb" }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: cfg.bg }}>
                            <cfg.Icon size={13} style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate" style={{ color: "#1a2a45" }}>{a.action}</p>
                            <p className="text-[10.5px]" style={{ color: "#8a99b8" }}>{a.patient}</p>
                          </div>
                          <span className="text-[10px] font-medium flex-shrink-0" style={{ color: "#b0bcd4" }}>{a.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div >
      </div >
    </RoleGuard >
  );
};

export default Dashboard;