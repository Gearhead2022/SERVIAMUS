// utils/date.ts

const TIMEZONE = "Asia/Manila";

export const now = () => new Date();

export const todayPH = () =>
    new Date().toLocaleDateString("en-CA", {
        timeZone: TIMEZONE,
    });

export const formatPH = (date: Date | string) =>
    new Date(date).toLocaleString("en-PH", {
        timeZone: TIMEZONE,
    });

export const isoPH = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

export const formattedIsoPH = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
};

export const formattedIsoTimePH = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("en-PH", {
        timeZone: TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

export const formattedCurrentDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(date);
};

export const formatDate = (
    value?: string | Date,
    options?: Intl.DateTimeFormatOptions
) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "short",
        day: "2-digit",
        ...options,
    }).format(date);
};

export const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatTime = (
    value?: string | Date,
    options?: Intl.DateTimeFormatOptions
) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        ...options,
    }).format(date);
};

export const formatCurrency = (v: number) => {
    return `₱${v.toLocaleString("en-PH")}`;
}