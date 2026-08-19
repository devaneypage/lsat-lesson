import type { ReactNode } from "react";
import { LedgerFrame } from "@/components/ledger/LedgerPrimitives";

interface NexusDashboardLayoutProps {
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export default function NexusDashboardLayout({ mainContent, sidebarContent }: NexusDashboardLayoutProps) {
  return (
    <LedgerFrame className="min-h-screen">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
        <main>{mainContent}</main>
        <aside aria-label="Learning evidence">{sidebarContent}</aside>
      </div>
    </LedgerFrame>
  );
}
