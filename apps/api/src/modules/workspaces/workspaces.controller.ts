import type { ChannelType, CreateChannelRequestDto } from "@dijios-connect/contracts";
import { Body, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { WorkspacesService } from "./workspaces.service.js";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["TEXT", "VOICE", "VIDEO_STAGE", "ANNOUNCEMENT", "DM"]),
  categoryId: z.string().min(1),
  topic: z.string().optional(),
  branchName: z.string().optional(),
  isPrivate: z.boolean().optional(),
  isPdrConfidential: z.boolean().optional(),
  maxParticipants: z.number().int().positive().nullable().optional(),
});

@Controller("workspaces/current")
export class WorkspacesController {
  constructor(@Inject(WorkspacesService) private readonly workspaces: WorkspacesService) {}

  @Get("tree")
  tree(@Req() request: FastifyRequest) {
    return this.workspaces.tree(requireAuth(request));
  }

  @Post("channels")
  create(@Req() request: FastifyRequest, @Body() body: unknown) {
    return this.workspaces.createChannel(requireAuth(request), parseCreate(body));
  }
}

function requireAuth(request: FastifyRequest): AuthContext {
  const auth = request.authContext;
  if (auth === undefined) {
    throw new UnauthorizedDomainException("Authenticated institution is missing.");
  }
  return auth;
}

function parseCreate(body: unknown): CreateChannelRequestDto {
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationDomainException("Channel payload is invalid.");
  }
  const value = parsed.data;
  return {
    name: value.name,
    slug: value.slug,
    type: value.type satisfies ChannelType,
    categoryId: parseUuidV7(value.categoryId),
    ...(value.topic === undefined ? {} : { topic: value.topic }),
    ...(value.branchName === undefined ? {} : { branchName: value.branchName }),
    ...(value.isPrivate === undefined ? {} : { isPrivate: value.isPrivate }),
    ...(value.isPdrConfidential === undefined
      ? {}
      : { isPdrConfidential: value.isPdrConfidential }),
    ...(value.maxParticipants === undefined ? {} : { maxParticipants: value.maxParticipants }),
  };
}
