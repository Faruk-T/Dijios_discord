import type {
  PresenceStatus,
  PresenceUpdatedPayload,
  TeacherRosterEntry,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import type { ClientSession } from "../auth/auth-client.port.js";

export interface WorkspaceSnapshot {
  readonly tree: WorkspaceTreeResponse;
  readonly roster: readonly TeacherRosterEntry[];
}

export interface WorkspaceClientPort {
  load(session: ClientSession): Promise<WorkspaceSnapshot>;
  setPresence(session: ClientSession, status: PresenceStatus): Promise<void>;
  subscribe(
    session: ClientSession,
    onPresence: (payload: PresenceUpdatedPayload) => void,
  ): () => void;
}
