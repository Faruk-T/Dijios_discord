import { Avatar, Badge } from "truncgil-uxigl";
import { useAuthStore } from "./auth.store.js";

export function DevPersonaQuickBar(): React.JSX.Element {
  const personas = useAuthStore((state) => state.personas);
  const login = useAuthStore((state) => state.login);

  return (
    <div>
      <div className="login-divider">Geliştirici Hızlı Oturum (Mock SSO)</div>
      <div className="login-personas" aria-label="Geliştirici öğretmen seçici">
        {personas.map((persona) => (
          <button
            id={`persona-${persona.dijiosUserId}`}
            key={persona.dijiosUserId}
            className="login-persona"
            type="button"
            onClick={() => {
              void login(persona.dijiosUserId);
            }}
          >
            <Avatar shape="squircle" size="sm" status="online" name={persona.fullName} />
            <span>
              <strong>{persona.fullName}</strong>
              <Badge tone="info" size="sm">
                {persona.title}
              </Badge>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
