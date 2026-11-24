import type {
  MessageDeletedPayload,
  MessageSummary,
  TypingBroadcastPayload,
} from "@dijios-connect/contracts";
import { Injectable } from "@nestjs/common";

interface ChatSink {
  created: (institutionId: string, message: MessageSummary) => void;
  updated: (institutionId: string, message: MessageSummary) => void;
  deleted: (institutionId: string, payload: MessageDeletedPayload) => void;
  typing: (institutionId: string, payload: TypingBroadcastPayload) => void;
}

@Injectable()
export class ChatEvents {
  private sink: ChatSink | null = null;

  bind(sink: ChatSink): void {
    this.sink = sink;
  }

  created(institutionId: string, message: MessageSummary): void {
    this.sink?.created(institutionId, message);
  }

  updated(institutionId: string, message: MessageSummary): void {
    this.sink?.updated(institutionId, message);
  }

  deleted(institutionId: string, payload: MessageDeletedPayload): void {
    this.sink?.deleted(institutionId, payload);
  }

  typing(institutionId: string, payload: TypingBroadcastPayload): void {
    this.sink?.typing(institutionId, payload);
  }
}
