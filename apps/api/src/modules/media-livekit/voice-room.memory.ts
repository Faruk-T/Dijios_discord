export interface VoiceMember {
  userId: string;
  displayName: string;
  speaking: boolean;
  selfMuted: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
}

export interface VoiceRoomRecord {
  readonly institutionId: string;
  readonly channelId: string;
  readonly roomName: string;
  readonly members: VoiceMember[];
}

export class InMemoryVoiceRooms {
  private readonly rooms = new Map<string, VoiceRoomRecord>();

  ensure(institutionId: string, channelId: string, roomName: string): VoiceRoomRecord {
    const existing = this.rooms.get(channelId);
    if (existing !== undefined) {
      return existing;
    }
    const created: VoiceRoomRecord = { institutionId, channelId, roomName, members: [] };
    this.rooms.set(channelId, created);
    return created;
  }

  byRoomName(roomName: string): VoiceRoomRecord | null {
    return [...this.rooms.values()].find((room) => room.roomName === roomName) ?? null;
  }

  join(room: VoiceRoomRecord, member: VoiceMember): void {
    const index = room.members.findIndex((item) => item.userId === member.userId);
    if (index >= 0) {
      room.members.splice(index, 1, member);
      return;
    }
    room.members.push(member);
  }

  leave(room: VoiceRoomRecord, userId: string): void {
    const index = room.members.findIndex((item) => item.userId === userId);
    if (index >= 0) {
      room.members.splice(index, 1);
    }
  }

  identities(channelId: string): readonly string[] {
    return this.rooms.get(channelId)?.members.map((member) => member.userId) ?? [];
  }
}
