/**
 * DESIGN: Nexus Command Center — Dashboard Layout
 * Component: NexusDashboardLayout
 * 
 * Two-column grid layout with main content area and sidebar.
 * Main content spans full width on mobile, sidebar appears below on mobile.
 */

import React from "react";

interface NexusDashboardLayoutProps {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const NexusDashboardLayout: React.FC<NexusDashboardLayoutProps> = ({
  mainContent,
  sidebarContent,
}) => {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-4 md:p-6 min-h-screen"
      style={{
        background: "var(--background)",
      }}
    >
      {/* Main Content Area */}
      <div className="main-content">{mainContent}</div>

      {/* Sidebar */}
      <div className="sidebar flex flex-col gap-4 overflow-y-auto">
        {sidebarContent}
      </div>
    </div>
  );
};

export default NexusDashboardLayout;
