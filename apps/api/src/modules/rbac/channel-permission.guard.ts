import type { ChannelType } from "@dijios-connect/contracts";
import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import {
  PdrAccessDeniedException,
  TenantForbiddenException,
} from "../../common/errors/domain.exception.js";
import { RbacEvaluatorService } from "./rbac-evaluator.service.js";
import {
  CHANNEL_PERMISSION_KEY,
  type ChannelPermissionFlag,
} from "./require-channel-permission.decorator.js";

const channelSchema = z.object({
  channelType: z.enum(["TEXT", "VOICE", "VIDEO_STAGE", "ANNOUNCEMENT", "DM"]),
  channelBranchName: z.string().nullable(),
  isPdrConfidential: z.boolean(),
  allowBits: z.string().regex(/^\d+$/),
  denyBits: z.string().regex(/^\d+$/),
});

function requireAuth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException("Bearer token is required.");
  }
  return request.authContext;
}

@Injectable()
export class ChannelPermissionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(RbacEvaluatorService) private readonly evaluator: RbacEvaluatorService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = this.reflector.get<ChannelPermissionFlag | undefined>(
      CHANNEL_PERMISSION_KEY,
      context.getHandler(),
    );
    if (flag === undefined) {
      return true;
    }
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const auth = requireAuth(request);
    const parsed = channelSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationDomainException("Channel permission payload is invalid.");
    }
    const decision = this.evaluator.evaluate({
      systemRole: auth.systemRole,
      branchName: auth.branchName,
      channelType: parsed.data.channelType satisfies ChannelType,
      channelBranchName: parsed.data.channelBranchName,
      isPdrConfidential: parsed.data.isPdrConfidential,
      allowBits: BigInt(parsed.data.allowBits),
      denyBits: BigInt(parsed.data.denyBits),
    });
    if (!decision.ok) {
      throw new PdrAccessDeniedException();
    }
    if (!decision.permissions.flags[flag]) {
      throw new TenantForbiddenException("Required channel permission is denied.");
    }
    return true;
  }
}
