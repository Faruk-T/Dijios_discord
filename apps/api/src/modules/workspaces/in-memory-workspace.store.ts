import { Injectable } from "@nestjs/common";
import type { StoredWorkspace, WorkspaceStorePort } from "./workspace-store.port.js";

@Injectable()
export class InMemoryWorkspaceStore implements WorkspaceStorePort {
  private readonly workspaces = new Map<string, StoredWorkspace>();

  findByInstitution(institutionId: string): StoredWorkspace | null {
    return this.workspaces.get(institutionId) ?? null;
  }

  list(): readonly StoredWorkspace[] {
    return [...this.workspaces.values()];
  }

  save(workspace: StoredWorkspace): void {
    this.workspaces.set(workspace.institutionId, workspace);
  }
}
