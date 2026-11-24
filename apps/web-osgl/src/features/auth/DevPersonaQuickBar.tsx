import { Badge, Button } from "truncgil-uxigl";
import { useAuthStore } from "./auth.store.js";

export function DevPersonaQuickBar(): React.JSX.Element {
  const personas = useAuthStore((state) => state.personas);
  const login = useAuthStore((state) => state.login);

  return (
    <div aria-label="Geliştirici öğretmen seçici">
      {personas.map((persona) => (
        <Button
          id={`persona-${persona.dijiosUserId}`}
          key={persona.dijiosUserId}
          type="button"
          variant="glass"
          onClick={() => {
            void login(persona.dijiosUserId);
          }}
        >
          <Badge tone="info" size="sm">
            {persona.title}
          </Badge>
          {persona.fullName}
        </Button>
      ))}
    </div>
  );
}
