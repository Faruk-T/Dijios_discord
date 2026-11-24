import type { MeetingMinutesDocument, SaveMeetingMinutesDto } from "@dijios-connect/contracts";
import { Body, Controller, Get, Header, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import { MinutesService } from "./minutes.service.js";

const decisionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  ownerName: z.string().min(1),
  done: z.boolean(),
});

const saveSchema = z.object({
  title: z.string().min(1),
  markdownBody: z.string(),
  decisions: z.array(decisionSchema),
  minutesId: z.string().min(1).optional(),
});

@Controller()
export class MinutesController {
  constructor(@Inject(MinutesService) private readonly minutes: MinutesService) {}

  @Get("channels/:channelId/minutes")
  list(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
  ): MeetingMinutesDocument[] {
    return this.minutes.list(auth(request), channelId);
  }

  @Post("channels/:channelId/minutes")
  save(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
    @Body() body: unknown,
  ): MeetingMinutesDocument {
    return this.minutes.save(auth(request), channelId, readSave(body));
  }

  @Get("minutes/:minutesId/export")
  @Header("content-type", "text/markdown; charset=utf-8")
  export(@Req() request: FastifyRequest, @Param("minutesId") minutesId: string): string {
    return this.minutes.exportMarkdown(auth(request), minutesId);
  }
}

function auth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException();
  }
  return request.authContext;
}

function readSave(body: unknown): SaveMeetingMinutesDto {
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationDomainException("Minutes payload is invalid.");
  }
  const dto: SaveMeetingMinutesDto = {
    title: parsed.data.title,
    markdownBody: parsed.data.markdownBody,
    decisions: parsed.data.decisions,
  };
  if (parsed.data.minutesId === undefined) {
    return dto;
  }
  return { ...dto, minutesId: parseUuidV7(parsed.data.minutesId) };
}
