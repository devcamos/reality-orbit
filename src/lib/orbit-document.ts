import observatoryBackgroundUrl from "../../assets/observatory-deep-space.webp?url";
import legacyFrame from "../../legacy-index.html?raw";

export const buildOrbitDocument = (): string => {
  const parsedFrame = new DOMParser().parseFromString(legacyFrame, "text/html");
  const orbitDocument = parsedFrame.querySelector('iframe[title="Reality Orbit"]')?.getAttribute("srcdoc");

  if (!orbitDocument) {
    throw new Error("The compatibility frame does not contain the Reality Orbit document.");
  }

  return orbitDocument.replaceAll(
    "/assets/observatory-deep-space.webp",
    observatoryBackgroundUrl,
  );
};
