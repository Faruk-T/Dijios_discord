import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { PresenceService } from "./presence.service.js";
import { WorkspaceGateway } from "./workspace.gateway.js";

@Module({
  imports: [AuthModule],
  providers: [WorkspaceGateway, PresenceService],
  exports: [WorkspaceGateway, PresenceService],
})
export class RealtimeModule {}
