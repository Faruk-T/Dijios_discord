import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { ChatEvents } from "./chat-events.js";
import { PresenceService } from "./presence.service.js";
import { WorkspaceGateway } from "./workspace.gateway.js";

@Module({
  imports: [AuthModule],
  providers: [WorkspaceGateway, PresenceService, ChatEvents],
  exports: [WorkspaceGateway, PresenceService, ChatEvents],
})
export class RealtimeModule {}
