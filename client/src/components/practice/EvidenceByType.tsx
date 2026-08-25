import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../server/routers";
import { trpc } from "@/lib/trpc";

type TodayData = inferRouterOutputs<AppRouter>["learner"]["continueLearning"];
type TypeEvidence = TodayData["practiceEvidence"]["byType"][number];

export function EvidenceByType() {
  const { data, isLoading } = trpc.learner.continueLearning.useQuery();

  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-5 md:p-6">
      <h2 className="font-display text-lg font-semibold text-[var(--ledger-ink)]">Evidence by type</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Recent attempts recorded</p>
      {isLoading ? (
        <div className="mt-4 h-24 animate-pulse bg-[var(--ledger-track)]" />
      ) : data && data.practiceEvidence.byType.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {data.practiceEvidence.byType.map((item: TypeEvidence) => (
            <div key={item.key}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className={item.status === "provisional" ? "font-semibold text-[var(--ledger-provisional)]" : "font-semibold text-[var(--ledger-ink)]"}>{item.label}</span>
                <span className="tabular-nums text-muted-foreground">{item.status === "provisional" ? `${item.evidenceCount} attempts` : `${item.accuracyPercent}% · ${item.evidenceCount} q`}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-[var(--ledger-track)]">
                <div className="h-full bg-[var(--ledger-ink)]" style={{ width: `${item.accuracyPercent}%` }} />
              </div>
            </div>
          ))}
          <p className="border-t-2 border-[var(--ledger-rule)] pt-3 text-[0.68rem] leading-5 text-muted-foreground">
            Bars appear only for types with {data.practiceEvidence.establishedEvidenceCount}+ recorded attempts. No estimates are shown without evidence.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No practice evidence recorded yet. Complete a set to begin an explainable skill record.</p>
      )}
    </div>
  );
}
