import { Module } from "@nestjs/common";
import { RealtimeModule } from "../realtime/realtime.module.js";
import { RbacModule } from "../rbac/rbac.module.js";
import { WorkspacesModule } from "../workspaces/workspaces.module.js";
import { ChannelAccessService } from "./channel-access.service.js";
import { InMemoryMessageStore } from "./in-memory-message.store.js";
import { MESSAGE_STORE_PORT } from "./message-store.port.js";
import { MessagesController } from "./messages.controller.js";
import { MessagesService } from "./messages.service.js";
import { PinsService } from "./pins.service.js";
import { ReactionsService } from "./reactions.service.js";
import { SearchService } from "./search.service.js";
import { ThreadsService } from "./threads.service.js";
import { UnreadTrackerService } from "./unread-tracker.service.js";

@Module({
  imports: [RealtimeModule, RbacModule, WorkspacesModule],
  controllers: [MessagesController],
  providers: [
    ChannelAccessService,
    MessagesService,
    ReactionsService,
    ThreadsService,
    PinsService,
    UnreadTrackerService,
    SearchService,
    { provide: MESSAGE_STORE_PORT, useClass: InMemoryMessageStore },
  ],
  exports: [MessagesService, MESSAGE_STORE_PORT],
})
export class MessagingModule {}
