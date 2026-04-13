"use client";

import { ReactNode, useState } from "react";
import { z } from "zod";
import { patientConsultationSchema } from "@/schemas/consultation.schema";
import { useForm, UseFormReturn, Path, UseFormRegister, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConsultaion } from "@/hooks/Consultation/useConsultation";
import { PatientProps } from "@/types/PatientTypes";
import Button from "@/components/ui/Button";
import { VitalSignProps } from "@/types/RequestTypes"
import { ConsultaionResultProps } from "@/types/ConsultationTypes";

type RegisterConsultationFormValues = z.infer<typeof patientConsultationSchema>;
type StepProps = { form: UseFormReturn<RegisterConsultationFormValues>; }

const STEPS = [
  { label: "Personal", sub: "Information" },
  { label: "Vital Signs &", sub: "History" },
  { label: "Medical", sub: "Records" },
  { label: "Assesment", sub: "Results" },
];

type CheckItemProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
};

const inputCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white";

const labelCls =
  "text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0]";

function FormGroup({ label, children, span2 = false }: { label: string, children: ReactNode, span2?: boolean }) {
  return (
    <div className={`relative ${span2 ? "col-span-2" : ""}`}>
      <label className={labelCls}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CheckItem<T extends FieldValues>({ label, name, register }: CheckItemProps<T>) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <input type="checkbox"
        className="w-4 h-4 accent-[#0f2244] cursor-pointer"
        {...register(name)} />
      <label htmlFor={name} className="text-sm text-[#1a2a45] cursor-pointer font-normal normal-case tracking-normal">
        {label}
      </label>
    </div>
  );
}

function MedBox({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="border border-[1.5px] border-[#dce3ef] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#0f2244] mb-3 pb-2 border-b border-[#dce3ef]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function VitalsRow({ label, teal = false, form }: { label: string, teal?: boolean, form: StepProps["form"] }) {
  const { register } = form;
  const fields = [
    { name: "bp", label: "BP (mmHg)", ph: "120/80" },
    { name: "temp", label: "Temp (°C)", ph: "36.6" },
    { name: "cr", label: "Pulse (bpm)", ph: "72" },
    { name: "rr", label: "RR (/min)", ph: "16" },
    { name: "wt", label: "Weight (kg)", ph: "60" },
    { name: "ht", label: "Height (cm)", ph: "165" },
  ];
  return (
    <div className="mb-5">
      <h4
        className={`text-[11px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-2 ${teal ? "text-[#0e7c7b]" : "text-[#6b7da0]"
          }`}
      >
        {label}
        <span className="flex-1 h-px bg-[#dce3ef]" />
      </h4>
      <div className="grid grid-cols-6 gap-2">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7da0] mb-1">
              {f.name}
            </label>
            <input
              type="text"
              {...register(`${f.name}` as Path<RegisterConsultationFormValues>)}
              placeholder={f.ph}
              className={`w-full text-center text-sm rounded-md px-2 py-2 border outline-none transition ${teal
                ? "bg-[#e0f4f4] border-[#b0dede] focus:border-[#0e7c7b] focus:shadow-[0_0_0_3px_rgba(14,124,123,0.1)] focus:bg-white"
                : "bg-[#f0f3fa] border-[#dce3ef] focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white"
                } text-[#1a2a45]`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step Panels ────────────────────────────────────────────────────────────

function Step1({ form }: StepProps) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Personal Information</h2>
      <p className="text-sm text-[#6b7da0] mt-1 mb-6">Basic patient details and demographics</p>

      <div className="grid grid-cols-2 gap-x-7 gap-y-4">
        <FormGroup label="Full Name">
          <input type="text" placeholder="e.g. Maria Santos" className={`${inputCls} ${errors.name
            ? "border border-red-500"
            : "border border-[1.5px] border-[#dce3ef]"
            }`} {...register("name")} readOnly />
          {errors.name && (
            <p className="absolute left-0 top-full mt-1 text-red-900 text-xs">
              {errors.name.message as string}
            </p>
          )}
        </FormGroup>
        <FormGroup label="Date of Consultation">
          <input type="date" className={`${inputCls}`} {...register("consultation_date")} />
          {errors.consultation_date && (
            <p>{errors.consultation_date.message as string}</p>
          )}
        </FormGroup>
        <FormGroup label="Address">
          <input type="text" placeholder="Street, City, Province" className={inputCls} {...register("address")} />
          {errors.address && (
            <p>{errors.address.message as string}</p>
          )}
        </FormGroup>
        <FormGroup label="Contact Number">
          <input type="tel" placeholder="+63 9XX XXX XXXX" className={inputCls} {...register("contact_number")} />
        </FormGroup>
        <FormGroup label="Date of Birth">
          <input type="date" className={inputCls} {...register("birth_date")} />
        </FormGroup>
        <FormGroup label="Sex">
          <select className={inputCls} {...register("sex")}>
            <option value="">— Select —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </FormGroup>
        <FormGroup label="Age">
          <input type="text" placeholder="Years" className={inputCls} {...register("age")} />
        </FormGroup>
        <FormGroup label="Religion">
          <input type="text" placeholder="e.g. Roman Catholic" className={inputCls} {...register("religion")} />
        </FormGroup>
        <FormGroup label="Chief Complaint" span2>
          <textarea
            rows={3}
            placeholder="Describe the patient's primary reason for consultation…"
            className={`${inputCls} resize-y`} {...register("chief_complaint")}
          />
          {errors.chief_complaint && (
            <p>{errors.chief_complaint.message as string}</p>
          )}
        </FormGroup>
      </div>
    </>
  );
}

function Step2({ form }: StepProps) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Vital Signs & History</h2>
      <p className="text-sm text-[#6b7da0] mt-1 mb-6">Current and previous measurements with clinical notes</p>

      <VitalsRow label="Vitals Record" form={form} teal />

      <div className="mt-2">
        <label className={labelCls}>History of Present Illness</label>
        <textarea
          rows={5}
          placeholder="Describe onset, duration, character, associated symptoms, relieving/aggravating factors…"
          className={`${inputCls} mt-1 resize-y`}
          {...register("hist_illness")}
        />
        {errors.hist_illness && (
          <p>{errors.hist_illness.message as string}</p>
        )}
      </div>
    </>
  );
}

