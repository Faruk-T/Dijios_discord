import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  TenantForbiddenException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { createUuidV7 } from "../../common/ids/id-generator.js";
import { ChannelAccessService } from "../messaging/channel-access.service.js";
import { assertSafeFile } from "./file-policy.validator.js";
import { OBJECT_STORAGE_PORT, type ObjectStoragePort } from "./object-storage.port.js";
import { presignedUrl } from "./s3-presign.helper.js";

const SECRET = "dijios-connect-minio";

@Injectable()
export class FilesService {
  constructor(
    @Inject(OBJECT_STORAGE_PORT) private readonly storage: ObjectStoragePort,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
  ) {}

  presign(
    auth: AuthContext,
    channelId: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
  ) {
    const channel = this.access.require(auth, channelId, true);
    const safeName = assertSafeFile(fileName, sizeBytes);
    const id = createUuidV7();
    const objectKey = `institutions/${auth.institutionId}/channels/${channel.id}/${id}-${safeName}`;
    this.storage.save({
      id,
      institutionId: auth.institutionId,
      channelId: channel.id,
      fileName: safeName,
      mimeType,
      sizeBytes,
      objectKey,
    });
    return { attachmentId: id, uploadUrl: presignedUrl("PUT", objectKey, SECRET), objectKey };
  }

  download(auth: AuthContext, attachmentId: string): { downloadUrl: string } {
    const object = this.storage.find(attachmentId);
    if (object === null) {
      throw new ValidationDomainException("Attachment was not found.");
    }
    if (object.institutionId !== auth.institutionId) {
      throw new TenantForbiddenException("Attachment belongs to another institution.");
    }
    return { downloadUrl: presignedUrl("GET", object.objectKey, SECRET) };
  }
}
