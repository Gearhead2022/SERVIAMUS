type ConsultPrintRouteOptions = {
    autoDownload?: boolean;
    autoPrint?: boolean;
    doctorId?: number;
    type?: "consult-result" | "prescription" | "med-cert" | "followup-result";
    patientName?: string;
};

export const getConsultPrintRoute = (
    reqid: number,
    options: ConsultPrintRouteOptions = {}
) => {
    const searchParams = new URLSearchParams();
    const template =
        options?.doctorId === 1
            ? "temp-1"
            : "default";

    if (options.autoPrint) {
        searchParams.set("autoprint", "1");
    }

    if (options.autoDownload) {
        searchParams.set("download", "1");
    }

    if (options.doctorId) {
        searchParams.set("doctorId", String(options.doctorId));
        searchParams.set("template", template);
    }

    if (options.type) {
        searchParams.set("type", options.type);
    }

    if (options.patientName) {
        searchParams.set("patientName", options.patientName);
    }

    const queryString = searchParams.toString();
    return `/consultRecords/results/${reqid}${queryString ? `?${queryString}` : ""}`;
};

export const openConsultPrintPage = (
    reqid: number,
    options: ConsultPrintRouteOptions = {}
) => {
    const route = getConsultPrintRoute(reqid, options);
    window.open(route, "_blank", "noopener,noreferrer");
};
