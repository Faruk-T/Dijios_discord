import type { JSX } from "react";
import { useState } from "react";

const OPTIONS = ["Cuma", "Pazartesi", "Salı"] as const;

export function ChannelPollCard({ title }: { readonly title: string }): JSX.Element {
  const [votes, setVotes] = useState<readonly number[]>([4, 2, 2]);
  const total = votes.reduce((sum, count) => sum + count, 0);
  return (
    <section className="poll-card" aria-label={title}>
      <strong>{title}</strong>
      {OPTIONS.map((label, index) => {
        const count = votes[index] ?? 0;
        const percent = total === 0 ? 0 : Math.round((count / total) * 100);
        return (
          <button
            key={label}
            type="button"
            onClick={() =>
              setVotes((current) =>
                current.map((item, itemIndex) => (itemIndex === index ? item + 1 : item)),
              )
            }
          >
            {label} %{percent}
            <span className="poll-bar" style={{ width: `${percent}%` }} />
          </button>
        );
      })}
    </section>
  );
}
