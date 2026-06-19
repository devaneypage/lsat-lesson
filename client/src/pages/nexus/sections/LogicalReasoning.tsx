import { useState } from "react";
import { FALLACIES, LR_QUESTION_TYPES, NEXUS_COLORS } from "@/lib/nexus/data";
import {
  NxBadge,
  NxButton,
  NxCard,
  NxLabel,
  NxSectionHeader,
} from "../components/primitives";

function QuestionTypes() {
  const [open, setOpen] = useState<string | null>("mbt");
  return (
    <div className="grid gap-3">
      {LR_QUESTION_TYPES.map(q => {
        const isOpen = open === q.id;
        return (
          <NxCard key={q.id} flat className="overflow-hidden">
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setOpen(isOpen ? null : q.id)}
            >
              <span
                className="inline-block h-7 w-7 flex-shrink-0"
                style={{ background: q.color }}
              />
              <span className="nx-display flex-1 text-base">{q.name}</span>
              <NxBadge color={q.color}>{q.tip}</NxBadge>
              <span className="nx-mono text-lg">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="space-y-3 border-t-2 border-ink/10 px-4 py-4">
                <div>
                  <NxLabel className="text-black/40">Stem Pattern</NxLabel>
                  <p
                    className="mt-1 border-l-[3px] pl-3 text-sm italic text-black/70"
                    style={{ borderColor: q.color }}
                  >
                    "{q.stem}"
                  </p>
                </div>
                <div>
                  <NxLabel className="text-black/40">Strategy</NxLabel>
                  <p className="mt-1 text-sm text-black/80">{q.strategy}</p>
                </div>
              </div>
            )}
          </NxCard>
        );
      })}
    </div>
  );
}

function FallacyForest() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FALLACIES.map(f => {
        const isOpen = open === f.abbr;
        return (
          <NxCard key={f.abbr} flat className="overflow-hidden">
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setOpen(isOpen ? null : f.abbr)}
            >
              <NxBadge color={NEXUS_COLORS.terra} filled>
                {f.abbr}
              </NxBadge>
              <span className="nx-display flex-1 text-sm">{f.name}</span>
              <span className="nx-mono text-lg">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="space-y-2 border-t-2 border-ink/10 px-4 py-3">
                <p className="text-[12px] text-black/70">{f.definition}</p>
                <p className="nx-mono border-l-2 border-terra pl-2 text-[10px] italic text-black/50">
                  {f.example}
                </p>
              </div>
            )}
          </NxCard>
        );
      })}
    </div>
  );
}

/** Interactive: assemble premises + conclusion, then surface the gap to attack. */
function ArgumentBuilder() {
  const [premises, setPremises] = useState<string[]>([""]);
  const [conclusion, setConclusion] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const update = (i: number, v: string) =>
    setPremises(prev => prev.map((p, idx) => (idx === i ? v : p)));

  const filledPremises = premises.map(p => p.trim()).filter(Boolean);
  const canAnalyze = filledPremises.length > 0 && conclusion.trim().length > 0;

  return (
    <NxCard className="p-5">
      <NxLabel color={NEXUS_COLORS.terra}>Argument Builder Lab</NxLabel>
      <p className="mt-1 mb-4 text-sm text-black/60">
        Lay out the premises and conclusion. The lab highlights the assumption
        gap — the bridge the author needs but never states.
      </p>

      <div className="space-y-2">
        {premises.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <NxLabel className="w-16 text-black/40">P{i + 1}</NxLabel>
            <input
              value={p}
              onChange={e => {
                update(i, e.target.value);
                setAnalyzed(false);
              }}
              placeholder="State a premise…"
              className="nx-card-flat w-full bg-white px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
        <NxButton
          variant="outline"
          onClick={() => setPremises(prev => [...prev, ""])}
        >
          + Add premise
        </NxButton>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <NxLabel className="w-16" color={NEXUS_COLORS.terra}>
          ∴ Conc
        </NxLabel>
        <input
          value={conclusion}
          onChange={e => {
            setConclusion(e.target.value);
            setAnalyzed(false);
          }}
          placeholder="State the conclusion…"
          className="nx-card-flat w-full bg-white px-3 py-2 text-sm outline-none"
          style={{ borderColor: NEXUS_COLORS.terra }}
        />
      </div>

      <div className="mt-4">
        <NxButton
          color={NEXUS_COLORS.terra}
          disabled={!canAnalyze}
          onClick={() => setAnalyzed(true)}
        >
          Find the gap
        </NxButton>
      </div>

      {analyzed && (
        <div className="mt-4 space-y-3 border-t-2 border-ink/10 pt-4">
          <div
            className="nx-card-flat bg-cream/40 p-3"
            style={{ background: "#F4EFE2" }}
          >
            <NxLabel className="text-black/40">Reconstructed argument</NxLabel>
            <ul className="mt-2 space-y-1 text-sm">
              {filledPremises.map((p, i) => (
                <li key={i}>
                  <span className="nx-mono text-black/40">P{i + 1}.</span> {p}
                </li>
              ))}
              <li
                className="font-semibold"
                style={{ color: NEXUS_COLORS.terra }}
              >
                <span className="nx-mono">∴</span> {conclusion}
              </li>
            </ul>
          </div>
          <div
            className="nx-card-flat p-3"
            style={{ borderColor: NEXUS_COLORS.amber }}
          >
            <NxLabel color={NEXUS_COLORS.amber}>The assumption gap</NxLabel>
            <p className="mt-1 text-sm text-black/80">
              The author treats the premises above as enough to prove the
              conclusion. The necessary assumption is whatever <em>connects</em>{" "}
              the new term(s) in the conclusion to the premises. Negate a
              candidate assumption — if the argument collapses, you've found it.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-black/60">
              <li>To weaken: deny that bridge.</li>
              <li>To strengthen: affirm or guarantee that bridge.</li>
              <li>To name the flaw: identify why the leap isn't justified.</li>
            </ul>
          </div>
        </div>
      )}
    </NxCard>
  );
}

export default function LogicalReasoning({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Logical Reasoning"
        title={tab}
        color={color}
        blurb={
          tab === "Question Types"
            ? "Every LR question type with its stem signature and attack plan."
            : tab === "Fallacy Forest"
              ? "The recurring reasoning errors the test rewards you for naming."
              : "Build an argument and expose the assumption gap."
        }
      />
      {tab === "Question Types" && <QuestionTypes />}
      {tab === "Fallacy Forest" && <FallacyForest />}
      {tab === "Argument Builder" && <ArgumentBuilder />}
    </div>
  );
}
