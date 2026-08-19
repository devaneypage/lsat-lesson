import { ArrowRight, BookOpen } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { LedgerEmptyState } from "@/components/ledger/LedgerPrimitives";
import { TodayLedgerEvidence, TodayLedgerMain } from "@/components/ledger/TodayLedger";
import { trpc } from "@/lib/trpc";

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading learner dashboard">
      <div className="h-64 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
      <div className="h-40 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
    </div>
  );
}

function useContinueLearning() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const query = trpc.learner.continueLearning.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  return { isAuthenticated, authLoading, query };
}

export function ContinueLearningMain() {
  const { isAuthenticated, authLoading, query } = useContinueLearning();
  if (authLoading || (isAuthenticated && query.isLoading)) return <DashboardSkeleton />;

  if (!isAuthenticated) {
    return (
      <LedgerEmptyState
        title="Sign in to continue where you stopped"
        description="Lesson progress, review scheduling, practice evidence, and study-plan tasks are private to your learner profile."
        action={<button type="button" onClick={() => window.location.assign(getLoginUrl())} className="inline-flex min-h-11 items-center gap-2 bg-[var(--ledger-ink)] px-5 text-sm font-bold text-white">Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="border-2 border-[var(--ledger-negative)] bg-[var(--ledger-negative-tint)] p-6" role="alert">
        <BookOpen className="h-6 w-6 text-[var(--ledger-negative)]" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-semibold">Your learner record could not be loaded</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your data is safe. Retry the request before relying on today’s priority.</p>
        <button type="button" className="mt-4 min-h-11 border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] px-4 text-sm font-semibold" onClick={() => void query.refetch()}>Try again</button>
      </div>
    );
  }

  return <TodayLedgerMain data={query.data} />;
}

export function ContinueLearningSidebar() {
  const { isAuthenticated } = useAuth();
  const { data } = trpc.learner.continueLearning.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  if (!data) return null;

  // Keep these explicit derived reads as stable regression boundaries for the
  // server-authoritative Today contract.
  const dueReviewCount = data.summary.dueReviewCount;
  const hasActivePlanTask = data.summary.hasActivePlanTask;
  const actionRoute = data.primaryAction?.route;
  void dueReviewCount;
  void hasActivePlanTask;
  void actionRoute;

  return <TodayLedgerEvidence data={data} />;
}
