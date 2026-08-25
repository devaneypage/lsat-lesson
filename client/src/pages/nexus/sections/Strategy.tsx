import { useState } from "react";
import {
  ANSWER_TRAPS,
  NEXUS_COLORS,
  PACING_TABLE,
  PER_QUESTION_PACING,
} from "@/lib/nexus/data";
import {
  NxBadge,
  NxButton,
  NxCard,
  NxLabel,
  NxSectionHeader,
} from "../components/primitives";

function Pacing() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <NxCard className="overflow-hidden">
        <div className="px-4 py-2" style={{ background: NEXUS_COLORS.pine }}>
          <span className="nx-display text-sm text-[#FFFDF8]">
            35-min Section Checkpoints
          </span>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1.4fr] border-b-2 border-ink">
          {["After Q", "Min Left", "Verdict"].map(h => (
            <div key={h} className="nx-label px-3 py-2 text-black/50">
              {h}
            </div>
          ))}
        </div>
        {PACING_TABLE.map((r, i) => (
          <div
            key={r.qs}
            className="grid grid-cols-[1fr_1fr_1.4fr] items-center border-b border-ink/10 text-sm"
            style={{ background: i % 2 ? "#F4EFE2" : "transparent" }}
          >
            <div className="nx-mono px-3 py-2 font-bold">Q{r.qs}</div>
            <div className="nx-mono px-3 py-2">{r.time}:00</div>
            <div
              className="px-3 py-2 text-[12px] font-semibold"
              style={{ color: r.color }}
            >
              {r.verdict}
            </div>
          </div>
        ))}
      </NxCard>

      <NxCard className="p-4">
        <NxLabel className="text-black/40">Per-Question Budget</NxLabel>
        <div className="mt-3 space-y-3">
          {PER_QUESTION_PACING.map(p => (
            <div key={p.range} className="flex items-baseline gap-2 text-sm">
              <span className="nx-mono font-bold" style={{ color: p.color }}>
                {p.range}
              </span>
              <span className="text-black/60">— {p.note}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t-2 border-ink/10 pt-3 text-[12px] text-black/50">
          The clock is an opponent. Flagging is a skill: a confident skip
          protects the easy points still ahead of you.
        </p>
      </NxCard>
    </div>
  );
}

function AnswerTraps() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ANSWER_TRAPS.map(t => (
        <NxCard key={t.abbr} flat className="p-4">
          <div className="flex items-center gap-2">
            <NxBadge color={NEXUS_COLORS.terra} filled>
              {t.abbr}
            </NxBadge>
            <span className="nx-display text-sm">{t.name}</span>
          </div>
          <p className="mt-2 text-[12px] text-black/70">{t.description}</p>
          <p
            className="nx-mono mt-2 border-l-2 pl-2 text-[10px] italic text-black/50"
            style={{ borderColor: NEXUS_COLORS.amber }}
          >
            Watch for: {t.watch}
          </p>
        </NxCard>
      ))}
    </div>
  );
}

type Mark = "none" | "keep" | "maybe" | "out";
const MARK_CYCLE: Record<Mark, Mark> = {
  none: "keep",
  keep: "maybe",
  maybe: "out",
  out: "none",
};
const MARK_STYLE: Record<Mark, { label: string; color: string }> = {
  none: { label: "—", color: "#11111122" },
  keep: { label: "KEEP", color: NEXUS_COLORS.lime },
  maybe: { label: "MAYBE", color: NEXUS_COLORS.amber },
  out: { label: "OUT", color: NEXUS_COLORS.terra },
};

/** Interactive: process-of-elimination grid for the five answer choices. */
function EliminationMatrix() {
  const letters = ["A", "B", "C", "D", "E"] as const;
  const [marks, setMarks] = useState<Record<string, Mark>>(
    Object.fromEntries(letters.map(l => [l, "none"]))
  );

  const cycle = (l: string) =>
    setMarks(prev => ({ ...prev, [l]: MARK_CYCLE[prev[l]] }));
  const reset = () =>
    setMarks(Object.fromEntries(letters.map(l => [l, "none"])));

  const kept = letters.filter(l => marks[l] === "keep" || marks[l] === "maybe");
  const verdict =
    kept.length === 1
      ? `Pick ${kept[0]} — it's the last one standing.`
      : kept.length === 0
        ? "Everything is eliminated. Re-read the stem; one elimination was too hasty."
        : `${kept.length} answers in play. Compare them head-to-head against the stem.`;

  return (
    <NxCard className="p-5">
      <div className="flex items-center justify-between">
        <NxLabel color={NEXUS_COLORS.pine}>Elimination Matrix</NxLabel>
        <NxButton variant="outline" onClick={reset}>
          Reset
        </NxButton>
      </div>
      <p className="mt-1 mb-4 text-sm text-black/60">
        Click a choice to cycle its status. Never leave an answer un-judged —
        POE turns a guess into a decision.
      </p>

      <div className="grid grid-cols-5 gap-2">
        {letters.map(l => {
          const m = marks[l];
          const style = MARK_STYLE[m];
          return (
            <button
              key={l}
              onClick={() => cycle(l)}
              className="nx-card-flat flex flex-col items-center gap-1 py-4 transition-all"
              style={{
                borderColor: style.color,
                background: m === "out" ? "rgba(208,69,42,0.06)" : undefined,
              }}
            >
              <span
                className="nx-display text-lg"
                style={{
                  textDecoration: m === "out" ? "line-through" : undefined,
                }}
              >
                {l}
              </span>
              <span
                className="nx-mono text-[9px] font-bold"
                style={{ color: style.color }}
              >
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-4 border-t-2 border-ink/10 pt-3 text-sm font-semibold"
        style={{ color: NEXUS_COLORS.pine }}
      >
        {verdict}
      </p>
    </NxCard>
  );
}

export default function Strategy({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Strategy & Mindset"
        title={tab}
        color={color}
        blurb={
          tab === "Pacing"
            ? "Timing benchmarks that keep you off the rocks under real conditions."
            : tab === "Answer Traps"
              ? "The wrong-answer archetypes the test recycles on every section."
              : "Practice process of elimination on the five answer choices."
        }
      />
      {tab === "Pacing" && <Pacing />}
      {tab === "Answer Traps" && <AnswerTraps />}
      {tab === "Elimination Matrix" && <EliminationMatrix />}
    </div>
  );
}
