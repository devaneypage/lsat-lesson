import type { ReactNode } from "react";

interface NexusDashboardLayoutProps {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

function getSessionDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function NexusDashboardLayout({
  mainContent,
  sidebarContent,
}: NexusDashboardLayoutProps) {
  return (
    <div className="min-h-screen px-4 py-7 md:px-8 md:py-9">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 grid gap-4 border-b border-border pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="nexus-index-label text-[var(--nexus-amber)]">01 · Session focus</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight md:text-[2rem]">Your next move</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              One prioritized learning action, supported by the evidence already in your workspace.
            </p>
          </div>
          <p className="nexus-index-label text-muted-foreground">{getSessionDate()}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-7">
          <main>{mainContent}</main>
          <aside className="flex flex-col gap-5" aria-label="Learning evidence">
            {sidebarContent}
          </aside>
        </div>
      </div>
    </div>
  );
}
