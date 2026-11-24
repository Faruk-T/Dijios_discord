import type { JSX } from "react";
import type { PresenceStatus, TeacherRosterEntry } from "@dijios-connect/contracts";
import { Avatar, Badge } from "truncgil-uxigl";
import { useWorkspaceStore } from "../servers-channels/workspace.store.js";
import { TeacherProfilePopover } from "./TeacherProfilePopover.js";

const GROUPS: readonly { readonly status: PresenceStatus; readonly label: string }[] = [
  { status: "IN_CLASS", label: "Derste" },
  { status: "IN_VOICE", label: "Sesli Odada" },
  { status: "ONLINE", label: "Çevrimiçi" },
  { status: "ON_DUTY", label: "Nöbette" },
];

function avatarStatus(status: PresenceStatus): "online" | "busy" | "away" {
  if (status === "DND" || status === "IN_CLASS") return "busy";
  if (status === "ON_DUTY") return "away";
  return "online";
}

export function MemberRosterPanel(): JSX.Element {
  const roster = useWorkspaceStore((state) => state.roster);
  const openProfile = useWorkspaceStore((state) => state.openProfile);
  return (
    <aside className="hub-roster" aria-label="Öğretmen kadrosu">
      {GROUPS.map((group) => {
        const people = roster.filter((teacher) => teacher.status === group.status);
        if (people.length === 0) return null;
        return (
          <section key={group.status}>
            <div className="hub-group">
              {group.label} — {people.length}
            </div>
            {people.map((teacher) => (
              <MemberRow
                key={teacher.userId}
                teacher={teacher}
                onOpen={openProfile}
                status={avatarStatus(teacher.status)}
              />
            ))}
          </section>
        );
      })}
      <TeacherProfilePopover />
    </aside>
  );
}

function MemberRow({
  teacher,
  onOpen,
  status,
}: {
  readonly teacher: TeacherRosterEntry;
  readonly onOpen: (userId: string) => void;
  readonly status: "online" | "busy" | "away";
}): JSX.Element {
  return (
    <button className="hub-member" type="button" onClick={() => onOpen(teacher.userId)}>
      <Avatar shape="squircle" size="sm" name={teacher.fullName} status={status} />
      <span>
        <strong>{teacher.fullName}</strong>
        <Badge size="sm">{teacher.branchName}</Badge>
        {teacher.currentLesson === null ? null : <small>{teacher.currentLesson}</small>}
      </span>
    </button>
  );
}
