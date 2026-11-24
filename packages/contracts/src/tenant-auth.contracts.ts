import type { IsoTimestamp, Ulid, UuidV7 } from "./primitives.contracts.js";

export const ACADEMIC_SYSTEM_ROLES = {
  FOUNDER: "FOUNDER",
  PRINCIPAL: "PRINCIPAL",
  DEPT_HEAD: "DEPT_HEAD",
  TEACHER: "TEACHER",
  COUNSELOR: "COUNSELOR",
} as const;

export type AcademicSystemRole = (typeof ACADEMIC_SYSTEM_ROLES)[keyof typeof ACADEMIC_SYSTEM_ROLES];

export const PRESENCE_STATUSES = {
  ONLINE: "ONLINE",
  IN_CLASS: "IN_CLASS",
  ON_DUTY: "ON_DUTY",
  IN_VOICE: "IN_VOICE",
  DND: "DND",
  OFFLINE: "OFFLINE",
} as const;

export type PresenceStatus = (typeof PRESENCE_STATUSES)[keyof typeof PRESENCE_STATUSES];

export interface InstitutionSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly alias: string;
  readonly name: string;
  readonly primaryColor: string;
}

export interface CampusSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly institutionId: UuidV7;
  readonly name: string;
}

export interface AuthorSummary {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly fullName: string;
  readonly avatarUrl: string | null;
}

export interface TeacherProfileSummary {
  readonly userId: UuidV7;
  readonly branchName: string;
  readonly title: string;
  readonly systemRole: AcademicSystemRole;
}

export interface AuthenticatedSession {
  readonly user: AuthorSummary & TeacherProfileSummary;
  readonly institution: InstitutionSummary;
  readonly campus: CampusSummary | null;
  readonly presence: PresenceStatus;
  readonly accessExpiresAt: IsoTimestamp;
}
