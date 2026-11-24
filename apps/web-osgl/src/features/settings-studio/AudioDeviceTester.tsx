import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useVoiceSessionStore } from "../voice-video/voice-session.store.js";

export function AudioDeviceTester(): JSX.Element {
  const [mics, setMics] = useState<readonly string[]>(["Varsayılan mikrofon"]);
  const [speakers, setSpeakers] = useState<readonly string[]>(["Varsayılan hoparlör"]);
  const [level, setLevel] = useState(0);
  const noise = useVoiceSessionStore((state) => state.noiseSuppression);
  const setNoise = useVoiceSessionStore((state) => state.setNoiseSuppression);
  useEffect(() => {
    const devices = navigator.mediaDevices;
    if (devices?.enumerateDevices === undefined) {
      return;
    }
    void devices
      .enumerateDevices()
      .then((list) => {
        const inputs = list
          .filter((item) => item.kind === "audioinput")
          .map((item) => item.label || "Mikrofon");
        const outputs = list
          .filter((item) => item.kind === "audiooutput")
          .map((item) => item.label || "Hoparlör");
        if (inputs.length > 0) {
          setMics(inputs);
        }
        if (outputs.length > 0) {
          setSpeakers(outputs);
        }
      })
      .catch(() => undefined);
  }, []);
  return (
    <div className="studio">
      <label>
        Mikrofon
        <select aria-label="Mikrofon">
          {mics.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Hoparlör
        <select aria-label="Hoparlör">
          {speakers.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <meter aria-label="Mikrofon seviyesi">
        <i style={{ width: `${level}%` }} />
      </meter>
      <button type="button" onClick={() => setLevel(64)}>
        Mikrofonu dene
      </button>
      <button type="button" onClick={() => setNoise(!noise)}>
        {noise ? "Gürültü engelleme açık" : "Gürültü engelleme kapalı"}
      </button>
    </div>
  );
}