function Step3({ form }: StepProps) {
  const { register, formState: { errors } } = form
  const ob_history = [
    { name: "menarche", label: "Menarche", ph: "Age" },
    { name: "interval", label: "Interval", ph: "Days" },
    { name: "duration", label: "Duration", ph: "Days" },
    { name: "amount", label: "Amount", ph: "Pads/day" },
  ];

  const personal_history = [
    { name: "travel_history", label: "Travel History", ph: "Recent travel destinations" },
    { name: "diet", label: "Diet", ph: "e.g. Regular, Low-sodium" },
    { name: "stress", label: "Stress / Coping Mechanism", ph: "e.g. Exercise, Meditation" },
    { name: "occupation", label: "Occupation", ph: "Current occupation" },
  ];

  return (
    <>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Medical Health Record</h2>
      <p className="text-sm text-[#6b7da0] mt-1 mb-6">
        Past history, family background, and obstetric-gynecological information
      </p>

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <MedBox title="Past Medical History">
          <CheckItem name="pmh_allergy" label="Food & Drug Allergy (FDA)" register={register} />
          <CheckItem name="pmh_admission" label="Previous Admission" register={register} />
          <CheckItem name="pmh_others" label="Others" register={register} />
          <div className="flex items-center gap-2 pl-6 mt-1">
            <input type="text" placeholder="Please specify…" className={`${inputCls} flex-1`} {...register("pmh_others_text")} />
            <span className="text-[11px] text-[#6b7da0] whitespace-nowrap">specify</span>
          </div>
        </MedBox>

        <MedBox title="Family History">
          <CheckItem name="fh_htn" label="Hypertension" register={register} />
          <CheckItem name="fh_dm" label="Diabetes Mellitus (DM)" register={register} />
          <CheckItem name="fh_ba" label="Bronchial Asthma (BA)" register={register} />
          <CheckItem name="fh_cancer" label="Cancer" register={register} />
          <CheckItem name="fh_others" label="Others" register={register} />
          <div className="flex items-center gap-2 pl-6 mt-1">
            <input type="text" placeholder="Please specify…" className={`${inputCls} flex-1`} {...register("fh_others_text")} />
            <span className="text-[11px] text-[#6b7da0] whitespace-nowrap">specify</span>
          </div>
          {errors.fh_others_text && (
            <p>{errors.fh_others_text.message as string}</p>
          )}
        </MedBox>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        <MedBox title="OB-Gyne History">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[#0f2244]">G P</span>
            <input type="text" placeholder="e.g. G2P1" className={`${inputCls} max-w-[100px]`} {...register("ob_score")} />
          </div>
          <CheckItem name="ob_nvsd" label="Normal Vaginal Spontaneous Delivery (NVSD)" register={register} />
          <CheckItem name="ob_cs" label="Caesarean Section (CS)" register={register} />
          <hr className="my-3 border-[#dce3ef]" />
          <div className="grid grid-cols-2 gap-2">
            {ob_history.map((f) => (
              <div key={f.name}>
                <label className={labelCls}>{f.label}</label>
                <input type="text" placeholder={f.ph} className={`${inputCls} mt-1`}
                  {...register(`${f.name}` as Path<RegisterConsultationFormValues>)} />
              </div>
            ))}
            <div className="col-span-2">
              <label className={labelCls}>Symptoms</label>
              <input type="text" placeholder="Describe any symptoms" className={`${inputCls} mt-1`}
                {...register("ob_symptoms")} />
            </div>
          </div>
        </MedBox>

        <MedBox title="Personal & Social History">
          <CheckItem name="cigarette_use" label="Cigarette use :" register={register} />
          <CheckItem name="alcohol_use" label="Alcohol Beverage use :" register={register} />
          <CheckItem name="drug_use" label="Illicit Drug use :" register={register} />
          <CheckItem name="exercise" label="Exercise :" register={register} />
          <CheckItem name="hygiene_prac" label="Good Hygiene Practice :" register={register} />
          <CheckItem name="coffee_cons" label="Coffee consumption :" register={register} />
          <CheckItem name="soda_cons" label="Soda consumption :" register={register} />
          <hr className="my-3 border-[#dce3ef]" />
          <div className="space-y-3">
            {personal_history.map((ph) => (
              <div key={ph.name}>
                <label className={labelCls}>{ph.label}</label>
                <input type="text" placeholder={ph.ph} className={`${inputCls} mt-1`}
                  {...register(`${ph.name}` as Path<RegisterConsultationFormValues>)} />
              </div>
            ))}
          </div>
        </MedBox>
      </div>
    </>
  );
}

function Step4({ form }: StepProps) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <h2 className="font-['DM_Serif_Display'] text-2xl text-[#0f2244]">Examination & Assesment</h2>
      <p className="text-sm text-[#6b7da0] mt-1 mb-6"></p>

      <div className="mt-2">
        <label className={labelCls}>Physical & Neurologic Examination:</label>
        <textarea
          rows={5}
          placeholder="Describe onset, duration, character, associated symptoms, relieving/aggravating factors…"
          className={`${inputCls} mt-1 resize-y`}
          {...register("examination")}
        />
        {errors.examination && (
          <p>{errors.examination.message as string}</p>
        )}
      </div>

      <div className="mt-2">
        <label className={labelCls}>Assesment:</label>
        <textarea
          rows={5}
          placeholder="Describe onset, duration, character, associated symptoms, relieving/aggravating factors…"
          className={`${inputCls} mt-1 resize-y`}
          {...register("assesment")}
        />
        {errors.assesment && (
          <p>{errors.assesment.message as string}</p>
        )}
      </div>

      <div className="mt-2 mb-2">
        <label className={labelCls}>Plans:</label>
        <textarea
          rows={5}
          placeholder="Describe onset, duration, character, associated symptoms, relieving/aggravating factors…"
          className={`${inputCls} mt-1 resize-y`}
          {...register("plans")}
        />
        {errors.plans && (
          <p>{errors.plans.message as string}</p>
        )}
      </div>

      <FormGroup label="Follow-up Date">
        <input type="date" className={`${inputCls} !w-[50%]`} {...register("follow_up_date")} />
        {errors.follow_up_date && (
          <p>{errors.follow_up_date.message as string}</p>
        )}
      </FormGroup>
    </>
  );
}
// ─── Main Component ──────────────────────────────────────────────────────────

