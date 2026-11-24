import type { DijiosExchangeRequestDto, LoginRequestDto } from "@dijios-connect/contracts";
import { z } from "zod";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import type { AuthenticatedTeacher, AuthProviderPort, FetchLike } from "./auth-provider.port.js";

const teacherSchema = z.object({
  userId: z.string().min(1),
  publicId: z.string().min(1),
  institutionId: z.string().min(1),
  institutionPublicId: z.string().min(1),
  institutionAlias: z.string().min(1),
  institutionName: z.string().min(1),
  primaryColor: z.string().min(1),
  fullName: z.string().min(1),
  systemRole: z.enum(["FOUNDER", "PRINCIPAL", "DEPT_HEAD", "TEACHER", "COUNSELOR"]),
  branchName: z.string().min(1),
  title: z.string().min(1),
  avatarUrl: z.string().nullable(),
});

export class DijiosSanctumAuthAdapter implements AuthProviderPort {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike,
  ) {}

  authenticateCredentials(input: LoginRequestDto): Promise<AuthenticatedTeacher> {
    return this.post("/api/v1/auth/sanctum/login", input);
  }

  exchangeDijiosToken(input: DijiosExchangeRequestDto): Promise<AuthenticatedTeacher> {
    return this.post("/api/v1/auth/sanctum/exchange", input);
  }

  listDevPersonas(): readonly [] {
    return [];
  }

  private async post(
    path: string,
    body: LoginRequestDto | DijiosExchangeRequestDto,
  ): Promise<AuthenticatedTeacher> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new UnauthorizedDomainException("dijiOS identity provider is unreachable.", 503);
    }
    if (response.status === 401) {
      throw new UnauthorizedDomainException("dijiOS rejected the session.");
    }
    if (!response.ok) {
      throw new UnauthorizedDomainException("dijiOS identity provider failed.", 502);
    }
    const parsed = teacherSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ValidationDomainException("dijiOS returned an unexpected profile.");
    }
    return parsed.data;
  }
}
