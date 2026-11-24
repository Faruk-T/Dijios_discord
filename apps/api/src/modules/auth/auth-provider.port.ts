import type {
  AcademicSystemRole,
  DijiosExchangeRequestDto,
  LoginRequestDto,
  MockPersonaSummary,
} from "@dijios-connect/contracts";

export const AUTH_PROVIDER_PORT = Symbol("AUTH_PROVIDER_PORT");

export interface AuthenticatedTeacher {
  readonly userId: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly institutionPublicId: string;
  readonly institutionAlias: string;
  readonly institutionName: string;
  readonly primaryColor: string;
  readonly fullName: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
  readonly title: string;
  readonly avatarUrl: string | null;
}

export interface AuthProviderPort {
  authenticateCredentials(input: LoginRequestDto): Promise<AuthenticatedTeacher>;
  exchangeDijiosToken(input: DijiosExchangeRequestDto): Promise<AuthenticatedTeacher>;
  listDevPersonas(): readonly MockPersonaSummary[];
}

export interface FetchLike {
  (input: string, init: RequestInit): Promise<Response>;
}
