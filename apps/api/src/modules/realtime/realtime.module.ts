import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WorkspaceGateway } from "./workspace.gateway.js";

@Module({
  imports: [AuthModule],
  providers: [WorkspaceGateway],
  exports: [WorkspaceGateway],
})
export class RealtimeModule {}
