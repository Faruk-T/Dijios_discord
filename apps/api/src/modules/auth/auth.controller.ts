import { type AuthTokensResponse, type MockPersonaSummary } from "@dijios-connect/contracts";
import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { EnvService } from "../../config/env.service.js";
import { SEED_INSTITUTIONS, SEED_TEACHERS } from "../../../prisma/seed-data.js";
import { AUTH_PROVIDER_PORT, type AuthProviderPort } from "./auth-provider.port.js";
import { REFRESH_COOKIE, TokenService } from "./token.service.js";

const loginSchema = z.object({
  institutionAlias: z.string().min(1),
  dijiosUserId: z.string().min(1),
});

const exchangeSchema = z.object({
  exchangeToken: z.string().min(1),
});

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationDomainException(
      "Request body is invalid.",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return parsed.data;
}

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly auth: AuthProviderPort,
    @Inject(TokenService) private readonly tokens: TokenService,
    @Inject(EnvService) private readonly env: EnvService,
  ) {}

  @Post("login")
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthTokensResponse> {
    const teacher = await this.auth.authenticateCredentials(parseBody(loginSchema, body));
    return this.respond(reply, teacher);
  }

  @Post("dijios-exchange")
  async exchange(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthTokensResponse> {
    const teacher = await this.auth.exchangeDijiosToken(parseBody(exchangeSchema, body));
    return this.respond(reply, teacher);
  }

  @Post("refresh")
  refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): AuthTokensResponse {
    const cookie = request.cookies[REFRESH_COOKIE];
    if (cookie === undefined || cookie.length === 0) {
      throw new UnauthorizedDomainException("Refresh cookie is missing.");
    }
    const claims = this.tokens.verifyRefresh(cookie);
    const teacher = SEED_TEACHERS.find((item) => item.id === claims.sub);
    const institution = SEED_INSTITUTIONS.find((item) => item.id === claims.institutionId);
    if (teacher === undefined || institution === undefined) {
      throw new UnauthorizedDomainException("Refresh token subject is unknown.");
    }
    return this.respond(reply, {
      userId: teacher.id,
      publicId: teacher.publicId,
      institutionId: institution.id,
      institutionPublicId: institution.publicId,
      institutionAlias: institution.alias,
      institutionName: institution.name,
      primaryColor: institution.primaryColor,
      fullName: teacher.fullName,
      systemRole: teacher.systemRole,
      branchName: teacher.branchName,
      title: teacher.title,
      avatarUrl: null,
    });
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) reply: FastifyReply): { readonly status: "ok" } {
    reply.clearCookie(REFRESH_COOKIE, this.tokens.refreshCookieOptions());
    return { status: "ok" };
  }

  @Get("personas")
  personas(): readonly MockPersonaSummary[] {
    if (this.env.authMode !== "mock") {
      throw new UnauthorizedDomainException("Personas are available only in mock mode.");
    }
    return this.auth.listDevPersonas();
  }

  private respond(
    reply: FastifyReply,
    teacher: Awaited<ReturnType<AuthProviderPort["authenticateCredentials"]>>,
  ): AuthTokensResponse {
    const issued = this.tokens.issue(teacher);
    reply.setCookie(REFRESH_COOKIE, issued.refreshToken, this.tokens.refreshCookieOptions());
    return issued.response;
  }
}
