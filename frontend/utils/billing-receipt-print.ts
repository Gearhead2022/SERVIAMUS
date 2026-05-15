import { PrintableBillingReceiptPayload } from "@/types/BillingTypes";

type BillingReceiptPrintOptions = {
  autoPrint?: boolean;
};

type StoredBillingReceiptDraft = {
  payload: PrintableBillingReceiptPayload;
  savedAt: string;
};

type CachedBillingReceiptDraft = {
  payload: PrintableBillingReceiptPayload | null;
  rawDraft: string | null;
};

const BILLING_RECEIPT_STORAGE_PREFIX = "serviamus:billing-receipt:";
const BILLING_RECEIPT_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const billingReceiptDraftCache = new Map<string, CachedBillingReceiptDraft>();

const getDraftStorageKey = (draftId: string) =>
  `${BILLING_RECEIPT_STORAGE_PREFIX}${draftId}`;

const parseBillingReceiptDraft = (rawDraft: string | null) => {
  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<StoredBillingReceiptDraft>;
    return parsedDraft.payload ?? null;
  } catch {
    return null;
  }
};

const cleanupStaleDrafts = () => {
  if (typeof window === "undefined") {
    return;
  }

  const cutoff = Date.now() - BILLING_RECEIPT_DRAFT_TTL_MS;

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const storageKey = window.localStorage.key(index);

    if (!storageKey?.startsWith(BILLING_RECEIPT_STORAGE_PREFIX)) {
      continue;
    }

    try {
      const rawDraft = window.localStorage.getItem(storageKey);

      if (!rawDraft) {
        window.localStorage.removeItem(storageKey);
        billingReceiptDraftCache.delete(storageKey);
        continue;
      }

      const parsedDraft = JSON.parse(rawDraft) as Partial<StoredBillingReceiptDraft>;
      const savedAt = parsedDraft.savedAt ? Date.parse(parsedDraft.savedAt) : NaN;

      if (!Number.isFinite(savedAt) || savedAt < cutoff) {
        window.localStorage.removeItem(storageKey);
        billingReceiptDraftCache.delete(storageKey);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      billingReceiptDraftCache.delete(storageKey);
    }
  }
};

export const createBillingReceiptPrintDraft = (
  payload: PrintableBillingReceiptPayload
) => {
  if (typeof window === "undefined") {
    throw new Error("Print preview is only available in the browser.");
  }

  cleanupStaleDrafts();

  const draftId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const record: StoredBillingReceiptDraft = {
    payload,
    savedAt: new Date().toISOString(),
  };
  const storageKey = getDraftStorageKey(draftId);
  const rawDraft = JSON.stringify(record);

  window.localStorage.setItem(storageKey, rawDraft);
  billingReceiptDraftCache.set(storageKey, {
    payload,
    rawDraft,
  });

  return draftId;
};

export const readBillingReceiptPrintDraft = (draftId: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = getDraftStorageKey(draftId);
  const rawDraft = window.localStorage.getItem(storageKey);
  const cachedDraft = billingReceiptDraftCache.get(storageKey);

  if (cachedDraft && cachedDraft.rawDraft === rawDraft) {
    return cachedDraft.payload;
  }

  const payload = parseBillingReceiptDraft(rawDraft);

  billingReceiptDraftCache.set(storageKey, {
    payload,
    rawDraft,
  });

  return payload;
};

export const getBillingReceiptPrintRoute = (
  draftId: string,
  options: BillingReceiptPrintOptions = {}
) => {
  const searchParams = new URLSearchParams({
    draft: draftId,
  });

  if (options.autoPrint) {
    searchParams.set("autoprint", "1");
  }

  return `/billing/receipt?${searchParams.toString()}`;
};

export const openBillingReceiptPrintPage = (
  payload: PrintableBillingReceiptPayload,
  options: BillingReceiptPrintOptions = {}
) => {
  if (typeof window === "undefined") {
    throw new Error("Print preview is only available in the browser.");
  }

  const draftId = createBillingReceiptPrintDraft(payload);
  const route = getBillingReceiptPrintRoute(draftId, options);
  const printWindow = window.open(route, "_blank", "noopener,noreferrer");

  if (!printWindow) {
    throw new Error(
      "Unable to open the print preview. Please allow pop-ups for this site and try again."
    );
  }

  return draftId;
};
