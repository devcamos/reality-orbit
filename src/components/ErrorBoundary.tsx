import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Reality Orbit failed to initialise.", error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <main className="app-fallback">
          <p className="app-fallback__eyebrow">Observatory unavailable</p>
          <h1>Reality Orbit could not initialise.</h1>
          <p>The ontology remains unchanged. Reload the application to try the local instrument again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload Reality Orbit
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
