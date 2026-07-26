import { useMemo, useState, type ReactElement } from "react";
import { ObservatoryIntroduction } from "./components/ObservatoryIntroduction";
import { RealityOrbitFrame } from "./components/RealityOrbitFrame";
import { buildOrbitDocument } from "./lib/orbit-document";

const hasEnteredThisSession = (): boolean => {
  try {
    return window.sessionStorage.getItem("reality-orbit-entered") === "true";
  } catch {
    return false;
  }
};

export function App(): ReactElement {
  const orbitDocument = useMemo(buildOrbitDocument, []);
  const [hasEntered, setHasEntered] = useState(hasEnteredThisSession);

  const enterObservatory = (): void => {
    try {
      window.sessionStorage.setItem("reality-orbit-entered", "true");
    } catch {
      // Session storage is an enhancement; entry must still work when unavailable.
    }
    setHasEntered(true);
  };

  return (
    <main className="app-shell">
      {hasEntered ? (
        <RealityOrbitFrame orbitDocument={orbitDocument} />
      ) : (
        <ObservatoryIntroduction onEnter={enterObservatory} />
      )}
    </main>
  );
}
