import type {
  ChannelWithOccupants,
  PresenceStatus,
  PresenceUpdatedPayload,
  TeacherRosterEntry,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import { io } from "socket.io-client";
import type { ClientSession } from "../auth/auth-client.port.js";
import { SimulatedWorkspaceClient } from "./simulated-workspace.client.js";
import type {
  CreateChannelInput,
  WorkspaceClientPort,
  WorkspaceSnapshot,
} from "./workspace-client.port.js";

export class HttpWorkspaceClient implements WorkspaceClientPort {
  constructor(private readonly baseUrl: string) {}

  async load(session: ClientSession): Promise<WorkspaceSnapshot> {
    const [tree, roster] = await Promise.all([
      this.get(session, "/api/v1/workspaces/current/tree"),
      this.get(session, "/api/v1/workspaces/current/roster"),
    ]);
    if (!isTree(tree) || !Array.isArray(roster)) {
      throw new Error("Workspace payload is invalid.");
    }
    return { tree, roster: roster as readonly TeacherRosterEntry[] };
  }

  async createChannel(
    session: ClientSession,
    input: CreateChannelInput,
  ): Promise<ChannelWithOccupants> {
    const slug = input.name
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");
    const response = await fetch(`${this.baseUrl}/api/v1/workspaces/current/channels`, {
      method: "POST",
      credentials: "include",
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        slug: slug.length > 0 ? slug : "kanal",
        type: input.type,
        categoryId: input.categoryId,
        branchName: session.branchName,
      }),
    });
    return response.json() as Promise<ChannelWithOccupants>;
  }

  async setPresence(session: ClientSession, status: PresenceStatus): Promise<void> {
    await fetch(`${this.baseUrl}/api/v1/workspaces/current/presence`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
  }

  subscribe(
    session: ClientSession,
    onPresence: (payload: PresenceUpdatedPayload) => void,
  ): () => void {
    const socket = io(this.baseUrl, {
      auth: { token: session.accessToken },
      transports: ["websocket"],
    });
    socket.on("presence:updated", onPresence);
    return () => {
      socket.close();
    };
  }

  private async get(session: ClientSession, path: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: { authorization: `Bearer ${session.accessToken}` },
    });
    return response.json() as Promise<unknown>;
  }
}

function isTree(value: unknown): value is WorkspaceTreeResponse {
  return typeof value === "object" && value !== null && "categories" in value;
}

export function createWorkspaceClient(): WorkspaceClientPort {
  if (import.meta.env.VITE_AUTH_CLIENT === "simulated") {
    return new SimulatedWorkspaceClient();
  }
  return new HttpWorkspaceClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000");
}
