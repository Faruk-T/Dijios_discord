import type { IsoTimestamp, Ulid, UuidV7 } from "./primitives.contracts.js";

export interface MeetingDecisionItem {
  readonly id: string;
  readonly text: string;
  readonly ownerName: string;
  readonly done: boolean;
}

export interface MeetingMinutesDocument {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly institutionId: UuidV7;
  readonly channelId: UuidV7;
  readonly title: string;
  readonly markdownBody: string;
  readonly decisions: readonly MeetingDecisionItem[];
  readonly attendees: readonly string[];
  readonly createdBy: UuidV7;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
}

export interface SaveMeetingMinutesDto {
  readonly title: string;
  readonly markdownBody: string;
  readonly decisions: readonly MeetingDecisionItem[];
  readonly minutesId?: UuidV7;
}
