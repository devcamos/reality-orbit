import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/app.css";

const root = document.querySelector<HTMLDivElement>("#root");

if (!root) {
  throw new Error("Reality Orbit requires a root application element.");
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  </StrictMode>,
);
