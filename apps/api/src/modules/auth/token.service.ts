import { createHmac, timingSafeEqual } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import type { AuthTokensResponse } from "@dijios-connect/contracts";
import { UnauthorizedDomainException } from "../../common/errors/domain.exception.js";
import { parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import { EnvService } from "../../config/env.service.js";
import type { AuthenticatedTeacher } from "./auth-provider.port.js";

const ACCESS_TTL_SECONDS = 900;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 14;
export const REFRESH_COOKIE = "dijios_refresh";

const claimsSchema = z.object({
  sub: z.string().min(1),
  institutionId: z.string().min(1),
  systemRole: z.enum(["FOUNDER", "PRINCIPAL", "DEPT_HEAD", "TEACHER", "COUNSELOR"]),
  branchName: z.string().min(1),
  exp: z.number().int(),
});

export type VerifiedClaims = z.infer<typeof claimsSchema>;

export interface RefreshCookieOptions {
  readonly httpOnly: true;
  readonly sameSite: "lax";
  readonly path: "/api/v1/auth";
  readonly secure: boolean;
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(body: string, secret: string): string {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(body);
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}

function signaturesMatch(actual: string, expected: string): boolean {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

@Injectable()
export class TokenService {
  constructor(@Inject(EnvService) private readonly env: EnvService) {}

  issue(teacher: AuthenticatedTeacher): {
    readonly response: AuthTokensResponse;
    readonly refreshToken: string;
  } {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      sub: teacher.userId,
      institutionId: teacher.institutionId,
      systemRole: teacher.systemRole,
      branchName: teacher.branchName,
    };
    return {
      refreshToken: sign(
        JSON.stringify({ ...claims, exp: now + REFRESH_TTL_SECONDS }),
        this.env.config.JWT_REFRESH_SECRET,
      ),
      response: {
        accessToken: sign(
          JSON.stringify({ ...claims, exp: now + ACCESS_TTL_SECONDS }),
          this.env.config.JWT_ACCESS_SECRET,
        ),
        tokenType: "Bearer",
        expiresIn: ACCESS_TTL_SECONDS,
        user: {
          id: parseUuidV7(teacher.userId),
          publicId: parseUlid(teacher.publicId),
          fullName: teacher.fullName,
          avatarUrl: teacher.avatarUrl,
          userId: parseUuidV7(teacher.userId),
          branchName: teacher.branchName,
          title: teacher.title,
          systemRole: teacher.systemRole,
        },
        institution: {
          id: parseUuidV7(teacher.institutionId),
          publicId: parseUlid(teacher.institutionPublicId),
          alias: teacher.institutionAlias,
          name: teacher.institutionName,
          primaryColor: teacher.primaryColor,
        },
      },
    };
  }

  verifyAccess(token: string): VerifiedClaims {
    return this.verify(token, this.env.config.JWT_ACCESS_SECRET);
  }

  verifyRefresh(token: string): VerifiedClaims {
    return this.verify(token, this.env.config.JWT_REFRESH_SECRET);
  }

  refreshCookieOptions(): RefreshCookieOptions {
    return {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/v1/auth",
      secure: this.env.nodeEnv === "production",
    };
  }

  private verify(token: string, secret: string): VerifiedClaims {
    const [header, payload, signature] = token.split(".");
    if (header === undefined || payload === undefined || signature === undefined) {
      throw new UnauthorizedDomainException("Token is malformed.");
    }
    const expected = createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (!signaturesMatch(signature, expected)) {
      throw new UnauthorizedDomainException("Token signature is invalid.");
    }
    const parsed = claimsSchema.safeParse(
      parseJson(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success || parsed.data.exp * 1000 <= Date.now()) {
      throw new UnauthorizedDomainException("Token is expired or invalid.");
    }
    return parsed.data;
  }
}
