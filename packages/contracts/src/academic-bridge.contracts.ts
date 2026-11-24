import type { IsoTimestamp, Ulid, UuidV7 } from "./primitives.contracts.js";

export interface Student360Summary {
  readonly studentCode: string;
  readonly fullName: string;
  readonly gradeLabel: string;
  readonly gpa: number;
  readonly attendanceRate: number;
  readonly examTrend: string;
  readonly academicAlert: string | null;
  readonly pdrConfidentialNote: string | null;
}

export interface QuickPollOption {
  readonly label: string;
  readonly votes: number;
}

export interface QuickPollPayload {
  readonly title: string;
  readonly options: readonly QuickPollOption[];
}

export interface CampusBroadcastAlert {
  readonly id: Ulid;
  readonly message: string;
  readonly publishedAt: IsoTimestamp;
  readonly publishedBy: UuidV7;
}
