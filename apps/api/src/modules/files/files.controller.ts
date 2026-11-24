import { Body, Controller, Get, Inject, Param, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  UnauthorizedDomainException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { FilesService } from "./files.service.js";

const presignSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

@Controller()
export class FilesController {
  constructor(@Inject(FilesService) private readonly files: FilesService) {}

  @Post("channels/:channelId/attachments/presign")
  presign(
    @Req() request: FastifyRequest,
    @Param("channelId") channelId: string,
    @Body() body: unknown,
  ) {
    const parsed = presignSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationDomainException("Attachment payload is invalid.");
    }
    return this.files.presign(
      auth(request),
      channelId,
      parsed.data.fileName,
      parsed.data.mimeType,
      parsed.data.sizeBytes,
    );
  }

  @Get("attachments/:attachmentId/download-url")
  download(@Req() request: FastifyRequest, @Param("attachmentId") attachmentId: string) {
    return this.files.download(auth(request), attachmentId);
  }
}

function auth(request: FastifyRequest): AuthContext {
  if (request.authContext === undefined) {
    throw new UnauthorizedDomainException();
  }
  return request.authContext;
}
