import type { ChannelType } from "@dijios-connect/contracts";

export interface StoredCategory {
  readonly id: string;
  readonly publicId: string;
  readonly name: string;
  readonly position: number;
}

export interface StoredChannel {
  readonly id: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly categoryId: string;
  readonly slug: string;
  readonly name: string;
  readonly topic: string | null;
  readonly type: ChannelType;
  readonly branchName: string | null;
  readonly isPrivate: boolean;
  readonly isPdrConfidential: boolean;
  readonly maxParticipants: number | null;
  readonly position: number;
}

export interface StoredWorkspace {
  readonly id: string;
  readonly publicId: string;
  readonly institutionId: string;
  readonly name: string;
  readonly categories: readonly StoredCategory[];
  readonly channels: readonly StoredChannel[];
}

export interface WorkspaceStorePort {
  findByInstitution(institutionId: string): StoredWorkspace | null;
  save(workspace: StoredWorkspace): void;
}

export const WORKSPACE_STORE_PORT = Symbol("WORKSPACE_STORE_PORT");
