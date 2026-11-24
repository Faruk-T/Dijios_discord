export const PROBLEM_CODES = {
  TENANT_FORBIDDEN: "TENANT_FORBIDDEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  ROOM_FULL: "ROOM_FULL",
  PDR_ACCESS_DENIED: "PDR_ACCESS_DENIED",
} as const;

export type ProblemCode = (typeof PROBLEM_CODES)[keyof typeof PROBLEM_CODES];

export interface ValidationErrorItem {
  readonly field: string;
  readonly message: string;
  readonly rule?: string;
}

export interface ProblemDetails {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly code: ProblemCode;
  readonly instance?: string;
  readonly errors?: readonly ValidationErrorItem[];
}
