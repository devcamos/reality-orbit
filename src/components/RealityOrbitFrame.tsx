import { memo, useEffect, useRef, useState, type ReactElement } from "react";

export interface OrbitSelectionPayload {
  readonly nodeId: string;
  readonly label: string;
  readonly path: readonly string[];
}

export interface OrbitBriefPayload {
  readonly nodeId: string;
  readonly label: string;
  readonly definition: string;
  readonly decisionRule: string;
  readonly example: string;
}

interface RealityOrbitFrameProps {
  orbitDocument: string;
  requestedNodeId?: string;
  onSelectionChange?: (selection: OrbitSelectionPayload) => void;
  briefRequest?: { nodeId: string; requestId: string };
  onBrief?: (brief: OrbitBriefPayload & { requestId: string }) => void;
}

type FrameStatus = "loading" | "ready" | "error";

export const RealityOrbitFrame = memo(function RealityOrbitFrame({
  orbitDocument,
  requestedNodeId,
  onSelectionChange,
  briefRequest,
  onBrief,
}: RealityOrbitFrameProps): ReactElement {
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const [frameVersion, setFrameVersion] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onBriefRef = useRef(onBrief);
  onSelectionChangeRef.current = onSelectionChange;
  onBriefRef.current = onBrief;

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

  useEffect(() => {
    if (frameStatus !== "ready" || !briefRequest || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage({
      type: "reality-orbit:request-brief",
      nodeId: briefRequest.nodeId,
      requestId: briefRequest.requestId,
    }, "*");
  }, [frameStatus, briefRequest?.nodeId, briefRequest?.requestId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      // Trust only our iframe source. Origin may be "null" for sandboxed srcdoc documents.
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "reality-orbit:brief") {
        onBriefRef.current?.(event.data);
        return;
      }
      if (event.data?.type !== "reality-orbit:selection") return;
      const { nodeId, label, path } = event.data as OrbitSelectionPayload;
      if (!nodeId || !label) return;
      onSelectionChangeRef.current?.({
        nodeId,
        label,
        path: Array.isArray(path) ? path : [],
      });
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
        sandbox="allow-scripts allow-same-origin"
        srcDoc={orbitDocument}
        title="Reality Orbit"
      />
    </section>
  );
});
