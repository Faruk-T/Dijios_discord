import type { VoiceTokenResponse } from "@dijios-connect/contracts";
import { Body, Controller, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { Public } from "../../common/auth/public.decorator.js";
import { UnauthorizedDomainException } from "../../common/errors/domain.exception.js";
import { VoiceRoomsService } from "./voice-rooms.service.js";

@Controller()
export class VoiceRoomsController {
  constructor(@Inject(VoiceRoomsService) private readonly rooms: VoiceRoomsService) {}

  @Post("channels/:channelId/voice-token")
  issue(@Req() request: FastifyRequest, @Param("channelId") channelId: string): VoiceTokenResponse {
    return this.rooms.issue(auth(request), channelId);
  }

  @Post("channels/:channelId/voice-leave")
  leave(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
  ): { readonly ok: true } {
    return this.rooms.leave(auth(request), channelId);
  }

  @Public()
  @Post("webhooks/livekit")
  webhook(@Req() request: FastifyRequest, @Body() body: unknown): { readonly ok: true } {
    return this.rooms.applyWebhook(header(request), JSON.stringify(body), body);
  }
}

function auth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException();
  }
  return request.authContext;
}

function header(request: FastifyRequest): string | undefined {
  const value: unknown = request.headers.authorization;
  if (typeof value === "string") {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const first: unknown = value[0];
  return typeof first === "string" ? first : undefined;
}
