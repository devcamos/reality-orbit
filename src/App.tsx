import { useEffect, useMemo, useState, type ReactElement } from "react";
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

const activeTabStorageKey = "reality-orbit-active-tab";
const selectedNodeStorageKey = "reality-orbit:selected-node";
const navigationStorageKey = "reality-orbit:navigation-history";
const appTabs: readonly AppTab[] = ["home", "field-notes", "library", "about"];

const readActiveTab = (): AppTab => {
  try {
    const storedTab = window.sessionStorage.getItem(activeTabStorageKey);
    return storedTab && appTabs.includes(storedTab as AppTab) ? storedTab as AppTab : "home";
  } catch {
    return "home";
  }
};

const rememberActiveTab = (tab: AppTab): void => {
  try {
    window.sessionStorage.setItem(activeTabStorageKey, tab);
  } catch {
    // Session storage is an enhancement; navigation must still work when unavailable.
  }
};

const readSelectedNode = (): string | undefined => {
  try {
    return window.sessionStorage.getItem(selectedNodeStorageKey) ?? undefined;
  } catch {
    return undefined;
  }
};

const readNavigationPath = (): string[] | undefined => {
  try {
    const storedPath = JSON.parse(window.sessionStorage.getItem(navigationStorageKey) ?? "null");
    return Array.isArray(storedPath) && storedPath.every((nodeId) => typeof nodeId === "string")
      ? storedPath
      : undefined;
  } catch {
    return undefined;
  }
};

export function App(): ReactElement {
  const orbitDocument = useMemo(buildOrbitDocument, []);
  const [hasEntered, setHasEntered] = useState(hasEnteredThisSession);
  const [activeTab, setActiveTab] = useState<AppTab>(readActiveTab);
  const [requestedNodeId, setRequestedNodeId] = useState<string | undefined>(readSelectedNode);
  const [requestedPath, setRequestedPath] = useState<string[] | undefined>(readNavigationPath);
  const [requestedNodeMode, setRequestedNodeMode] = useState<"restore" | "select">("restore");

  useEffect(() => {
    const handleOrbitSelection = (event: MessageEvent): void => {
      if (event.data?.type !== "reality-orbit:selected-node") return;
      const nodeId = event.data.nodeId;
      if (typeof nodeId !== "string" || nodeId.length === 0) return;
      try {
        window.sessionStorage.setItem(selectedNodeStorageKey, nodeId);
      } catch {
        // Session storage is an enhancement; selection remains available in the map.
      }
    };

    const handleOrbitNavigation = (event: MessageEvent): void => {
      if (event.data?.type !== "reality-orbit:navigation") return;
      const path = event.data.path;
      if (!Array.isArray(path) || !path.every((nodeId) => typeof nodeId === "string")) return;
      try {
        window.sessionStorage.setItem(navigationStorageKey, JSON.stringify(path));
      } catch {
        // Session storage is an enhancement; navigation remains available in the map.
      }
      setRequestedPath((previousPath) => (
        JSON.stringify(previousPath) === JSON.stringify(path) ? previousPath : path
      ));
      setRequestedNodeMode("restore");
    };

    window.addEventListener("message", handleOrbitSelection);
    window.addEventListener("message", handleOrbitNavigation);
    return () => {
      window.removeEventListener("message", handleOrbitSelection);
      window.removeEventListener("message", handleOrbitNavigation);
    };
  }, []);

  const exploreNodeFromFieldNote = (nodeId: string): void => {
    setRequestedNodeId(nodeId);
    setRequestedNodeMode("select");
    rememberActiveTab("home");
    setActiveTab("home");
  };

  const changeActiveTab = (tab: AppTab): void => {
    rememberActiveTab(tab);
    setActiveTab(tab);
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
          <AppNavigation activeTab={activeTab} onTabChange={changeActiveTab} />
          <div id="app-content" className="app-observatory__views" tabIndex={-1}>
            <div className="app-observatory__home" hidden={activeTab !== "home"}>
              <RealityOrbitFrame
                orbitDocument={orbitDocument}
                requestedNodeId={requestedNodeId}
                requestedPath={requestedPath}
                requestMode={requestedNodeMode}
              />
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
