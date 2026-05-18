import Image from "next/image";
import {
  BillingReceiptPreviewPayload,
  BillingBreakdownItem,
} from "@/types/BillingTypes";

type Props = {
  receipt: BillingReceiptPreviewPayload;
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const formatCurrency = (amount: number) => pesoFormatter.format(amount);

const formatTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatPrintableDate = (
  value?: string | null,
  options: { includeTime?: boolean } = {}
) => {
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

  if (!options.includeTime) {
    return parsedDate.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return parsedDate.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

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

function SummaryRow({
  label,
  value,
  emphasis = false,
  negative = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${emphasis ? "text-[13px]" : "text-[12px]"}`}>
      <span className={emphasis ? "font-semibold text-slate-700" : "text-slate-500"}>{label}</span>
      <span
        className={
          emphasis
            ? "font-semibold text-slate-800"
            : negative
              ? "font-medium text-rose-600"
              : "font-medium text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

function getReceiptBreakdown(
  receipt: BillingReceiptPreviewPayload
): BillingBreakdownItem[] {
  if (receipt.breakdown.length > 0) {
    return receipt.breakdown;
  }

  return [
    {
      lineId: `${receipt.billingCode}-summary`,
      label: `${formatTitleCase(receipt.requestType)} billing services`,
      quantity: 1,
      unitPrice: receipt.subtotal,
      totalPrice: receipt.subtotal,
      source: "service",
    },
  ];
}

export default function BillingReceiptDocument({ receipt }: Props) {
  const breakdown = getReceiptBreakdown(receipt);
  const totalDue = Math.max(receipt.subtotal - receipt.discount, 0);

  return (
    <div className="mx-auto w-full max-w-[6.8in] rounded-[20px] bg-white p-5 text-sm shadow-xl">
      <header className="border-b border-slate-300 pb-4">
        <div className="grid items-center gap-4 sm:grid-cols-[3.5rem_1fr_10rem]">
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
          <div className="min-w-0 text-center sm:text-left">
            <h1 className="text-[17px] font-bold uppercase leading-tight text-blue-800">
              SERVIAMUS MEDICAL CLINIC AND LABORATORY, INC.
            </h1>
            <p className="text-[10px] text-slate-500">
              Puer Sanctus VI Building, Corner Rosario-Verbena Streets, Brgy. 33, Bacolod City
            </p>
            <p className="text-[10px] text-slate-500">Mobile No. (034) 4746678</p>
          </div>
          <div className="rounded-2xl border border-slate-300 px-4 py-3 text-center sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0e7c7b]">
              Billing Summary
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Bill Code
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{receipt.billingCode}</p>
          </div>
        </div>
      </header>

      <section className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Billing Details
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <DetailField label="Patient Name" value={receipt.patientName} />
            <DetailField label="Patient ID" value={receipt.patientCode} />
            <DetailField label="Request Type" value={formatTitleCase(receipt.requestType)} />
            <DetailField label="Requested By" value={receipt.requestedBy || "Clinic"} />
            <DetailField label="Request Date" value={formatPrintableDate(receipt.requestedDate)} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Payment Details
          </p>
          <div className="mt-3 grid gap-3">
            <DetailField
              label="Paid On"
              value={formatPrintableDate(receipt.paidAt, { includeTime: true })}
            />
            <DetailField label="Method" value={formatTitleCase(receipt.paymentMethod)} />
            <DetailField label="Reference No." value={receipt.referenceNo || "N/A"} />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold tracking-[0.22em] text-slate-600">
          BILLING BREAKDOWN
        </h3>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-[12px] text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3">Description</th>
                <th className="w-20 px-4 py-3 text-center">Qty</th>
                <th className="w-28 px-4 py-3 text-right">Unit Price</th>
                <th className="w-28 px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((lineItem) => (
                <tr key={lineItem.lineId} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{lineItem.label}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      {lineItem.source === "lab-test" ? "Laboratory Test" : "Service Item"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">{lineItem.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(lineItem.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatCurrency(lineItem.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[12px] leading-5 text-slate-600">
          This summary reflects the billing details currently recorded for the selected request.
          Use this preview to review the final amount and posted payment details.
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="space-y-2">
            <SummaryRow label="Subtotal" value={formatCurrency(receipt.subtotal)} />
            {receipt.discount > 0 ? (
              <SummaryRow
                label="Discount"
                value={`-${formatCurrency(receipt.discount)}`}
                negative
              />
            ) : null}
            <div className="border-t border-slate-200 pt-2">
              <SummaryRow label="Total Due" value={formatCurrency(totalDue)} emphasis />
            </div>
            <div className="border-t border-slate-200 pt-2">
              <SummaryRow label="Amount Paid" value={formatCurrency(receipt.amountPaid)} emphasis />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
