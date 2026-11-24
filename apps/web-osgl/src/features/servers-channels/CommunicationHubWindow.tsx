import type { JSX } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../auth/auth.store.js";
import { MemberRosterPanel } from "../presence-timetable/MemberRosterPanel.js";
import { ActiveChannelStage } from "./ActiveChannelStage.js";
import { CampusIconRail } from "./CampusIconRail.js";
import { ChannelTreeSidebar } from "./ChannelTreeSidebar.js";
import { VoiceQuickFooterBar } from "./VoiceQuickFooterBar.js";
import { useWorkspaceStore } from "./workspace.store.js";

export function CommunicationHubWindow(): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const load = useWorkspaceStore((state) => state.load);
  const rosterOpen = useWorkspaceStore((state) => state.rosterOpen);
  useEffect(() => {
    if (session !== null) {
      void load(session);
    }
  }, [load, session]);
  return (
    <div className={rosterOpen ? "hub" : "hub is-roster-closed"}>
      <CampusIconRail />
      <div className="hub-tree">
        <ChannelTreeSidebar />
        <VoiceQuickFooterBar />
      </div>
      <ActiveChannelStage />
      {rosterOpen ? <MemberRosterPanel /> : null}
    </div>
  );
}
