import { useMemo, type ReactElement } from "react";
import { RealityOrbitFrame } from "./components/RealityOrbitFrame";
import { buildOrbitDocument } from "./lib/orbit-document";

export function App(): ReactElement {
  const orbitDocument = useMemo(buildOrbitDocument, []);

  return (
    <main className="app-shell">
      <RealityOrbitFrame orbitDocument={orbitDocument} />
    </main>
  );
}
