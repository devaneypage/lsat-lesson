import { Link } from "wouter";
import { LedgerHeader } from "@/components/ledger/LedgerPrimitives";
import { EvidenceByType } from "@/components/practice/EvidenceByType";
import { RecommendedSets } from "@/components/practice/RecommendedSets";
import { SetBuilder } from "@/components/practice/SetBuilder";

export default function Practice() {
  return (
    <div className="space-y-6">
      <LedgerHeader
        title="Practice"
        description="Build a set, or start a recommended drill. Every attempt becomes evidence."
        meta={<Link href="/question-bank" className="text-xs font-semibold text-[var(--ledger-accent)] hover:underline">Browse all questions →</Link>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
        <div className="space-y-6">
          <SetBuilder />
          <RecommendedSets />
        </div>
        <div className="space-y-6">
          <EvidenceByType />
        </div>
      </div>
    </div>
  );
}
