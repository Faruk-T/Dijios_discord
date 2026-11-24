import type { PresenceStatus } from "@dijios-connect/contracts";
import { Body, Controller, Get, Inject, Patch, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { PresenceService } from "./presence.service.js";
import { WorkspacesService } from "../workspaces/workspaces.service.js";

const presenceSchema = z.object({
  status: z.enum(["ONLINE", "IN_CLASS", "ON_DUTY", "IN_VOICE", "DND", "OFFLINE"]),
});

@Controller("workspaces/current")
export class PresenceController {
  constructor(
    @Inject(PresenceService) private readonly presence: PresenceService,
    @Inject(WorkspacesService) private readonly workspaces: WorkspacesService,
  ) {}

  @Get("roster")
  roster(@Req() request: FastifyRequest) {
    const auth = requireAuth(request);
    this.workspaces.tree(auth);
    return this.presence.roster(auth.institutionId);
  }

  @Patch("presence")
  update(@Req() request: FastifyRequest, @Body() body: unknown) {
    const auth = requireAuth(request);
    const parsed = presenceSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationDomainException("Presence payload is invalid.");
    }
    this.presence.heartbeat(
      auth.institutionId,
      auth.userId,
      parsed.data.status satisfies PresenceStatus,
    );
    return { status: parsed.data.status };
  }
}

function requireAuth(request: FastifyRequest): AuthContext {
  const auth = request.authContext;
  if (auth === undefined) {
    throw new UnauthorizedDomainException("Authenticated institution is missing.");
  }
  return auth;
}
