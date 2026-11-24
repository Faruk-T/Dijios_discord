import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "truncgil-uxigl/styles";
import { ConnectApp } from "./app/ConnectApp.js";
import { AppProviders } from "./app/AppProviders.js";
import "./styles/fonts.css";
import "./styles/dijios-hig.css";
import "./styles/login-portal.css";
import "./styles/osgl-shell.css";
import "./styles/osgl-windows.css";
import "./styles/communication-hub.css";
import "./styles/messaging-pane.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <ConnectApp />
    </AppProviders>
  </StrictMode>,
);
