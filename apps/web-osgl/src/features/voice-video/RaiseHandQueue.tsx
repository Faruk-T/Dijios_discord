import type { JSX } from "react";
import { useAuthStore } from "../auth/auth.store.js";
import { useVoiceSessionStore } from "./voice-session.store.js";

const LEADERS = new Set(["FOUNDER", "PRINCIPAL", "DEPT_HEAD"]);

export function RaiseHandQueue(): JSX.Element {
  const participants = useVoiceSessionStore((state) => state.participants);
  const lower = useVoiceSessionStore((state) => state.lowerHand);
  const role = useAuthStore((state) => state.session?.systemRole);
  const queue = participants.filter((item) => item.handRaised);
  const canGrant = role !== undefined && LEADERS.has(role);
  return (
    <aside className="stage-queue" aria-label="Söz isteyenler">
      <strong>✋ Söz İsteyenler ({queue.length})</strong>
      <ul>
        {queue.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            {canGrant ? (
              <button type="button" onClick={() => lower(item.id)}>
                Sözü ver
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
