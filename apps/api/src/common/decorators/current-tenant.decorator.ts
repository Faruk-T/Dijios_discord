import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UnauthorizedDomainException } from "../errors/domain.exception.js";

export const CurrentTenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const institutionId = request.authContext?.institutionId;
    if (institutionId === undefined) {
      throw new UnauthorizedDomainException("Authenticated institution is missing.");
    }
    return institutionId;
  },
);
