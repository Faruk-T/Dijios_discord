import { useEffect } from "react";
import { Card } from "truncgil-uxigl";
import { DevPersonaQuickBar } from "./DevPersonaQuickBar.js";
import { InstitutionCodeField } from "./InstitutionCodeField.js";
import { useAuthStore } from "./auth.store.js";

export function LoginScreen(): React.JSX.Element {
  const error = useAuthStore((state) => state.error);
  const loadPersonas = useAuthStore((state) => state.loadPersonas);

  useEffect(() => {
    void loadPersonas();
  }, [loadPersonas]);

  return (
    <main className="osgl-desktop">
      <Card id="login-card" variant="elevated" padding="lg">
        <p>dijiOS Connect · Akademik İletişim İşletim Sistemi</p>
        <h1>Kurumsal giriş</h1>
        <InstitutionCodeField />
        <DevPersonaQuickBar />
        {error === null ? null : <p role="alert">{error}</p>}
      </Card>
    </main>
  );
}
