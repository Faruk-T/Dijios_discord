import type {
  ChannelUnreadSummary,
  MessageSearchHit,
  MessageSummary,
} from "@dijios-connect/contracts";
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { MessagesService } from "./messages.service.js";
import { PinsService } from "./pins.service.js";
import { ReactionsService } from "./reactions.service.js";
import { SearchService } from "./search.service.js";
import { ThreadsService } from "./threads.service.js";
import { UnreadTrackerService } from "./unread-tracker.service.js";

@Controller()
export class MessagesController {
  constructor(
    @Inject(MessagesService) private readonly messages: MessagesService,
    @Inject(ReactionsService) private readonly reactions: ReactionsService,
    @Inject(ThreadsService) private readonly threads: ThreadsService,
    @Inject(PinsService) private readonly pins: PinsService,
    @Inject(UnreadTrackerService) private readonly unread: UnreadTrackerService,
    @Inject(SearchService) private readonly search: SearchService,
  ) {}

  @Get("channels/:channelId/messages")
  page(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ): MessageSummary[] {
    return this.messages.page(auth(request), channelId, cursor ?? null, numberLimit(limit));
  }

  @Post("channels/:channelId/messages")
  create(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
    @Body() body: unknown,
  ): MessageSummary {
    const content = z.object({ content: z.string().min(1) }).parse(body);
    return this.messages.create(auth(request), channelId, content.content, null);
  }

  @Patch("messages/:messageId")
  update(
    @Req() request: FastifyRequest,
    @Param("messageId") messageId: string,
    @Body() body: unknown,
  ): MessageSummary {
    const content = z.object({ content: z.string().min(1) }).parse(body);
    return this.messages.update(auth(request), messageId, content.content);
  }

  @Delete("messages/:messageId")
  remove(@Req() request: FastifyRequest, @Param("messageId") messageId: string): { ok: true } {
    this.messages.remove(auth(request), messageId);
    return { ok: true };
  }

  @Post("messages/:messageId/reactions")
  react(
    @Req() request: FastifyRequest,
    @Param("messageId") messageId: string,
    @Body() body: unknown,
  ): MessageSummary {
    const emoji = z.object({ emoji: z.string().min(1) }).parse(body);
    return this.reactions.toggle(auth(request), messageId, emoji.emoji);
  }

  @Get("messages/:messageId/thread")
  thread(
    @Req() request: FastifyRequest,
    @Param("messageId") messageId: string,
  ): readonly MessageSummary[] {
    return this.threads.list(auth(request), messageId);
  }

  @Post("messages/:messageId/thread")
  reply(
    @Req() request: FastifyRequest,
    @Param("messageId") messageId: string,
    @Body() body: unknown,
  ): MessageSummary {
    const content = z.object({ content: z.string().min(1) }).parse(body);
    return this.threads.reply(auth(request), messageId, content.content);
  }

  @Post("messages/:messageId/pin")
  pin(@Req() request: FastifyRequest, @Param("messageId") messageId: string): MessageSummary {
    return this.pins.pin(auth(request), messageId);
  }

  @Get("channels/:channelId/pins")
  pinsOf(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
  ): readonly MessageSummary[] {
    return this.pins.list(auth(request), channelId);
  }

  @Post("channels/:channelId/read")
  read(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
  ): ChannelUnreadSummary {
    return this.unread.mark(auth(request), channelId);
  }

  @Get("workspaces/current/messages/search")
  find(@Req() request: FastifyRequest, @Query("q") query?: string): readonly MessageSearchHit[] {
    if (query === undefined || query.trim().length === 0) {
      throw new ValidationDomainException("Search query is required.");
    }
    return this.search.search(auth(request), query);
  }
}

function auth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException();
  }
  return request.authContext;
}

function numberLimit(limit: string | undefined): number {
  const parsed = Number(limit ?? "30");
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 50) : 30;
}
