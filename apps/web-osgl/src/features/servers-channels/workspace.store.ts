import { create } from "zustand";
import type {
  PresenceStatus,
  TeacherRosterEntry,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import type { ClientSession } from "../auth/auth-client.port.js";
import { createWorkspaceClient } from "./http-workspace.client.js";
import type { CreateChannelInput, WorkspaceClientPort } from "./workspace-client.port.js";

export type ChannelFilter = "all" | "branch" | "voice" | "announcements";

export interface WorkspaceState {
  readonly client: WorkspaceClientPort;
  readonly tree: WorkspaceTreeResponse | null;
  readonly roster: readonly TeacherRosterEntry[];
  readonly activeChannelId: string | null;
  readonly filter: ChannelFilter;
  readonly rosterOpen: boolean;
  readonly profileUserId: string | null;
  readonly muted: boolean;
  readonly deafened: boolean;
  readonly status: PresenceStatus;
  readonly createOpen: boolean;
  load: (session: ClientSession) => Promise<void>;
  setCreateOpen: (open: boolean) => void;
  createChannel: (session: ClientSession, input: CreateChannelInput) => Promise<void>;
  selectChannel: (channelId: string) => void;
  setFilter: (filter: ChannelFilter) => void;
  toggleRoster: () => void;
  openProfile: (userId: string | null) => void;
  setMuted: (muted: boolean) => void;
  setDeafened: (deafened: boolean) => void;
  setStatus: (session: ClientSession, status: PresenceStatus) => Promise<void>;
}

let stopPresence: (() => void) | null = null;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  client: createWorkspaceClient(),
  tree: null,
  roster: [],
  activeChannelId: null,
  filter: "all",
  rosterOpen: true,
  profileUserId: null,
  muted: false,
  deafened: false,
  status: "ONLINE",
  createOpen: false,
  load: async (session) => {
    stopPresence?.();
    const snapshot = await get().client.load(session);
    const first = snapshot.tree.categories[0]?.channels[0]?.id ?? null;
    stopPresence = get().client.subscribe(session, (payload) => {
      set({
        roster: get().roster.map((teacher) =>
          teacher.userId === payload.userId
            ? { ...teacher, status: payload.status, currentLesson: payload.currentLesson }
            : teacher,
        ),
      });
    });
    set({
      tree: snapshot.tree,
      roster: snapshot.roster,
      activeChannelId: first,
      profileUserId: null,
    });
  },
  setCreateOpen: (createOpen) => set({ createOpen }),
  createChannel: async (session, input) => {
    const channel = await get().client.createChannel(session, input);
    const tree = get().tree;
    if (tree === null || channel.categoryId === null) {
      return;
    }
    set({
      createOpen: false,
      activeChannelId: channel.id,
      tree: {
        ...tree,
        categories: tree.categories.map((category) =>
          category.id === channel.categoryId
            ? { ...category, channels: [...category.channels, channel] }
            : category,
        ),
      },
    });
  },
  selectChannel: (activeChannelId) => set({ activeChannelId }),
  setFilter: (filter) => set({ filter }),
  toggleRoster: () => set({ rosterOpen: !get().rosterOpen }),
  openProfile: (profileUserId) => set({ profileUserId }),
  setMuted: (muted) => set({ muted }),
  setDeafened: (deafened) => set({ deafened }),
  setStatus: async (session, status) => {
    await get().client.setPresence(session, status);
    set({ status });
  },
}));
