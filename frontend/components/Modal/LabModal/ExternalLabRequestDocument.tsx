import Image from "next/image";
import { PrintableLabRequestPayload } from "@/types/RequestTypes";

type Props = {
  request: PrintableLabRequestPayload;
};

function formatPrintableDate(value: string) {
  if (!value) {
    return "__________________";
  }

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    return parsedDate.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-[12px] leading-5 text-slate-700">
        {value || "__________________"}
      </p>
    </div>
  );
}

function SignatureBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="border-b border-slate-400 pb-1 text-sm font-medium text-slate-700">
        {value}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default function ExternalLabRequestDocument({ request }: Props) {
  return (
    <div className="mx-auto w-full max-w-[8in] rounded-[20px] bg-white p-5 text-sm shadow-xl print:max-w-none print:rounded-none print:p-4 print:shadow-none">
      <header className="border-b border-slate-300 pb-3">
        <div className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-4">
          <div className="flex justify-center">
            <Image
              src="/images/serviamus.jpeg"
              alt="Serviamus logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="min-w-0 text-center">
            <h1 className="text-[17px] font-bold uppercase leading-tight text-blue-800">
              SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
            </h1>
            <p className="text-[10px] text-slate-500">
              Puer Sanctus VI Building, Corner Rosario-Verbena Streets, Brgy. 33, Bacolod City
            </p>
            <p className="text-[10px] text-slate-500">
              Mobile No. (034) 4746678
            </p>
          </div>
          <div aria-hidden="true" className="h-14 w-14" />
        </div>
        <h2 className="mt-3 text-center text-sm font-semibold tracking-[0.28em] text-[#0e7c7b]">
          EXTERNAL LABORATORY REQUEST
        </h2>
      </header>

      <section className="mt-4 space-y-3 [break-inside:avoid]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DetailField label="Patient Code" value={request.patientCode} />
          <DetailField label="Patient Name" value={request.patientName} />
          <DetailField label="Request Date" value={formatPrintableDate(request.requestDate)} />
          <DetailField label="Age" value={request.age} />
          <DetailField label="Sex" value={request.sex ?? ""} />
          <DetailField label="Requested By" value={request.requestedBy} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <DetailField label="Address" value={request.address} />
        </div>
      </section>

      <section className="mt-4 [break-inside:avoid]">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold tracking-[0.22em] text-slate-600">
          REQUESTED TESTS
        </h3>
        <div className="mt-5 ">
          <ul className="grid gap-2 sm:grid-cols-2">
            {request.tests.map((test) => (
              <li key={test} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 " />
                <span>{test}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* <section className="mt-4 [break-inside:avoid]">
        <div className="rounded-2xl border border-[#d8e7e3] bg-[#f4faf8] px-4 py-3 text-xs leading-5 text-[#40665f]">
          This request is intended for external laboratory processing only and does not create an
          internal Serviamus laboratory workflow record.
        </div>
      </section> */}

      <footer className="mt-8 grid gap-6 border-t border-slate-200 pt-6 text-[10px] sm:grid-cols-2">
        <SignatureBlock label="Requested By" value={request.requestedBy || "__________________"} />
        <SignatureBlock label="Patient / Representative" value="__________________" />
      </footer>
    </div>
  );
}
