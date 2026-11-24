import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "truncgil-uxigl/styles";
import { AppProviders } from "./app/AppProviders.js";
import "./styles/fonts.css";
import "./styles/dijios-hig.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <main className="osgl-desktop">dijiOS Connect</main>
    </AppProviders>
  </StrictMode>,
);
