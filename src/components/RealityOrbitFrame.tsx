import { memo, useEffect, useRef, useState, type ReactElement } from "react";

interface RealityOrbitFrameProps {
  orbitDocument: string;
  requestedNodeId?: string;
  requestedPath?: string[];
  requestMode?: "restore" | "select";
}

type FrameStatus = "loading" | "ready" | "error";

export const RealityOrbitFrame = memo(function RealityOrbitFrame({
  orbitDocument,
  requestedNodeId,
  requestedPath,
  requestMode = "restore",
}: RealityOrbitFrameProps): ReactElement {
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const [frameVersion, setFrameVersion] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const requestNodeSelection = (): void => {
    if (!requestedNodeId || !frameRef.current?.contentWindow) return;
    if (requestMode === "restore" && (requestedPath?.length ?? 0) > 1) {
      frameRef.current.contentWindow.postMessage({
        type: "reality-orbit:restore-navigation",
        path: requestedPath,
        selectedNodeId: requestedNodeId,
      }, window.location.origin);
      return;
    }
    frameRef.current.contentWindow.postMessage({
      type: requestMode === "select" ? "reality-orbit:select-node" : "reality-orbit:restore-node",
      nodeId: requestedNodeId,
    }, window.location.origin);
  };

  useEffect(() => {
    if (frameStatus === "ready") requestNodeSelection();
  }, [frameStatus, requestedNodeId, requestedPath, requestMode]);

  const reloadFrame = (): void => {
    setFrameStatus("loading");
    setFrameVersion((version) => version + 1);
  };

  return (
    <section
      className="orbit-frame-shell"
      aria-busy={frameStatus === "loading"}
      aria-label="Reality Orbit observatory"
    >
      <p id="orbit-frame-instructions" className="visually-hidden">
        Interactive ontology map. Use Tab to move between concepts, Enter to select a concept, and the Explore action to enter it.
      </p>
      {frameStatus === "loading" && (
        <output className="orbit-frame-status" aria-live="polite">
          Aligning the observatory…
        </output>
      )}
      {frameStatus === "error" && (
        <div className="orbit-frame-status orbit-frame-status--error" role="alert">
          <span>The observatory view did not load.</span>
          <button type="button" onClick={reloadFrame}>
            Try again
          </button>
        </div>
      )}
      <iframe
        key={frameVersion}
        className="orbit-frame"
        onError={() => setFrameStatus("error")}
        onLoad={() => {
          setFrameStatus("ready");
          requestNodeSelection();
        }}
        ref={frameRef}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={orbitDocument}
        aria-describedby="orbit-frame-instructions"
        title="Reality Orbit"
      />
    </section>
  );
});
