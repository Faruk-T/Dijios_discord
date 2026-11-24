import type {
  ChannelWithOccupants,
  PresenceStatus,
  PresenceUpdatedPayload,
} from "@dijios-connect/contracts";
import type { ClientSession } from "../auth/auth-client.port.js";
import type {
  CreateChannelInput,
  WorkspaceClientPort,
  WorkspaceSnapshot,
} from "./workspace-client.port.js";
import { createdChannel } from "./workspace-channel.fixtures.js";
import { simulatedTree } from "./workspace-fixtures.js";
import { simulatedRoster } from "./workspace-roster.fixtures.js";

const CREATORS = new Set(["FOUNDER", "PRINCIPAL", "DEPT_HEAD"]);

export class SimulatedWorkspaceClient implements WorkspaceClientPort {
  private readonly extras: ChannelWithOccupants[] = [];

  load(session: ClientSession): Promise<WorkspaceSnapshot> {
    const tree = simulatedTree(session.systemRole);
    return Promise.resolve({
      tree: {
        ...tree,
        categories: tree.categories.map((category) => ({
          ...category,
          channels: [
            ...category.channels,
            ...this.extras.filter((item) => item.categoryId === category.id),
          ],
        })),
      },
      roster: simulatedRoster(),
    });
  }

  createChannel(session: ClientSession, input: CreateChannelInput): Promise<ChannelWithOccupants> {
    if (!CREATORS.has(session.systemRole)) {
      return Promise.reject(new Error("Channel creation is not allowed."));
    }
    const channel = createdChannel(input.categoryId, input.name, input.type, session.branchName);
    this.extras.push(channel);
    return Promise.resolve(channel);
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
