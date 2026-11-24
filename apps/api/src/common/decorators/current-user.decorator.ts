import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { AuthContext } from "../auth/auth-context.js";
import { UnauthorizedDomainException } from "../errors/domain.exception.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (request.authContext === undefined) {
      throw new UnauthorizedDomainException("Authenticated user is missing.");
    }
    return request.authContext;
  },
);
