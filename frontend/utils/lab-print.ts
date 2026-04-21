export const getLabPrintRoute = (labId: number, autoPrint = false) => {
  const searchParams = new URLSearchParams();

  if (autoPrint) {
    searchParams.set("autoprint", "1");
  }

  const queryString = searchParams.toString();
  return `/labrecords/results/${labId}${queryString ? `?${queryString}` : ""}`;
};

export const openLabPrintPage = (labId: number, autoPrint = false) => {
  const route = getLabPrintRoute(labId, autoPrint);
  window.open(route, "_blank", "noopener,noreferrer");
};
