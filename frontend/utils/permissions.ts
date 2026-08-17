// utils/permissions.ts

export const hasRole = (
    userRoles: string[] | undefined,
    allowedRoles: string[]
) => {
    if (!userRoles?.length) return false;

    return userRoles.some((role) => allowedRoles.includes(role));
};

export const canAddPatient = (userRoles: string[] | undefined) => {
    return hasRole(userRoles, ["STAFF", "ADMIN", "ENCODER"]);
};

export const canAccessBilling = (userRoles: string[] | undefined) => {
    return hasRole(userRoles, ["CASHIER", "ADMIN"]);
};

export const canViewLab = (userRoles: string[] | undefined) => {
    return hasRole(userRoles, ["LAB", "LABORATORY"]);
};
