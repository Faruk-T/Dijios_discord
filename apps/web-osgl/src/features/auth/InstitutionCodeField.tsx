import { GoogleIcon, Input, SegmentedControl } from "truncgil-uxigl";
import { useAuthStore } from "./auth.store.js";

type InstitutionMode = "fen-koleji" | "anadolu-lisesi" | "manual";

function modeFor(alias: string): InstitutionMode {
  if (alias === "fen-koleji" || alias === "anadolu-lisesi") {
    return alias;
  }
  return "manual";
}

const SCHOOLS = {
  "fen-koleji": { name: "Örnek Fen ve Teknoloji Koleji", color: "#002147" },
  "anadolu-lisesi": { name: "İkinci Anadolu Lisesi", color: "#1D3557" },
  manual: { name: "Manuel kurum kodu", color: "#457B9D" },
} as const;

export function InstitutionCodeField(): React.JSX.Element {
  const alias = useAuthStore((state) => state.institutionAlias);
  const setAlias = useAuthStore((state) => state.setInstitutionAlias);
  const mode = modeFor(alias);
  const school = SCHOOLS[mode];

  return (
    <div>
      <SegmentedControl
        id="institution-mode"
        label="Kurum"
        fullWidth
        value={mode}
        onChange={(next) => {
          if (next === "manual") {
            if (mode !== "manual") {
              setAlias("");
            }
            return;
          }
          setAlias(next);
        }}
        options={[
          { value: "fen-koleji", label: "Örnek Fen Koleji" },
          { value: "anadolu-lisesi", label: "İkinci Anadolu Lisesi" },
          { value: "manual", label: "Manuel Kod" },
        ]}
      />
      <button
        id="detect-institution"
        className="login-sr"
        type="button"
        onClick={() => setAlias("fen-koleji")}
      >
        Otomatik Algıla
      </button>
      <button
        id="switch-anadolu"
        className="login-sr"
        type="button"
        onClick={() => setAlias("anadolu-lisesi")}
      >
        anadolu-lisesi
      </button>
      <button
        id="manual-institution"
        className="login-sr"
        type="button"
        onClick={() => setAlias("")}
      >
        Kurum kodunu manuel girmek istiyorum
      </button>
      {mode === "manual" ? (
        <Input
          id="institution-alias"
          label="Kurum kodu"
          value={alias}
          onChange={setAlias}
          placeholder="fen-koleji"
          leadingIcon={<GoogleIcon name="domain" />}
        />
      ) : null}
      <div className={`login-school is-${mode}`}>
        <span className="login-swatch" />
        <div>
          <strong>{school.name}</strong>
          <div>{mode === "manual" ? alias || "Kod bekleniyor" : alias}</div>
        </div>
      </div>
    </div>
  );
}
