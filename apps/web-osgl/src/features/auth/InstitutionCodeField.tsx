import { Button, Input } from "truncgil-uxigl";
import { useAuthStore } from "./auth.store.js";

export function InstitutionCodeField(): React.JSX.Element {
  const alias = useAuthStore((state) => state.institutionAlias);
  const setAlias = useAuthStore((state) => state.setInstitutionAlias);
  const manual = alias !== "fen-koleji" && alias !== "anadolu-lisesi";

  return (
    <div>
      <Button
        id="detect-institution"
        type="button"
        variant="tonal"
        onClick={() => setAlias("fen-koleji")}
      >
        Otomatik Algıla
      </Button>
      <Button id="manual-institution" type="button" variant="ghost" onClick={() => setAlias("")}>
        Kurum kodunu manuel girmek istiyorum
      </Button>
      {manual ? (
        <Input
          id="institution-alias"
          label="Kurum kodu"
          value={alias}
          onChange={setAlias}
          placeholder="fen-koleji"
        />
      ) : (
        <p>
          {alias === "anadolu-lisesi" ? "İkinci Anadolu Lisesi" : "Örnek Fen ve Teknoloji Koleji"}
        </p>
      )}
      <Button
        id="switch-anadolu"
        type="button"
        variant="outlined"
        onClick={() => setAlias("anadolu-lisesi")}
      >
        anadolu-lisesi
      </Button>
    </div>
  );
}
