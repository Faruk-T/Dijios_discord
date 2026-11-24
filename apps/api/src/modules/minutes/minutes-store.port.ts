import type { MeetingDecisionItem } from "@dijios-connect/contracts";

export const MINUTES_STORE_PORT = Symbol("MINUTES_STORE_PORT");

export interface StoredMinutes {
  id: string;
  publicId: string;
  institutionId: string;
  channelId: string;
  title: string;
  markdownBody: string;
  decisions: MeetingDecisionItem[];
  attendees: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MinutesStorePort {
  list(institutionId: string, channelId: string): readonly StoredMinutes[];
  find(institutionId: string, minutesId: string): StoredMinutes | null;
  save(record: StoredMinutes): StoredMinutes;
}
