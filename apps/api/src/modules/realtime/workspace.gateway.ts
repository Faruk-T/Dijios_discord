import type { ClientToServerEvents, ServerToClientEvents } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { TokenService } from "../auth/token.service.js";
import { readHandshakeToken } from "./ws-auth.helper.js";

type ConnectSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@Injectable()
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class WorkspaceGateway implements OnGatewayConnection {
  @WebSocketServer()
  readonly server!: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(@Inject(TokenService) private readonly tokens: TokenService) {}

  handleConnection(client: ConnectSocket): void {
    const token = readHandshakeToken(client.handshake);
    if (token === null) {
      client.disconnect(true);
      return;
    }
    try {
      const claims = this.tokens.verifyAccess(token);
      void client.join(`institution:${claims.institutionId}`);
    } catch {
      client.disconnect(true);
    }
  }
}
