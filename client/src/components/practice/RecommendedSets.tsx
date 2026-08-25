import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/** Real, evidence-backed recommendations only — no fabricated schedule cards. */
export function RecommendedSets() {
  const { data } = trpc.learner.continueLearning.useQuery();
  const [, navigate] = useLocation();
  if (!data) return null;

  const cards: { eyebrow: string; title: string; detail: string; onClick: () => void; highlight?: boolean }[] = [];

  const action = data.primaryAction;
  if (action && "lesson" in action) {
    cards.push({
      eyebrow: `From ${action.lesson.title}`,
      title: `${action.lesson.section} checkpoint`,
      detail: "10 questions · untimed",
      highlight: true,
      onClick: () => navigate(`/practice/drill?length=10&timed=0`),
    });
  }

  const weakest = [...data.practiceEvidence.byType]
    .filter((s) => s.status === "established")
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)[0];
  if (weakest) {
    cards.push({
      eyebrow: "Weak spot",
      title: `${weakest.label} refresher`,
      detail: `5 questions · ${weakest.accuracyPercent}% recent accuracy`,
      onClick: () => navigate(`/practice/drill?category=${encodeURIComponent(weakest.label)}&length=5&timed=0`),
    });
  }

  if (cards.length === 0) return null;

  return (
    <div>
      <p className="font-mono text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[var(--ledger-faint)]">Recommended for you</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={card.onClick}
            className={`relative flex-1 border-2 bg-[var(--ledger-surface)] px-5 py-4 text-left ${card.highlight ? "border-[var(--ledger-rule)]" : "border-[var(--ledger-rule)]"}`}
          >
            {card.highlight ? <span className="absolute -left-[2px] -top-[2px] bottom-[-2px] w-1 bg-[var(--ledger-accent)]" /> : null}
            <p className={`font-mono text-[0.65rem] font-bold uppercase tracking-[0.1em] ${card.highlight ? "text-[var(--ledger-accent)]" : "text-muted-foreground"}`}>{card.eyebrow}</p>
            <p className="mt-1.5 font-display text-base font-semibold text-[var(--ledger-ink)]">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
