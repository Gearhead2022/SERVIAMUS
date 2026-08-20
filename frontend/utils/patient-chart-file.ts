const mimeTypeByExtension = new Map([
  [".pdf", "application/pdf"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
]);

const supportedMimeTypes = new Set(mimeTypeByExtension.values());

export const patientChartFileAccept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export const resolvePatientChartMimeType = (mimeType: string, fileName: string) => {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (supportedMimeTypes.has(normalizedMimeType)) return normalizedMimeType;

  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return mimeTypeByExtension.get(extension) ?? null;
};

export const isSupportedPatientChartFile = (file: File) =>
  resolvePatientChartMimeType(file.type, file.name) !== null;
