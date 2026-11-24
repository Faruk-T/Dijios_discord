import type { JSX } from "react";
import { useMessagingStore } from "./messaging.store.js";

const SHEET = "📊 11. Sınıflar Matematik Deneme Analiz Matrisi";
const POLL = "🗳️ Ortak Sınav Günü Seçimi";

export function ComposerShortcuts({
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
  return (
    <>
      <button
        type="button"
        onClick={() => void send(channelId, authorName, branch, SHEET, parentId)}
      >
        📊 Analiz Tablosu Paylaş
      </button>
      <button
        type="button"
        onClick={() => void send(channelId, authorName, branch, POLL, parentId)}
      >
        🗳️ Hızlı Oylama
      </button>
    </>
  );
}
