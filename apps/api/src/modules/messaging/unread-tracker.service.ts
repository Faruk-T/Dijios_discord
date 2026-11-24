import type { ChannelUnreadSummary } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { ChannelAccessService } from "./channel-access.service.js";
import { MESSAGE_STORE_PORT, type MessageStorePort } from "./message-store.port.js";

@Injectable()
export class UnreadTrackerService {
  private readonly lastRead = new Map<string, string>();

  constructor(
    @Inject(MESSAGE_STORE_PORT) private readonly store: MessageStorePort,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort,
  ) {}

  mark(auth: AuthContext, channelId: string): ChannelUnreadSummary {
    const channel = this.access.require(auth, channelId, false);
    this.store.ensureSeed(channel.id, channel.institutionId, channel.slug);
    const newest = this.store.page(channel.id, null, null, 1)[0];
    if (newest !== undefined) {
      this.lastRead.set(this.key(auth.userId, channel.id), newest.id);
    }
    return this.summary(auth, channel.id);
  }

  summary(auth: AuthContext, channelId: string): ChannelUnreadSummary {
    const channel = this.access.require(auth, channelId, false);
    this.store.ensureSeed(channel.id, channel.institutionId, channel.slug);
    const cursor = this.lastRead.get(this.key(auth.userId, channel.id)) ?? "";
    const pending = this.store
      .page(channel.id, null, null, 100)
      .filter((item) => item.id > cursor && item.authorId !== auth.userId);
    const teacher = this.directory.findTeacherById(auth.userId);
    const first = teacher?.fullName.split(" ")[0] ?? "";
    return {
      channelId: parseUuidV7(channel.id),
      unreadCount: pending.length,
      mentionCount: pending.filter(
        (item) =>
          item.content.includes(`@${auth.branchName}`) ||
          (first.length > 0 && item.content.includes(`@${first}`)),
      ).length,
    };
  }

  private key(userId: string, channelId: string): string {
    return `${userId}:${channelId}`;
  }
}
