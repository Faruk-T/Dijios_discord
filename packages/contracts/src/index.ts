export type {
  CursorPaginatedResult,
  IdentifiableEntity,
  IsoTimestamp,
  TenantScoped,
  TenantScopedEntity,
  Ulid,
  UuidV7,
} from "./primitives.contracts.js";

export {
  PROBLEM_CODES,
  type ProblemCode,
  type ProblemDetails,
  type ValidationErrorItem,
} from "./problem-details.contracts.js";

export {
  ACADEMIC_SYSTEM_ROLES,
  PRESENCE_STATUSES,
  type AcademicSystemRole,
  type AuthenticatedSession,
  type AuthorSummary,
  type CampusSummary,
  type InstitutionSummary,
  type PresenceStatus,
  type TeacherProfileSummary,
} from "./tenant-auth.contracts.js";
