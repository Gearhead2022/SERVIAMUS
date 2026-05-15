import Image from "next/image";
import {
  BillingBreakdownItem,
  PrintableBillingReceiptPayload,
} from "@/types/BillingTypes";

type Props = {
  receipt: PrintableBillingReceiptPayload;
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
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function ReceiptField({
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

function getReceiptBreakdown(
  receipt: PrintableBillingReceiptPayload
): BillingBreakdownItem[] {
  if (receipt.breakdown.length > 0) {
    return receipt.breakdown;
  }

  return [
    {
      lineId: `${receipt.billingCode}-summary`,
      label: `${receipt.requestType} billing services`,
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
    <div className="mx-auto w-full max-w-[7.4in] rounded-[20px] bg-white p-5 text-sm shadow-xl print:max-w-none print:rounded-none print:p-4 print:shadow-none">
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
            <p className="text-[10px] text-slate-500">Mobile No. (034) 4746678</p>
          </div>
          <div aria-hidden="true" className="h-14 w-14" />
        </div>
        <h2 className="mt-3 text-center text-sm font-semibold tracking-[0.28em] text-[#0e7c7b]">
          PAYMENT RECEIPT
        </h2>
      </header>

      <section className="mt-4 space-y-3 [break-inside:avoid]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReceiptField label="Receipt No." value={receipt.billingCode} />
          <ReceiptField
            label="Payment Date"
            value={formatPrintableDate(receipt.paidAt, { includeTime: true })}
          />
          <ReceiptField
            label="Payment Method"
            value={formatTitleCase(receipt.paymentMethod)}
          />
          <ReceiptField label="Request Date" value={formatPrintableDate(receipt.requestedDate)} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReceiptField label="Patient Name" value={receipt.patientName} />
          <ReceiptField label="Patient Code" value={receipt.patientCode} />
          <ReceiptField label="Request Type" value={formatTitleCase(receipt.requestType)} />
          <ReceiptField label="Requested By" value={receipt.requestedBy || "Clinic"} />
          {receipt.referenceNo ? (
            <ReceiptField label="Reference No." value={receipt.referenceNo} />
          ) : null}
        </div>
      </section>

      <section className="mt-4 [break-inside:avoid]">
        <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold tracking-[0.22em] text-slate-600">
          BILLING BREAKDOWN
        </h3>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-[12px] text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((lineItem) => (
                <tr key={lineItem.lineId} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{lineItem.label}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{lineItem.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(lineItem.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatCurrency(lineItem.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid gap-4 [break-inside:avoid] sm:grid-cols-[1fr_16rem]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[12px] leading-5 text-slate-600">
          This receipt acknowledges payment for the services and laboratory items listed above.
          Keep this copy for patient reference and cashier reconciliation.
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(receipt.subtotal)}
              </span>
            </div>
            {receipt.discount > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium text-rose-600">
                  -{formatCurrency(receipt.discount)}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-[13px]">
              <span className="font-semibold text-slate-700">Total Due</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(totalDue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-2 text-[14px]">
              <span className="font-bold uppercase tracking-[0.12em] text-[#0f2244]">
                Amount Paid
              </span>
              <span className="font-bold text-[#0f2244]">
                {formatCurrency(receipt.amountPaid)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
