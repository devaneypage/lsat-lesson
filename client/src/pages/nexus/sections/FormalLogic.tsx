import { useMemo, useState } from "react";
import { CONDITIONALS, INFERENCE_RULES, NEXUS_COLORS } from "@/lib/nexus/data";
import {
  NxBadge,
  NxButton,
  NxCard,
  NxLabel,
  NxSectionHeader,
} from "../components/primitives";

function Translations() {
  return (
    <NxCard className="overflow-hidden">
      <div
        className="grid grid-cols-[1.4fr_1fr_1fr] border-b-2 border-ink"
        style={{ background: NEXUS_COLORS.amber }}
      >
        {["English", "Arrow Form", "Contrapositive"].map(h => (
          <div key={h} className="nx-label px-3 py-2 font-bold text-ink">
            {h}
          </div>
        ))}
      </div>
      {CONDITIONALS.map((c, i) => (
        <div
          key={c.english}
          className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-ink/10 text-[13px]"
          style={{ background: i % 2 ? "#F4EFE2" : "transparent" }}
        >
          <div className="px-3 py-2">
            <div>{c.english}</div>
            <div className="nx-mono text-[10px] text-black/40">{c.note}</div>
          </div>
          <div
            className="nx-mono px-3 py-2"
            style={{ color: NEXUS_COLORS.terra }}
          >
            {c.arrow}
          </div>
          <div className="nx-mono px-3 py-2 text-black/70">
            {c.contrapositive}
          </div>
        </div>
      ))}
    </NxCard>
  );
}

function InferenceRules() {
  return (
    <NxCard className="p-4">
      <NxLabel className="text-black/40">Quantifier Combination Rules</NxLabel>
      <div className="mt-3 space-y-3">
        {INFERENCE_RULES.map(r => (
          <div
            key={r.name}
            className="flex items-center gap-3 border-l-[3px] py-1 pl-3"
            style={{ borderColor: r.color }}
          >
            <div className="flex-1">
              <div
                className="nx-mono text-[13px] font-bold"
                style={{ color: r.color }}
              >
                {r.rule}
              </div>
              <div className="text-[11px] text-black/50">{r.name}</div>
            </div>
          </div>
        ))}
      </div>
    </NxCard>
  );
}

/** Interactive: given an English statement, pick the correct arrow form. */
function ConditionalTrainer() {
  const pool = useMemo(
    () =>
      CONDITIONALS.filter(c => c.arrow !== "—" && !c.arrow.includes("some")),
    []
  );
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * pool.length));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const current = pool[idx];
  const options = useMemo(() => {
    const distractors = Array.from(new Set(pool.map(c => c.arrow)))
      .filter(a => a !== current.arrow)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [current.arrow, ...distractors].sort(() => Math.random() - 0.5);
  }, [current, pool]);

  const answered = picked !== null;

  const choose = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    setScore(s => ({
      correct: s.correct + (opt === current.arrow ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const next = () => {
    setPicked(null);
    setIdx(Math.floor(Math.random() * pool.length));
  };

  return (
    <NxCard className="p-5">
      <div className="flex items-center justify-between">
        <NxLabel color={NEXUS_COLORS.amber}>Conditional Logic Trainer</NxLabel>
        <NxBadge color={NEXUS_COLORS.pine}>
          {score.correct}/{score.total} correct
        </NxBadge>
      </div>

      <p className="mt-4 text-sm text-black/50">
        Translate this statement into arrow form:
      </p>
      <p className="nx-display mt-1 text-xl">"{current.english}"</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map(opt => {
          const isCorrect = opt === current.arrow;
          const show = answered && (isCorrect || opt === picked);
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={answered}
              className="nx-card-flat nx-mono px-3 py-3 text-left text-sm transition-all disabled:cursor-default"
              style={
                show
                  ? {
                      borderColor: isCorrect
                        ? NEXUS_COLORS.lime
                        : NEXUS_COLORS.terra,
                      background: isCorrect
                        ? "rgba(121,197,62,0.12)"
                        : "rgba(208,69,42,0.08)",
                    }
                  : undefined
              }
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 border-t-2 border-ink/10 pt-3">
          <p className="text-sm">
            {picked === current.arrow ? (
              <span
                style={{ color: NEXUS_COLORS.pine }}
                className="font-semibold"
              >
                ✓ Correct.
              </span>
            ) : (
              <span
                style={{ color: NEXUS_COLORS.terra }}
                className="font-semibold"
              >
                ✗ Not quite — the answer is {current.arrow}.
              </span>
            )}{" "}
            <span className="text-black/60">{current.note}.</span>
          </p>
          <p className="nx-mono mt-1 text-[12px] text-black/50">
            Contrapositive: {current.contrapositive}
          </p>
          <div className="mt-3">
            <NxButton color={NEXUS_COLORS.amber} onClick={next}>
              Next statement →
            </NxButton>
          </div>
        </div>
      )}
    </NxCard>
  );
}

export default function FormalLogic({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Formal Logic"
        title={tab}
        color={color}
        blurb={
          tab === "Translations"
            ? "Map common English phrasings to conditional arrows and their contrapositives."
            : tab === "Inference Rules"
              ? "Legal ways to chain conditionals and quantifiers together."
              : "Drill English-to-symbol translation until it's automatic."
        }
      />
      {tab === "Translations" && <Translations />}
      {tab === "Inference Rules" && <InferenceRules />}
      {tab === "Conditional Trainer" && <ConditionalTrainer />}
    </div>
  );
}
