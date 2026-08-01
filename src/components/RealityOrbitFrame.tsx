import { memo, useEffect, useRef, useState, type ReactElement } from "react";

interface RealityOrbitFrameProps {
  orbitDocument: string;
  requestedNodeId?: string;
}

type FrameStatus = "loading" | "ready" | "error";

export const RealityOrbitFrame = memo(function RealityOrbitFrame({
  orbitDocument,
  requestedNodeId,
}: RealityOrbitFrameProps): ReactElement {
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const [frameVersion, setFrameVersion] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const requestNodeSelection = (): void => {
    if (!requestedNodeId || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage({
      type: "reality-orbit:select-node",
      nodeId: requestedNodeId,
    }, "*");
  };

  useEffect(() => {
    if (frameStatus === "ready") requestNodeSelection();
  }, [frameStatus, requestedNodeId]);

  const reloadFrame = (): void => {
    setFrameStatus("loading");
    setFrameVersion((version) => version + 1);
  };

  return (
    <section className="orbit-frame-shell" aria-label="Reality Orbit observatory">
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
        sandbox="allow-scripts"
        srcDoc={orbitDocument}
        title="Reality Orbit"
      />
    </section>
  );
});
