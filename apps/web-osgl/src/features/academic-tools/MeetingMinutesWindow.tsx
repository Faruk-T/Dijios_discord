import type { JSX } from "react";
import { useState } from "react";
import { Badge, Card } from "truncgil-uxigl";
import { DecisionChecklist } from "./DecisionChecklist.js";
import { publishMinutes, renderLocalMinutes, type LocalDecision } from "./minutes-markdown.js";

const ATTENDEES = ["Zeynep Başaran", "Can Fizik", "Ayşe Kurucu"] as const;

export function MeetingMinutesWindow(): JSX.Element {
  const [notes, setNotes] = useState("11. sınıf türev taraması ve ortak sınav takvimi görüşüldü.");
  const [decisions, setDecisions] = useState<readonly LocalDecision[]>([
    {
      id: "karar-turev",
      text: "11. Sınıf ortak türev taraması Cuma 3. ders uygulanacak",
      ownerName: "Zeynep Başaran",
      done: true,
    },
  ]);
  const [official, setOfficial] = useState("");
  const markdown = renderLocalMinutes({ notes, attendees: ATTENDEES, decisions });
  return (
    <div className="minutes-window">
      <Card padding="md">
        <Badge size="sm" variant="tonal">
          MEB tutanağı
        </Badge>
        <h2>Matematik Zümre Tutanağı</h2>
        <p>Katılımcılar: {ATTENDEES.join(", ")}</p>
        <label>
          Gündem notu
          <textarea
            aria-label="Gündem notu"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <DecisionChecklist
          decisions={decisions}
          onToggle={(id) =>
            setDecisions((current) =>
              current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
            )
          }
          onAdd={(text, ownerName) =>
            setDecisions((current) => [
              ...current,
              { id: `karar-${current.length + 1}`, text, ownerName, done: false },
            ])
          }
        />
        <button
          type="button"
          onClick={() => {
            setOfficial(markdown);
            publishMinutes(markdown);
          }}
        >
          📄 Resmi Tutanak İndir / Kopyala
        </button>
        {official.length > 0 ? <pre aria-label="Resmi tutanak">{official}</pre> : null}
      </Card>
    </div>
  );
}
