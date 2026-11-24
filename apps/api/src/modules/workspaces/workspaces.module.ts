import { Module } from "@nestjs/common";
import { RealtimeModule } from "../realtime/realtime.module.js";
import { RbacModule } from "../rbac/rbac.module.js";
import { DepartmentProvisionerService } from "./department-provisioner.service.js";
import { InMemoryWorkspaceStore } from "./in-memory-workspace.store.js";
import { WORKSPACE_STORE_PORT } from "./workspace-store.port.js";
import { PresenceController } from "../realtime/presence.controller.js";
import { WorkspacesController } from "./workspaces.controller.js";
import { WorkspacesService } from "./workspaces.service.js";

@Module({
  imports: [RbacModule, RealtimeModule],
  controllers: [WorkspacesController, PresenceController],
  providers: [
    DepartmentProvisionerService,
    WorkspacesService,
    { provide: WORKSPACE_STORE_PORT, useClass: InMemoryWorkspaceStore },
  ],
  exports: [DepartmentProvisionerService, WorkspacesService, WORKSPACE_STORE_PORT],
})
export class WorkspacesModule {}
