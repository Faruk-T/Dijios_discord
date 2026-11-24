import type { JSX } from "react";
import { useState } from "react";
import { Modal } from "truncgil-uxigl";
import { useWorkspaceStore } from "../servers-channels/workspace.store.js";
import { useMessagingStore } from "./messaging.store.js";

export function MessageSearchModal(): JSX.Element {
  const open = useMessagingStore((state) => state.searchOpen);
  const setOpen = useMessagingStore((state) => state.setSearchOpen);
  const search = useMessagingStore((state) => state.search);
  const hits = useMessagingStore((state) => state.hits);
  const select = useWorkspaceStore((state) => state.selectChannel);
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Mesaj ara" size="md">
      <form
        className="msg-search"
        onSubmit={(event) => {
          event.preventDefault();
          void search(query);
        }}
      >
        <input
          aria-label="Arama"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Ara</button>
      </form>
      <ul>
        {hits.map((hit) => (
          <li key={hit.id}>
            <button
              type="button"
              onClick={() => {
                select(hit.channelId);
                setOpen(false);
              }}
            >
              {hit.authorName}: {hit.content}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
