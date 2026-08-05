import type { ReactElement } from "react";

export type AppTab = "home" | "skills" | "field-notes" | "library" | "about";

interface AppNavigationProps {
  readonly activeTab: AppTab;
  readonly onTabChange: (tab: AppTab) => void;
}

const tabs: readonly { label: string; value: AppTab }[] = [
  { label: "About", value: "about" },
  { label: "Home", value: "home" },
  { label: "Skills", value: "skills" },
  { label: "Notes", value: "field-notes" },
  { label: "Library", value: "library" },
];

export function AppNavigation({
  activeTab,
  onTabChange,
}: AppNavigationProps): ReactElement {
  return (
    <header className="app-navigation-shell">
      <nav className="app-navigation" aria-label="Primary navigation" data-primary-navigation>
        <span className="app-navigation__brand" aria-label="Reality Orbit">Reality Orbit</span>
        <div className="app-navigation__tabs">
          {tabs.map((tab) => (
            <button
              aria-current={activeTab === tab.value ? "page" : undefined}
              className={`app-navigation__tab${activeTab === tab.value ? " app-navigation__tab--active" : ""}`}
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
