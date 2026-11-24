import type {
  ClientToServerEvents,
  PresenceStatus,
  ServerToClientEvents,
} from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { parseUuidV7 } from "../../common/ids/id-generator.js";
import { TokenService } from "../auth/token.service.js";
import { CampusAlertEvents } from "./campus-alert.events.js";
import { ChatEvents } from "./chat-events.js";
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
    @Inject(ChatEvents) private readonly chat: ChatEvents,
    @Inject(CampusAlertEvents) private readonly campus: CampusAlertEvents,
  ) {
    this.presence.bind({
      presence: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("presence:updated", payload);
      },
      voice: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("voice:room_state_updated", payload);
      },
    });
    this.chat.bind({
      created: (institutionId, message) => {
        this.server.to(`institution:${institutionId}`).emit("chat:message_created", message);
      },
      updated: (institutionId, message) => {
        this.server.to(`institution:${institutionId}`).emit("chat:message_updated", message);
      },
      deleted: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("chat:message_deleted", payload);
      },
      typing: (institutionId, payload) => {
        this.server.to(`institution:${institutionId}`).emit("chat:typing", payload);
      },
    });
    this.campus.bind({
      publish: (institutionId, alert) => {
        this.server.to(`institution:${institutionId}`).emit("campus:broadcast", alert);
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

  @SubscribeMessage("chat:typing_start")
  onTyping(client: ConnectSocket, payload: { readonly channelId?: unknown }): void {
    const session = this.sessions.get(client.id);
    if (session === undefined || typeof payload.channelId !== "string") {
      return;
    }
    this.chat.typing(session.institutionId, {
      channelId: parseUuidV7(payload.channelId),
      userId: parseUuidV7(session.userId),
      active: true,
    });
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
