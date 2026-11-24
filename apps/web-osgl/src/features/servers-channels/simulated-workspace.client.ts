import type { PresenceStatus, PresenceUpdatedPayload } from "@dijios-connect/contracts";
import type { ClientSession } from "../auth/auth-client.port.js";
import type { WorkspaceClientPort, WorkspaceSnapshot } from "./workspace-client.port.js";
import { simulatedTree } from "./workspace-fixtures.js";
import { simulatedRoster } from "./workspace-roster.fixtures.js";

export class SimulatedWorkspaceClient implements WorkspaceClientPort {
  load(session: ClientSession): Promise<WorkspaceSnapshot> {
    return Promise.resolve({ tree: simulatedTree(session.systemRole), roster: simulatedRoster() });
  }

  setPresence(_session: ClientSession, _status: PresenceStatus): Promise<void> {
    return Promise.resolve();
  }

  subscribe(
    _session: ClientSession,
    _onPresence: (payload: PresenceUpdatedPayload) => void,
  ): () => void {
    return () => undefined;
  }
}
