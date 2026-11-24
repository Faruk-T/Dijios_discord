import type { JSX } from "react";
import { AudioDeviceTester } from "./AudioDeviceTester.js";
import { PttShortcutField } from "./PttShortcutField.js";

export function MediaStudioWindow(): JSX.Element {
  return (
    <section aria-label="Ses ve görüntü stüdyosu">
      <AudioDeviceTester />
      <PttShortcutField />
    </section>
  );
}
