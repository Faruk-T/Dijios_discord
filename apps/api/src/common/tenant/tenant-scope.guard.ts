import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { isPublicRoute } from "../auth/public.decorator.js";
import { TenantForbiddenException } from "../errors/domain.exception.js";

function readField(value: unknown, field: string): string | null {
  if (typeof value !== "object" || value === null || !(field in value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const item = record[field];
  return typeof item === "string" && item.length > 0 ? item : null;
}

function headerValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

function requestedInstitutionIds(request: FastifyRequest): readonly string[] {
  const header = headerValue(request.headers["x-institution-id"]);
  return [
    readField(request.params, "institutionId"),
    readField(request.query, "institutionId"),
    readField(request.body, "institutionId"),
    header,
  ].filter((item): item is string => item !== null);
}

@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (isPublicRoute(this.reflector, context)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const sessionId = request.authContext?.institutionId;
    if (sessionId === undefined) {
      throw new TenantForbiddenException("Authenticated institution scope is missing.");
    }
    const mismatched = requestedInstitutionIds(request).some(
      (institutionId) => institutionId !== sessionId,
    );
    if (mismatched) {
      throw new TenantForbiddenException();
    }
    return true;
  }
}
