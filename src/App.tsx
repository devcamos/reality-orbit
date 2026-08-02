import { useCallback, useMemo, useState, type ReactElement } from "react";
import { AppNavigation, type AppTab } from "./components/AppNavigation";
import { ContentSurface } from "./components/ContentSurface";
import { HomeRitualStrip } from "./components/HomeRitualStrip";
import { ObservatoryIntroduction } from "./components/ObservatoryIntroduction";
import { RealityOrbitFrame } from "./components/RealityOrbitFrame";
import { buildOrbitDocument } from "./lib/orbit-document";
import {
  loadLastExploredNode,
  saveLastExploredNode,
  touchWeekActivity,
  type LastExploredNode,
} from "./lib/progress-store";
import { getWeeklyConcept } from "./lib/weekly-ritual";

const hasEnteredThisSession = (): boolean => {
  try {
    return window.sessionStorage.getItem("reality-orbit-entered") === "true";
  } catch {
    return false;
  }
};

export function App(): ReactElement {
  const orbitDocument = useMemo(buildOrbitDocument, []);
  const weekly = useMemo(() => getWeeklyConcept(), []);
  const [hasEntered, setHasEntered] = useState(hasEnteredThisSession);
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [requestedNodeId, setRequestedNodeId] = useState<string>();
  const [requestedSkillId, setRequestedSkillId] = useState<string>();
  const [requestedNoteSlug, setRequestedNoteSlug] = useState<string>();
  const [lastNode, setLastNode] = useState<LastExploredNode | undefined>(loadLastExploredNode);
  const [briefRequest, setBriefRequest] = useState<{ nodeId: string; requestId: string }>();
  const [anatomyBrief, setAnatomyBrief] = useState<{
    definition?: string;
    decisionRule?: string;
    example?: string;
  }>();

  const exploreNode = (nodeId: string): void => {
    setRequestedNodeId(nodeId);
    setActiveTab("home");
  };

  const openSkills = (skillId?: string): void => {
    setRequestedSkillId(skillId ?? weekly.relatedSkillId);
    setActiveTab("skills");
  };

  const openFieldNote = (slug: string): void => {
    setRequestedNoteSlug(slug);
    setActiveTab("field-notes");
  };

  const requestBrief = useCallback((nodeId: string): void => {
    setBriefRequest({ nodeId, requestId: `brief-${nodeId}-${Date.now().toString(36)}` });
  }, []);

  const enterObservatory = (): void => {
    try {
      window.sessionStorage.setItem("reality-orbit-entered", "true");
    } catch {
      // Session storage is an enhancement; entry must still work when unavailable.
    }
    setHasEntered(true);
    if (weekly.relatedSkillId) {
      touchWeekActivity({ focusSkillId: weekly.relatedSkillId });
    }
  };

  return (
    <main className="app-shell">
      {hasEntered ? (
        <div className="app-observatory">
          <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="app-observatory__views">
            <div className="app-observatory__home" hidden={activeTab !== "home"}>
              <HomeRitualStrip
                lastNode={lastNode}
                anatomyBrief={anatomyBrief}
                onExploreNode={exploreNode}
                onOpenSkills={openSkills}
                onOpenFieldNote={openFieldNote}
                onRequestBrief={requestBrief}
              />
              <RealityOrbitFrame
                orbitDocument={orbitDocument}
                requestedNodeId={requestedNodeId}
                briefRequest={briefRequest}
                onBrief={(brief) => {
                  setAnatomyBrief({
                    definition: brief.definition,
                    decisionRule: brief.decisionRule,
                    example: brief.example,
                  });
                }}
                onSelectionChange={(selection) => {
                  // Ignore the boot selection of Reality so Continue stays meaningful.
                  const isBootRoot = selection.nodeId === "reality"
                    && (selection.path?.length ?? 0) <= 1;
                  if (isBootRoot) return;
                  const saved = saveLastExploredNode(selection);
                  setLastNode(saved);
                  touchWeekActivity({ nodeId: selection.nodeId });
                }}
              />
            </div>
            {activeTab !== "home" && (
              <ContentSurface
                tab={activeTab}
                onExploreNode={exploreNode}
                onOpenSkills={openSkills}
                requestedSkillId={requestedSkillId}
                requestedNoteSlug={requestedNoteSlug}
                focusSkillId={weekly.relatedSkillId}
              />
            )}
          </div>
        </div>
      ) : (
        <ObservatoryIntroduction onEnter={enterObservatory} />
      )}
    </main>
  );
}
