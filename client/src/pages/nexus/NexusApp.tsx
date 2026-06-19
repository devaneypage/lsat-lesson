import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import PageMeta from "@/components/PageMeta";
import { SECTIONS, type SectionId } from "@/lib/nexus/data";
import { NxLabel } from "./components/primitives";
import LogicalReasoning from "./sections/LogicalReasoning";
import ReadingComp from "./sections/ReadingComp";
import FormalLogic from "./sections/FormalLogic";
import Strategy from "./sections/Strategy";
import ReviewAnalytics from "./sections/ReviewAnalytics";
import StudyPlan from "./sections/StudyPlan";

const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

function SectionBody({
  id,
  tab,
  color,
}: {
  id: SectionId;
  tab: string;
  color: string;
}) {
  switch (id) {
    case "lr":
      return <LogicalReasoning tab={tab} color={color} />;
    case "rc":
      return <ReadingComp tab={tab} color={color} />;
    case "fl":
      return <FormalLogic tab={tab} color={color} />;
    case "str":
      return <Strategy tab={tab} color={color} />;
    case "rev":
      return <ReviewAnalytics tab={tab} color={color} />;
    case "pln":
      return <StudyPlan tab={tab} color={color} />;
  }
}

export default function NexusApp() {
  const [, params] = useRoute("/nexus/:section");
  const [, navigate] = useLocation();

  const sectionId = (
    params?.section && SECTION_BY_ID[params.section] ? params.section : "lr"
  ) as SectionId;
  const section = SECTION_BY_ID[sectionId];

  const [tab, setTab] = useState(section.tabs[0]);
  // Reset to the first tab whenever the section changes.
  useEffect(() => {
    setTab(section.tabs[0]);
  }, [sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="nexus-app min-h-screen">
      <PageMeta
        title="LSAT Nexus — Interactive Reference"
        description="An interactive LSAT reference: Logical Reasoning playbooks, the fallacy library, formal-logic trainers, pacing strategy, a synced error log, and study-plan templates."
      />

      {/* Top bar */}
      <header
        className="border-b-2 border-ink px-5 py-3"
        style={{ background: "#FFFDF8" }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span
            className="nx-display flex h-9 w-9 items-center justify-center bg-ink text-[#FFFDF8]"
            style={{ background: "#111111" }}
          >
            N
          </span>
          <div>
            <span className="nx-display text-lg leading-none">LSAT NEXUS</span>
            <NxLabel className="block text-black/40">
              Interactive Reference
            </NxLabel>
          </div>
        </div>
      </header>

      {/* Section nav */}
      <nav className="border-b-2 border-ink" style={{ background: "#F4EFE2" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap">
          {SECTIONS.map(s => {
            const active = s.id === sectionId;
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/nexus/${s.id}`)}
                className="nx-mono flex items-center gap-2 border-r-2 border-ink px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? s.color : "transparent",
                  color: active ? "#FFFDF8" : "#111111",
                }}
              >
                <span
                  className="inline-block h-2.5 w-2.5"
                  style={{ background: active ? "#FFFDF8" : s.color }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-6">
        {/* Sub-tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {section.tabs.map(t => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="nx-mono border-2 border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? "#111111" : "transparent",
                  color: active ? "#FFFDF8" : "#111111",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <SectionBody id={sectionId} tab={tab} color={section.color} />

        <footer className="mt-12 border-t-2 border-ink/10 pt-4">
          <NxLabel className="text-black/30">
            LSAT Nexus · full-stack interactive reference · error log synced to
            your account
          </NxLabel>
        </footer>
      </main>
    </div>
  );
}
