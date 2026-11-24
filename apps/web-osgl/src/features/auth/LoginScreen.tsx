import { useEffect, useState } from "react";
import { GoogleIcon, Input, WebGLAuroraCanvas } from "truncgil-uxigl";

function canMountAurora(): boolean {
  if (typeof WebGLRenderingContext === "undefined") {
    return false;
  }
  return document.createElement("canvas").getContext("webgl") !== null;
}
import { DevPersonaQuickBar } from "./DevPersonaQuickBar.js";
import { InstitutionCodeField } from "./InstitutionCodeField.js";
import { resolveDemoUser } from "./login-credentials.js";
import { useAuthStore } from "./auth.store.js";

export function LoginScreen(): React.JSX.Element {
  const error = useAuthStore((state) => state.error);
  const loadPersonas = useAuthStore((state) => state.loadPersonas);
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("zeynep.basaran@fen.k12.tr");
  const [password, setPassword] = useState("");

  useEffect(() => {
    void loadPersonas();
  }, [loadPersonas]);

  return (
    <main className="login-stage">
      <div className="login-aurora" aria-hidden="true">
        {canMountAurora() ? <WebGLAuroraCanvas /> : null}
      </div>
      <section id="login-card" className="login-portal">
        <header className="login-titlebar">
          <span className="login-lights" aria-hidden="true">
            <i className="login-light login-light-close" />
            <i className="login-light login-light-min" />
            <i className="login-light login-light-max" />
          </span>
          <span className="login-pill">dijiOS Connect · Akademik İletişim İşletim Sistemi</span>
          <span className="login-secure">
            <GoogleIcon name="verified_user" size="sm" />
            Güvenli Kurum Portalı
          </span>
        </header>
        <div className="login-columns">
          <section className="login-brand">
            <div className="login-mark">d</div>
            <h1>Öğretmenler Odası ve Zümreler Tek Çatıda</h1>
            <div className="login-facts">
              <div className="login-fact">🎙️ 50+ Kişilik Ses & HD Video Odaları</div>
              <div className="login-fact">🏫 Otomatik Branş & Zümre Kanalları</div>
              <div className="login-fact">🛡️ KVKK & Kurum İzolasyonlu Altyapı</div>
            </div>
          </section>
          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (password.trim().length === 0) {
                return;
              }
              void login(resolveDemoUser(email));
            }}
          >
            <InstitutionCodeField />
            <Input
              id="corporate-email"
              label="Kurumsal E-posta veya Telefon"
              placeholder="zeynep.basaran@fen.k12.tr"
              value={email}
              onChange={setEmail}
              leadingIcon={<GoogleIcon name="mail" />}
            />
            <Input
              id="corporate-password"
              type="password"
              label="dijiOS Şifresi"
              value={password}
              onChange={setPassword}
              revealablePassword
              leadingIcon={<GoogleIcon name="lock" />}
            />
            <button className="login-submit" type="submit">
              dijiOS ile Giriş Yap
            </button>
            {error === null ? null : <p role="alert">{error}</p>}
            <DevPersonaQuickBar />
          </form>
        </div>
      </section>
    </main>
  );
}
