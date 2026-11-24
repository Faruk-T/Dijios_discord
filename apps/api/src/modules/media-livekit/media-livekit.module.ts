import { Module } from "@nestjs/common";
import { MessagingModule } from "../messaging/messaging.module.js";
import { RealtimeModule } from "../realtime/realtime.module.js";
import { WorkspacesModule } from "../workspaces/workspaces.module.js";
import { VoiceRoomsController } from "./voice-rooms.controller.js";
import { VoiceRoomsService } from "./voice-rooms.service.js";

@Module({
  imports: [WorkspacesModule, MessagingModule, RealtimeModule],
  controllers: [VoiceRoomsController],
  providers: [VoiceRoomsService],
  exports: [VoiceRoomsService],
})
export class MediaLivekitModule {}
