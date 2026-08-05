import { useMemo, useState, type ReactElement } from "react";
import { AppNavigation, type AppTab } from "./components/AppNavigation";
import { ContentSurface } from "./components/ContentSurface";
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
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [requestedNodeId, setRequestedNodeId] = useState<string>();

  const exploreNodeFromFieldNote = (nodeId: string): void => {
    setRequestedNodeId(nodeId);
    setActiveTab("home");
  };

  const enterObservatory = (): void => {
    try {
      window.sessionStorage.setItem("reality-orbit-entered", "true");
    } catch {
      // Session storage is an enhancement; entry must still work when unavailable.
    }
    setHasEntered(true);
  };

  return (
    <>
      <a className="skip-link" href="#app-content">Skip to main content</a>
      <main id="main-content" className="app-shell" tabIndex={-1}>
      {hasEntered ? (
        <div className="app-observatory">
          <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div id="app-content" className="app-observatory__views" tabIndex={-1}>
            <div className="app-observatory__home" hidden={activeTab !== "home"}>
              <RealityOrbitFrame orbitDocument={orbitDocument} requestedNodeId={requestedNodeId} />
            </div>
            {activeTab !== "home" && <ContentSurface tab={activeTab} onExploreNode={exploreNodeFromFieldNote} />}
          </div>
        </div>
      ) : (
        <ObservatoryIntroduction onEnter={enterObservatory} />
      )}
      </main>
    </>
  );
}
