"use client";

import { Suspense } from "react";
import ExternalLabRequestPrintContent from "./ExternalLabRequestPrintContent";

function PrintPageSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-[#c8e4de] bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-[8in] space-y-5">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <div className="h-14 w-14 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded-full bg-slate-200" />
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            <div className="h-3 w-1/3 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[52px] rounded-2xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
        <div className="h-28 rounded-2xl border border-slate-200 bg-slate-50" />
        <div className="h-20 rounded-2xl border border-slate-200 bg-slate-50" />
      </div>
    </div>
  );
}

export default function ExternalLabRequestPrintPage() {
  return (
    <Suspense fallback={<PrintPageSkeleton />}>
      <ExternalLabRequestPrintContent />
    </Suspense>
  );
}