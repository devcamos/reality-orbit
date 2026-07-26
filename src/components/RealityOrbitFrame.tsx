import { memo, useState, type ReactElement } from "react";

interface RealityOrbitFrameProps {
  orbitDocument: string;
}

type FrameStatus = "loading" | "ready" | "error";

export const RealityOrbitFrame = memo(function RealityOrbitFrame({
  orbitDocument,
}: RealityOrbitFrameProps): ReactElement {
  const [frameStatus, setFrameStatus] = useState<FrameStatus>("loading");
  const [frameVersion, setFrameVersion] = useState(0);

  const reloadFrame = (): void => {
    setFrameStatus("loading");
    setFrameVersion((version) => version + 1);
  };

  return (
    <section className="orbit-frame-shell" aria-label="Reality Orbit observatory">
      {frameStatus === "loading" && (
        <div className="orbit-frame-status" role="status">
          Aligning the observatory…
        </div>
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
        onLoad={() => setFrameStatus("ready")}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts"
        srcDoc={orbitDocument}
        title="Reality Orbit"
      />
    </section>
  );
});