const PatientConsultationForm: React.FC<{ patient: PatientProps | undefined, vitals: VitalSignProps | undefined, consult: ConsultaionResultProps | undefined, onClose: () => void }> = ({ patient, vitals, consult, onClose }) => {
  const [step, setStep] = useState(1);
  const { mutateAsync: consultationResult, isPending } = useConsultaion(onClose);

  const form = useForm<RegisterConsultationFormValues>({
    resolver: zodResolver(patientConsultationSchema),
    mode: "onSubmit",
    defaultValues: {
      name: patient?.name,
      contact_number: patient?.contact_number ?? "",
      address: patient?.address,
      birth_date: patient?.birth_date
        ? new Date(patient.birth_date).toISOString().split("T")[0]
        : "",
      sex: patient?.sex?.toLowerCase() === "female" ? "female" : "male",
      age: patient?.age?.toLocaleString(),
      religion: patient?.religion,

      chief_complaint: consult?.chief_complaint,
      hist_illness: consult?.hist_illness,
      consultation_date: new Date().toISOString().split('T')[0],

      cr: vitals?.cr,
      bp: vitals?.bp,
      temp: vitals?.temp,
      rr: vitals?.rr,
      ht: vitals?.ht,
      wt: vitals?.ht,

      pmh_allergy: consult?.pmh_allergy,
      pmh_admission: consult?.pmh_admission,
      pmh_others: consult?.pmh_others,
      pmh_others_text: consult?.pmh_others_text,
      fh_htn: consult?.fh_dm,
      fh_dm: consult?.fh_ba,
      fh_ba: consult?.fh_cancer,
      fh_cancer: consult?.fh_cancer,
      fh_others: consult?.fh_cancer,
      fh_others_text: consult?.fh_others_text,
      ob_score: consult?.ob_score,
      ob_nvsd: consult?.ob_nvsd,
      ob_cs: consult?.ob_cs,

      menarche: consult?.menarche,
      interval: consult?.interval,
      duration: consult?.duration,
      amount: consult?.amount,
      ob_symptoms: consult?.ob_symptoms,

      cigarette_use: consult?.cigarette_use,
      alcohol_use: consult?.alcohol_use,
      drug_use: consult?.drug_use,
      exercise: consult?.exercise,
      hygiene_prac: consult?.hygiene_prac,
      coffee_cons: consult?.coffee_cons,
      soda_cons: consult?.soda_cons,

      sh_allergy: consult?.cigarette_use,
      sh_admission: consult?.sh_admission,

      travel_history: consult?.travel_history,
      diet: consult?.amount,
      stress: consult?.amount,
      occupation: consult?.amount,

      examination: consult?.examination,
      assesment: consult?.assesment,
      plans: consult?.plans,
      follow_up_date: consult?.follow_up_date ? new Date(consult?.follow_up_date).toISOString().split("T")[0] : "",

    },
  });

  const { handleSubmit } = form;

  const panels = [
    <Step1 key="step1" form={form} />,
    <Step2 key="step2" form={form} />,
    <Step3 key="step3" form={form} />,
    <Step4 key="step4" form={form} />,
  ];

  function mapToPrisma(data: RegisterConsultationFormValues) {
    return {
      // ─── STEP 1 ─────────────────────────
      consultation_id: 0,
      patient_id: patient?.patient_id,
      full_name: data.name,
      consultation_date: new Date(data.consultation_date),
      address: data.address,
      contact_number: data.contact_number,
      birth_date: new Date(data.birth_date),
      sex: data.sex,
      age: Number(data.age),

      religion: data.religion,
      chief_complaint: data.chief_complaint,

      // ─── STEP 2 ─────────────────────────
      hist_illness: data.hist_illness,
      bp: data.bp,
      temp: data.temp,
      cr: data.cr,
      rr: data.rr,
      wt: data.wt,
      ht: data.ht,

      // ─── STEP 3: PMH ────────────────────
      pmh_allergy: data.pmh_allergy,
      pmh_admission: data.pmh_admission,
      pmh_others: data.pmh_others,
      pmh_others_text: data.pmh_others_text,

      // ─── FAMILY HISTORY ─────────────────
      fh_htn: data.fh_htn,
      fh_dm: data.fh_dm,
      fh_ba: data.fh_ba,
      fh_cancer: data.fh_cancer,
      fh_others: data.fh_others,
      fh_others_text: data.fh_others_text,

      // ─── OB-GYNE ───────────────────────
      ob_score: data.ob_score,
      ob_nvsd: data.ob_nvsd,
      ob_cs: data.ob_cs,

      menarche: data.menarche,
      interval: data.interval,
      duration: data.duration,
      amount: data.amount,
      ob_symptoms: data.ob_symptoms,

      // ─── PERSONAL HISTORY ──────────────
      cigarette_use: data.cigarette_use,
      alcohol_use: data.alcohol_use,
      drug_use: data.drug_use,
      exercise: data.exercise,
      hygiene_prac: data.hygiene_prac,
      coffee_cons: data.coffee_cons,
      soda_cons: data.soda_cons,

      // ─── SOCIAL HISTORY ────────────────
      sh_allergy: data.sh_allergy,
      sh_admission: data.sh_admission,

      travel_history: data.travel_history,
      diet: data.diet,
      stress: data.stress,
      occupation: data.occupation,

      examination: data.examination,
      assesment: data.assesment,
      plans: data.plans,
      follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : undefined,
    };
  }

  const onSubmit = async (data: RegisterConsultationFormValues) => {
    // console.log("SUBMIT DATA:", data);
    await consultationResult(mapToPrisma(data));
  };

  const onError = (errors: unknown) => {
    console.log("FORM ERRORS:", errors);
  };


  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="w-full"
        noValidate
      >
        <div className="bg-white rounded-2xl w-full overflow-y-none h-[80vh]">
          {/* Step Indicator */}
          <div className="bg-[#f7f8fc] border-b border-[#dce3ef] px-10 flex">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isActive = step === n;
              const isDone = step > n;
              return (
                <div
                  key={n}
                  className={`flex-1 flex items-center gap-2.5 py-4 relative ${i < STEPS.length - 1
                    ? "after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-px after:h-7 after:bg-[#dce3ef]"
                    : ""
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 flex-shrink-0 transition-all duration-300 ${isActive
                      ? "bg-[#c8102e] border-[#c8102e] text-white"
                      : isDone
                        ? "bg-[#0e7c7b] border-[#0e7c7b] text-white"
                        : "bg-white border-[#dce3ef] text-[#6b7da0]"
                      }`}
                  >
                    {isDone ? "✓" : n}
                  </div>
                  <div className="leading-tight">
                    <div
                      className={`text-[11.5px] font-${isActive ? "600" : "500"} ${isActive ? "text-[#1a2a45]" : isDone ? "text-[#0e7c7b]" : "text-[#6b7da0]"
                        }`}
                    >
                      {s.label}
                    </div>
                    <div
                      className={`text-[11.5px] font-${isActive ? "600" : "500"} ${isActive ? "text-[#1a2a45]" : isDone ? "text-[#0e7c7b]" : "text-[#6b7da0]"
                        }`}
                    >
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Body */}

          <div className="px-10 py-9 min-h-[440px]">{panels[step - 1]}</div>

          {/* Footer */}
          <div className="border-t border-[#dce3ef] bg-[#f7f8fc] px-10 py-5 flex items-center justify-between">
            <span className="text-xs text-[#6b7da0]">Step {step} of {STEPS.length}</span>
            <div className="flex gap-2.5">
              <Button variant="danger" type="button" onClick={onClose}>
                Cancel
              </Button>
              {step > 1 && (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setStep(step - 1)}
                >
                  ← Previous
                </Button>
              )}
              {step < STEPS.length && (

                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setStep(step + 1)}
                >
                  Next →
                </Button>
              )}
              {step === STEPS.length && (
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isPending}
                >
                  Submit ✓
                </Button>
              )}
            </div>
          </div>

        </div>
      </form>
    </>

  );
};

export default PatientConsultationForm;