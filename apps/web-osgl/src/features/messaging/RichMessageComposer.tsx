import type { JSX } from "react";
import { useState } from "react";
import { assertSafeFile } from "./file-name.policy.js";
import { useMessagingStore } from "./messaging.store.js";

export function RichMessageComposer({
  channelId,
  authorName,
  branch,
  parentId,
}: {
  readonly channelId: string;
  readonly authorName: string;
  readonly branch: string;
  readonly parentId: string | null;
}): JSX.Element {
  const send = useMessagingStore((state) => state.send);
  const setTyping = useMessagingStore((state) => state.setTyping);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="msg-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim().length === 0) return;
        void send(channelId, authorName, branch, value.trim(), parentId);
        setValue("");
      }}
    >
      <textarea
        aria-label="Mesaj"
        value={value}
        placeholder="Mesaj yazın. Enter gönderir."
        onChange={(event) => {
          setValue(event.target.value);
          setTyping(authorName);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <label className="msg-file-btn">
        📎 Dosya Ekle
        <input
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file === undefined) return;
            const safe = assertSafeFile(file.name, file.size);
            setError(safe.ok ? "" : safe.reason);
            if (safe.ok) setValue((current) => `${current} 📄 ${file.name}`.trim());
          }}
        />
      </label>
      <button type="button" onClick={() => setValue((current) => `${current} @Zeynep`.trim())}>
        @
      </button>
      <button type="submit">Gönder</button>
      {error.length > 0 ? <p>{error}</p> : null}
    </form>
  );
}
