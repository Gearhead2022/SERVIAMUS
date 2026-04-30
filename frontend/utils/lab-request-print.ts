import { PrintableLabRequestPayload } from "@/types/RequestTypes";

type ExternalLabRequestPrintOptions = {
  autoPrint?: boolean;
};

type StoredExternalLabRequestDraft = {
  payload: PrintableLabRequestPayload;
  savedAt: string;
};

type CachedExternalLabRequestDraft = {
  payload: PrintableLabRequestPayload | null;
  rawDraft: string | null;
};

const EXTERNAL_LAB_REQUEST_STORAGE_PREFIX =
  "serviamus:external-lab-request:";
const EXTERNAL_LAB_REQUEST_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const externalLabRequestDraftCache = new Map<
  string,
  CachedExternalLabRequestDraft
>();

const getDraftStorageKey = (draftId: string) =>
  `${EXTERNAL_LAB_REQUEST_STORAGE_PREFIX}${draftId}`;

const parseExternalLabRequestDraft = (rawDraft: string | null) => {
  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<StoredExternalLabRequestDraft>;
    return parsedDraft.payload ?? null;
  } catch {
    return null;
  }
};

const cleanupStaleDrafts = () => {
  if (typeof window === "undefined") {
    return;
  }

  const cutoff = Date.now() - EXTERNAL_LAB_REQUEST_DRAFT_TTL_MS;

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const storageKey = window.localStorage.key(index);

    if (!storageKey?.startsWith(EXTERNAL_LAB_REQUEST_STORAGE_PREFIX)) {
      continue;
    }

    try {
      const rawDraft = window.localStorage.getItem(storageKey);

      if (!rawDraft) {
        window.localStorage.removeItem(storageKey);
        externalLabRequestDraftCache.delete(storageKey);
        continue;
      }

      const parsedDraft = JSON.parse(rawDraft) as Partial<StoredExternalLabRequestDraft>;
      const savedAt = parsedDraft.savedAt ? Date.parse(parsedDraft.savedAt) : NaN;

      if (!Number.isFinite(savedAt) || savedAt < cutoff) {
        window.localStorage.removeItem(storageKey);
        externalLabRequestDraftCache.delete(storageKey);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      externalLabRequestDraftCache.delete(storageKey);
    }
  }
};

export const createExternalLabRequestPrintDraft = (
  payload: PrintableLabRequestPayload
) => {
  if (typeof window === "undefined") {
    throw new Error("Print preview is only available in the browser.");
  }

  cleanupStaleDrafts();

  const draftId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const record: StoredExternalLabRequestDraft = {
    payload,
    savedAt: new Date().toISOString(),
  };
  const storageKey = getDraftStorageKey(draftId);
  const rawDraft = JSON.stringify(record);

  window.localStorage.setItem(storageKey, rawDraft);
  externalLabRequestDraftCache.set(storageKey, {
    payload,
    rawDraft,
  });

  return draftId;
};

export const readExternalLabRequestPrintDraft = (draftId: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = getDraftStorageKey(draftId);
  const rawDraft = window.localStorage.getItem(storageKey);
  const cachedDraft = externalLabRequestDraftCache.get(storageKey);

  if (cachedDraft && cachedDraft.rawDraft === rawDraft) {
    return cachedDraft.payload;
  }

  const payload = parseExternalLabRequestDraft(rawDraft);

  externalLabRequestDraftCache.set(storageKey, {
    payload,
    rawDraft,
  });

  return payload;
};

export const getExternalLabRequestPrintRoute = (
  draftId: string,
  options: ExternalLabRequestPrintOptions = {}
) => {
  const searchParams = new URLSearchParams({
    draft: draftId,
  });

  if (options.autoPrint) {
    searchParams.set("autoprint", "1");
  }

  return `/labrecords/requests/external?${searchParams.toString()}`;
};

export const openExternalLabRequestPrintPage = (
  payload: PrintableLabRequestPayload,
  options: ExternalLabRequestPrintOptions = {}
) => {
  if (typeof window === "undefined") {
    throw new Error("Print preview is only available in the browser.");
  }

  const draftId = createExternalLabRequestPrintDraft(payload);
  const route = getExternalLabRequestPrintRoute(draftId, options);
  const printWindow = window.open(route, "_blank", "noopener,noreferrer");

  if (!printWindow) {
    throw new Error(
      "Unable to open the print preview. Please allow pop-ups for this site and try again."
    );
  }

  return draftId;
};
