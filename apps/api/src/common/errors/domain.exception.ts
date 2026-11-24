import {
  PROBLEM_CODES,
  type ProblemCode,
  type ProblemDetails,
  type ValidationErrorItem,
} from "@dijios-connect/contracts";

interface ProblemInput {
  readonly status: number;
  readonly code: ProblemCode;
  readonly title: string;
  readonly detail: string;
  readonly errors?: readonly ValidationErrorItem[];
}

export function toProblemDetails(input: ProblemInput): ProblemDetails {
  const problem = {
    type: `https://connect.dijios.com/problems/${input.code}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
    code: input.code,
  };
  if (input.errors === undefined) {
    return problem;
  }
  return { ...problem, errors: input.errors };
}

export class DomainException extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail);
    this.name = "DomainException";
    this.problem = problem;
  }
}

export class TenantForbiddenException extends DomainException {
  constructor(detail = "Institution scope does not match the authenticated session.") {
    super(
      toProblemDetails({
        status: 403,
        code: PROBLEM_CODES.TENANT_FORBIDDEN,
        title: "Tenant forbidden",
        detail,
      }),
    );
    this.name = "TenantForbiddenException";
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(detail = "Authentication is required.", status = 401) {
    super(
      toProblemDetails({
        status,
        code: PROBLEM_CODES.UNAUTHORIZED,
        title: "Unauthorized",
        detail,
      }),
    );
    this.name = "UnauthorizedDomainException";
  }
}

export class ValidationDomainException extends DomainException {
  constructor(detail: string, errors: readonly ValidationErrorItem[] = []) {
    super(
      toProblemDetails({
        status: 400,
        code: PROBLEM_CODES.VALIDATION_FAILED,
        title: "Validation failed",
        detail,
        errors,
      }),
    );
    this.name = "ValidationDomainException";
  }
}

export class PdrAccessDeniedException extends DomainException {
  constructor(detail = "PDR confidential rooms are restricted to authorized counselors.") {
    super(
      toProblemDetails({
        status: 403,
        code: PROBLEM_CODES.PDR_ACCESS_DENIED,
        title: "PDR access denied",
        detail,
      }),
    );
    this.name = "PdrAccessDeniedException";
  }
}
