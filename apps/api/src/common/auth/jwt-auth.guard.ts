import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { TokenService } from "../../modules/auth/token.service.js";
import { UnauthorizedDomainException } from "../errors/domain.exception.js";
import type { AuthContext } from "./auth-context.js";
import { isPublicRoute } from "./public.decorator.js";

function bearerToken(header: string | undefined): string | null {
  if (header === undefined || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length === 0 ? null : token;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TokenService) private readonly tokens: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (isPublicRoute(this.reflector, context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = bearerToken(request.headers.authorization);
    if (token === null) {
      throw new UnauthorizedDomainException("Bearer token is required.");
    }
    const claims = this.tokens.verifyAccess(token);
    const authContext: AuthContext = {
      userId: claims.sub,
      institutionId: claims.institutionId,
      systemRole: claims.systemRole,
      branchName: claims.branchName,
    };
    request.authContext = authContext;
    return true;
  }
}
