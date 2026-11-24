import type { CampusBroadcastAlert, Student360Summary } from "@dijios-connect/contracts";
import { Body, Controller, Get, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { CampusBroadcastService } from "./campus-broadcast.service.js";
import { StudentSummaryService } from "./student-summary.service.js";

const broadcastSchema = z.object({ message: z.string().min(1) });

@Controller()
export class DijiosBridgeController {
  constructor(
    @Inject(StudentSummaryService) private readonly students: StudentSummaryService,
    @Inject(CampusBroadcastService) private readonly broadcasts: CampusBroadcastService,
  ) {}

  @Get("dijios-bridge/students/:studentCode")
  student(
    @Req() request: FastifyRequest,
    @Param("studentCode") studentCode: string,
  ): Student360Summary {
    return this.students.summarize(auth(request), studentCode);
  }

  @Post("workspaces/current/broadcast")
  publish(@Req() request: FastifyRequest, @Body() body: unknown): CampusBroadcastAlert {
    const parsed = broadcastSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationDomainException("Broadcast payload is invalid.");
    }
    return this.broadcasts.publish(auth(request), parsed.data.message);
  }
}

function auth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException();
  }
  return request.authContext;
}
