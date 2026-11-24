import type {
  AcademicSystemRole,
  AuthorSummary,
  InstitutionSummary,
  TeacherProfileSummary,
} from "./tenant-auth.contracts.js";

export interface LoginRequestDto {
  readonly institutionAlias: string;
  readonly dijiosUserId: string;
}

export interface DijiosExchangeRequestDto {
  readonly exchangeToken: string;
}

export interface AuthTokenClaims {
  readonly sub: string;
  readonly institutionId: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
}

export interface AuthTokensResponse {
  readonly accessToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
  readonly user: AuthorSummary & TeacherProfileSummary;
  readonly institution: InstitutionSummary;
}

export interface MockPersonaSummary {
  readonly dijiosUserId: string;
  readonly fullName: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
  readonly title: string;
  readonly institutionAlias: string;
  readonly institutionName: string;
}
