import type { MessageSearchHit } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import { DepartmentProvisionerService } from "../workspaces/department-provisioner.service.js";
import { ChannelAccessService } from "./channel-access.service.js";
import { MESSAGE_STORE_PORT, type MessageStorePort } from "./message-store.port.js";

@Injectable()
export class SearchService {
  constructor(
    @Inject(MESSAGE_STORE_PORT) private readonly store: MessageStorePort,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(DepartmentProvisionerService)
    private readonly provisioner: DepartmentProvisionerService,
  ) {}

  search(auth: AuthContext, query: string): readonly MessageSearchHit[] {
    const needle = query.toLocaleLowerCase("tr-TR");
    const workspace = this.provisioner.ensure(auth.institutionId, "Kurum");
    return this.store.all().flatMap((message) => {
      if (message.institutionId !== auth.institutionId || message.deletedAt !== null) {
        return [];
      }
      const channel = workspace.channels.find((item) => item.id === message.channelId);
      if (channel === undefined) {
        return [];
      }
      try {
        this.access.require(auth, channel.id, false);
      } catch {
        return [];
      }
      const file = message.attachments.some((item) =>
        item.fileName.toLocaleLowerCase("tr-TR").includes(needle),
      );
      if (!message.content.toLocaleLowerCase("tr-TR").includes(needle) && !file) {
        return [];
      }
      return [
        {
          channelId: parseUuidV7(channel.id),
          channelName: channel.name,
          messageId: parseUuidV7(message.id),
          excerpt: message.content,
        },
      ];
    });
  }
}
