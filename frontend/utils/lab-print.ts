type LabPrintRouteOptions = {
  autoDownload?: boolean;
  autoPrint?: boolean;
};

export const getLabPrintRoute = (
  labId: number,
  options: LabPrintRouteOptions = {}
) => {
  const searchParams = new URLSearchParams();

  if (options.autoPrint) {
    searchParams.set("autoprint", "1");
  }

  if (options.autoDownload) {
    searchParams.set("download", "1");
  }

  const queryString = searchParams.toString();
  return `/labrecords/results/${labId}${queryString ? `?${queryString}` : ""}`;
};

export const openLabPrintPage = (
  labId: number,
  options: LabPrintRouteOptions = {}
) => {
  const route = getLabPrintRoute(labId, options);
  window.open(route, "_blank", "noopener,noreferrer");
};
