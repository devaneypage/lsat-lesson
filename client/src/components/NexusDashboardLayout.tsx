/**
 * DESIGN: Nexus Command Center — Dashboard Layout
 * Component: NexusDashboardLayout
 *
 * Two-column grid layout with a page-level header above it.
 * Header: page title + session date + horizontal rule — provides orientation anchor.
 * Main content spans full width on mobile; sidebar appears below on mobile.
 */

import React from "react";

interface NexusDashboardLayoutProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const NexusDashboardLayout: React.FC<NexusDashboardLayoutProps> = ({
  mainContent,
  sidebarContent,
}) => {
  return (
    <div
      style={{
        background: "var(--background)",
        minHeight: "100vh",
        padding: "1.5rem 2rem 3rem",  // P11: increased outer padding
      }}
    >
      {/* Page Header — orientation anchor */}
      <header
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <h1
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 900,
              letterSpacing: "0.02em",
              color: "var(--foreground)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Study Dashboard
          </h1>
          <span
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
            }}
          >
            {getTodayLabel()}
          </span>
        </div>
        {/* Horizontal rule */}
        <div
          style={{
            height: "1.5px",
            background: "var(--border)",
            width: "100%",
          }}
        />
      </header>

      {/* Two-column grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px]"
        style={{ gap: "2rem" }}  // P11: increased gap
      >
        {/* Main Content Area */}
        <div className="main-content">{mainContent}</div>

        {/* Sidebar */}
        <div
          className="sidebar flex flex-col"
          style={{ gap: "1.25rem", overflowY: "auto" }}
        >
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default NexusDashboardLayout;
