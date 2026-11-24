import type { ChannelType } from "@dijios-connect/contracts";
import type { JSX } from "react";
import { useState } from "react";
import { Input, Modal } from "truncgil-uxigl";
import { useAuthStore } from "../auth/auth.store.js";
import { useWorkspaceStore } from "./workspace.store.js";

const TYPES: readonly ChannelType[] = ["TEXT", "VOICE", "ANNOUNCEMENT", "VIDEO_STAGE"];

export function CreateChannelModal(): JSX.Element | null {
  const session = useAuthStore((state) => state.session);
  const open = useWorkspaceStore((state) => state.createOpen);
  const setOpen = useWorkspaceStore((state) => state.setCreateOpen);
  const tree = useWorkspaceStore((state) => state.tree);
  const createChannel = useWorkspaceStore((state) => state.createChannel);
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("TEXT");
  const [categoryId, setCategoryId] = useState("");
  if (session === null) {
    return null;
  }
  const selected = categoryId.length > 0 ? categoryId : (tree?.categories[0]?.id ?? "");
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Yeni kanal" size="sm">
      <form
        className="hub-modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length === 0 || selected.length === 0) {
            return;
          }
          void createChannel(session, { name: name.trim(), type, categoryId: selected });
        }}
      >
        <Input label="Kanal adı" value={name} onChange={setName} required />
        <label>
          Tür
          <select
            value={type}
            onChange={(event) => {
              const next = TYPES.find((item) => item === event.target.value);
              if (next !== undefined) {
                setType(next);
              }
            }}
          >
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kategori
          <select value={selected} onChange={(event) => setCategoryId(event.target.value)}>
            {tree?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Kanalı aç</button>
      </form>
    </Modal>
  );
}
