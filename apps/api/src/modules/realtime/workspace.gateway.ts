import type {
  ClientToServerEvents,
  PresenceStatus,
  ServerToClientEvents,
} from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { TokenService } from "../auth/token.service.js";
import { PresenceService } from "./presence.service.js";
import { readHandshakeToken } from "./ws-auth.helper.js";

type ConnectSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface SocketSession {
  readonly userId: string;
  readonly institutionId: string;
}

@Injectable()
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class WorkspaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  readonly server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly sessions = new Map<string, SocketSession>();

  constructor(
    @Inject(TokenService) private readonly tokens: TokenService,
    @Inject(PresenceService) private readonly presence: PresenceService,
  ) {
    this.presence.bind({
      presence: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("presence:updated", payload);
      },
      voice: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("voice:room_state_updated", payload);
      },
    });
  }

  handleDisconnect(client: ConnectSocket): void {
    this.sessions.delete(client.id);
  }

  handleConnection(client: ConnectSocket): void {
    const token = readHandshakeToken(client.handshake);
    if (token === null) {
      client.disconnect(true);
      return;
    }
    try {
      const claims = this.tokens.verifyAccess(token);
      this.sessions.set(client.id, { userId: claims.sub, institutionId: claims.institutionId });
      void client.join(`institution:${claims.institutionId}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage("presence:heartbeat")
  onHeartbeat(client: ConnectSocket, payload: { readonly status?: unknown }): void {
    const session = this.sessions.get(client.id);
    if (session === undefined || !isPresenceStatus(payload.status)) {
      return;
    }
    this.presence.heartbeat(session.institutionId, session.userId, payload.status);
  }
}

function isPresenceStatus(value: unknown): value is PresenceStatus {
  return (
    value === "ONLINE" ||
    value === "IN_CLASS" ||
    value === "ON_DUTY" ||
    value === "IN_VOICE" ||
    value === "DND" ||
    value === "OFFLINE"
  );
}
