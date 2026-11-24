import type { JSX } from "react";
import { Badge } from "truncgil-uxigl";
import { useWorkspaceStore } from "../servers-channels/workspace.store.js";

export function TeacherProfilePopover(): JSX.Element | null {
  const roster = useWorkspaceStore((state) => state.roster);
  const profileUserId = useWorkspaceStore((state) => state.profileUserId);
  const teacher = roster.find((item) => item.userId === profileUserId);
  if (teacher === undefined) {
    return null;
  }
  return (
    <aside className="hub-popover" role="dialog" aria-label={teacher.fullName}>
      <strong>{teacher.fullName}</strong>
      <div>{teacher.title}</div>
      <Badge>{teacher.branchName}</Badge>
      <p>{teacher.currentLesson ?? teacher.status}</p>
      <button
        type="button"
        onClick={() => {
          useWorkspaceStore.getState().openDirect(teacher);
        }}
      >
        Özel Mesaj
      </button>
      <button type="button">Sesli Odaya Davet Et</button>
    </aside>
  );
}
