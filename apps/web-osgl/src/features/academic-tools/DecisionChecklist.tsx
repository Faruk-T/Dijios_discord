import type { JSX } from "react";
import { useState } from "react";
import type { LocalDecision } from "./minutes-markdown.js";

const OWNERS = [
  "Zeynep Başaran",
  "Can Fizik",
  "Mehmet Müdür",
  "Elif Rehber",
  "Ayşe Kurucu",
] as const;

export function DecisionChecklist({
  decisions,
  onToggle,
  onAdd,
}: {
  readonly decisions: readonly LocalDecision[];
  readonly onToggle: (id: string) => void;
  readonly onAdd: (text: string, ownerName: string) => void;
}): JSX.Element {
  const [text, setText] = useState("11. Sınıf ortak türev taraması Cuma 3. ders uygulanacak");
  const [owner, setOwner] = useState<string>(OWNERS[0]);
  return (
    <section className="minutes-decisions" aria-label="Karar listesi">
      <ul>
        {decisions.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
              <span>
                {item.text} — Sorumlu: {item.ownerName}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <label>
        Karar
        <input
          aria-label="Karar metni"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <label>
        Sorumlu
        <select
          aria-label="Sorumlu öğretmen"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        >
          {OWNERS.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => {
          if (text.trim().length === 0) return;
          onAdd(text.trim(), owner);
        }}
      >
        Karar ekle
      </button>
    </section>
  );
}
