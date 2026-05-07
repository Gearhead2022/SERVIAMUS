import { LabResultPayload, LabUser } from "@/types/LabTypes";

const PATHOLOGIST_ROLE_NAMES = new Set(["PATHOLOGIST", "DOCTOR"]);
const MEDTECH_ROLE_NAMES = new Set(["MEDTECH", "LAB", "LABORATORY"]);

const defaultLabPersonnel = {
  medTech: {
    name: "Jhenny S. Alvarez",
    ptrNo: "",
    title: "RMT",
  },
  pathologist: {
    name: "Dr. Greg Ryan T. Gerongano",
    ptrNo: "",
    title: "",
  },
} as const;

const labResultMetaKeys = new Set([
  "medTechUserId",
  "med_tech_user_id",
  "medtech_license_no",
  "medtech_name",
  "medtech_ptr_no",
  "medtech_title",
  "medtech_user_id",
  "pathologistUserId",
  "pathologist_license_no",
  "pathologist_name",
  "pathologist_ptr_no",
  "pathologist_title",
  "pathologist_user_id",
  "pth_user_id",
]);

type PersonnelSnapshot = {
  licenseNo?: string | null;
  name: string;
  ptrNo?: string | null;
  title?: string | null;
};

const formatSnapshotText = (value?: string | null) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : "";
};

const getPersonnelCredentialLine = ({
  licenseNo,
  ptrNo,
}: Pick<PersonnelSnapshot, "licenseNo" | "ptrNo">) => {
  const credentialParts = [
    formatSnapshotText(licenseNo),
    formatSnapshotText(ptrNo),
  ].filter(Boolean);

  return credentialParts.length ? credentialParts.join(" | ") : "";
};

const getPersonnelPrimaryLine = ({ name, title }: PersonnelSnapshot) => {
  const normalizedName = formatSnapshotText(name);
  const normalizedTitle = formatSnapshotText(title);

  if (!normalizedTitle) {
    return normalizedName;
  }

  return `${normalizedName}, ${normalizedTitle}`;
};

const readResultString = (
  payload: LabResultPayload | null | undefined,
  keys: string[],
  fallback = ""
) => {
  if (!payload) {
    return fallback;
  }

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
};

const readResultUserId = (
  payload: LabResultPayload | null | undefined,
  keys: string[]
) => {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
      return value;
    }

    if (typeof value === "string") {
      const parsedValue = Number(value.trim());

      if (Number.isInteger(parsedValue) && parsedValue > 0) {
        return parsedValue;
      }
    }
  }

  return null;
};

const getRoleNames = (user: LabUser) =>
  user.roles.map((role) => role.roleName.trim().toUpperCase());

const filterUsersByRoles = (users: LabUser[], allowedRoles: Set<string>) =>
  users.filter((user) =>
    getRoleNames(user).some((roleName) => allowedRoles.has(roleName))
  );

const sortUsersByName = (users: LabUser[]) =>
  [...users].sort((left, right) => left.name.localeCompare(right.name));

export const formatLabPersonnelOptionLabel = (user: LabUser) => {
  const details = [
    formatSnapshotText(user.title),
    formatSnapshotText(user.licenseNo),
    formatSnapshotText(user.ptrNo),
  ].filter(Boolean);

  if (!details.length) {
    return user.name;
  }

  return `${user.name} (${details.join(" | ")})`;
};

export const getMedTechUsers = (users: LabUser[]) => {
  const matchedUsers = filterUsersByRoles(users, MEDTECH_ROLE_NAMES);
  return sortUsersByName(matchedUsers.length ? matchedUsers : users);
};

export const getPathologistUsers = (users: LabUser[]) => {
  const matchedUsers = filterUsersByRoles(users, PATHOLOGIST_ROLE_NAMES);
  return sortUsersByName(matchedUsers.length ? matchedUsers : users);
};

export const findLabUserById = (users: LabUser[], userId: number) =>
  users.find((user) => user.userId === userId) ?? null;

export const getSavedMedTechUserId = (payload?: LabResultPayload | null) =>
  readResultUserId(payload, ["medtech_user_id", "med_tech_user_id", "medTechUserId"]);

export const getSavedPathologistUserId = (payload?: LabResultPayload | null) =>
  readResultUserId(payload, [
    "pathologist_user_id",
    "pathologistUserId",
    "pth_user_id",
  ]);

export const buildLabPersonnelPayload = ({
  medTechUser,
  pathologistUser,
}: {
  medTechUser: LabUser;
  pathologistUser: LabUser;
}) => ({
  medtech_license_no: formatSnapshotText(medTechUser.licenseNo),
  medtech_name: medTechUser.name,
  medtech_ptr_no: formatSnapshotText(medTechUser.ptrNo),
  medtech_title: formatSnapshotText(medTechUser.title),
  medtech_user_id: medTechUser.userId,
  pathologist_license_no: formatSnapshotText(pathologistUser.licenseNo),
  pathologist_name: pathologistUser.name,
  pathologist_ptr_no: formatSnapshotText(pathologistUser.ptrNo),
  pathologist_title: formatSnapshotText(pathologistUser.title),
  pathologist_user_id: pathologistUser.userId,
});

export const isLabResultMetaField = (key: string) => labResultMetaKeys.has(key);

export const getLabResultPersonnelDisplay = (
  payload?: LabResultPayload | null
) => {
  const medTechSnapshot: PersonnelSnapshot = {
    licenseNo: readResultString(payload, ["medtech_license_no"]),
    name: readResultString(payload, ["medtech_name"], defaultLabPersonnel.medTech.name),
    ptrNo: readResultString(payload, ["medtech_ptr_no"], defaultLabPersonnel.medTech.ptrNo),
    title: readResultString(payload, ["medtech_title"], defaultLabPersonnel.medTech.title),
  };

  const pathologistSnapshot: PersonnelSnapshot = {
    licenseNo: readResultString(payload, ["pathologist_license_no"]),
    name: readResultString(
      payload,
      ["pathologist_name"],
      defaultLabPersonnel.pathologist.name
    ),
    ptrNo: readResultString(
      payload,
      ["pathologist_ptr_no"],
      defaultLabPersonnel.pathologist.ptrNo
    ),
    title: readResultString(
      payload,
      ["pathologist_title"],
      defaultLabPersonnel.pathologist.title
    ),
  };

  return {
    medTech: {
      primaryLine: getPersonnelPrimaryLine(medTechSnapshot),
      secondaryLine: getPersonnelCredentialLine(medTechSnapshot),
    },
    pathologist: {
      primaryLine: getPersonnelPrimaryLine(pathologistSnapshot),
      secondaryLine: getPersonnelCredentialLine(pathologistSnapshot),
    },
  };
};
