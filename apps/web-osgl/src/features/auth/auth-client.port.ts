import type {
  AcademicSystemRole,
  DijiosExchangeRequestDto,
  LoginRequestDto,
  MockPersonaSummary,
} from "@dijios-connect/contracts";

export interface ClientSession {
  readonly accessToken: string;
  readonly userId: string;
  readonly fullName: string;
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
  readonly title: string;
  readonly institutionId: string;
  readonly institutionAlias: string;
  readonly institutionName: string;
  readonly primaryColor: string;
}

export interface AuthClientPort {
  login(input: LoginRequestDto): Promise<ClientSession>;
  exchangeDijiosToken(input: DijiosExchangeRequestDto): Promise<ClientSession>;
  refresh(): Promise<ClientSession>;
  logout(): Promise<void>;
  listPersonas(): Promise<readonly MockPersonaSummary[]>;
}
