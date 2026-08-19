import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PageFrame, PageHeader, StatePanel } from "@/components/PagePrimitives";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ADMIN_NAV_ROUTES,
  AppRouteDefinition,
  canonicalizeAppPath,
  LEARNER_NAV_ROUTES,
  PUBLIC_NAV_ROUTES,
  ROUTE_BY_ID,
} from "@/lib/routes";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  FileSearch,
  Flag,
  FolderKanban,
  Home,
  LayoutDashboard,
  Library,
  ListChecks,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const ICONS: Record<string, typeof Home> = {
  home: Home,
  about: CircleUserRound,
  booking: CalendarDays,
  today: LayoutDashboard,
  learn: BookOpen,
  practice: FileSearch,
  review: ListChecks,
  progress: BarChart3,
  plan: ClipboardList,
  resources: Library,
  adminOverview: ShieldCheck,
  adminContent: FolderKanban,
  adminImport: Upload,
  adminTaxonomy: Tags,
  adminFlags: Flag,
  adminAnalytics: BarChart3,
};

function BrandMark({ compact = false, ledger = false }: { compact?: boolean; ledger?: boolean }) {
  return (
    <Link
      href={ledger ? ROUTE_BY_ID.today.path : ROUTE_BY_ID.home.path}
      className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="LSAT Nexus home"
    >
      <svg
        width={compact ? 26 : 30}
        height={compact ? 26 : 30}
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="26" height="26" rx="1" fill={ledger ? "var(--ledger-ink)" : "var(--nexus-amber)"} />
        <path
          d="M7 21V7L21 21V7"
          stroke={ledger ? "#FFFFFF" : "#111111"}
          strokeWidth="2.8"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      <span className={ledger ? "font-display text-base font-semibold tracking-[-0.01em] text-[var(--ledger-ink)]" : "font-display text-sm font-black uppercase tracking-[0.08em] text-[var(--nexus-amber)]"}>
        LSAT Nexus
      </span>
    </Link>
  );
}

function isRouteActive(location: string, route: AppRouteDefinition) {
  const canonical = canonicalizeAppPath(location);
  if (route.end) return canonical === route.path;
  return canonical === route.path || canonical.startsWith(`${route.path}/`);
}

function LedgerDesktopNavLink({ route }: { route: AppRouteDefinition }) {
  const [location] = useLocation();
  const active = isRouteActive(location, route);
  return (
    <Link
      href={route.path}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex min-h-11 items-center px-3 text-[0.78rem] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "text-[var(--ledger-ink)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[var(--ledger-accent)]" : "text-muted-foreground hover:text-[var(--ledger-ink)]"}`}
    >
      {route.label}
    </Link>
  );
}

function LedgerMobileNavLink({ route }: { route: AppRouteDefinition }) {
  const [location] = useLocation();
  const active = isRouteActive(location, route);
  const Icon = ICONS[route.id] ?? ChevronRight;
  return (
    <Link
      href={route.path}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.62rem] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${active ? "text-[var(--ledger-accent)] before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:bg-[var(--ledger-accent)]" : "text-muted-foreground"}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{route.label}</span>
    </Link>
  );
}

function NavLink({
  route,
  onNavigate,
  variant,
}: {
  route: AppRouteDefinition;
  onNavigate?: () => void;
  variant: "public" | "learner" | "admin";
}) {
  const [location] = useLocation();
  const active = isRouteActive(location, route);
  const Icon = ICONS[route.id] ?? ChevronRight;

  const base =
    "group inline-flex items-center gap-2 rounded-sm text-sm font-semibold transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const className =
    variant === "public"
      ? `${base} px-3 py-2 ${active ? "bg-white/10 text-white" : "text-stone-300 hover:bg-white/5 hover:text-white"}`
      : variant === "learner"
        ? `${base} relative w-full px-3 py-2.5 ${
            active
              ? "bg-[var(--workspace-rail-raised)] text-[var(--workspace-rail-foreground)] shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-[var(--nexus-amber)]"
              : "text-[var(--workspace-rail-muted)] hover:bg-white/5 hover:text-[var(--workspace-rail-foreground)]"
          }`
        : `${base} w-full px-3 py-2.5 ${
          active
            ? "bg-[var(--nexus-navy)] text-white shadow-sm"
            : "text-foreground/75 hover:bg-muted hover:text-foreground"
        }`;

  return (
    <Link
      href={route.path}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{route.label}</span>
    </Link>
  );
}

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-sm bg-background px-4 py-2 font-semibold text-foreground shadow-lg transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}

function LoadingShell({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto mb-5 h-8 w-8 animate-pulse rounded-sm bg-[var(--nexus-amber)]" />
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking your workspace access.</p>
        </div>
      </div>
    </div>
  );
}

function SignInState() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6">
        <section className="w-full border border-border bg-card p-8 shadow-sm" aria-labelledby="sign-in-title">
          <BrandMark />
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-[var(--nexus-teal)]">
            Learner workspace
          </p>
          <h1 id="sign-in-title" className="mt-2 font-display text-3xl font-black tracking-tight">
            Sign in to continue learning
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Your lessons, practice history, review queue, progress evidence, and study plan are private to your account.
          </p>
          <Button className="mt-7 w-full" size="lg" onClick={() => (window.location.href = getLoginUrl())}>
            Sign in to LSAT Nexus
          </Button>
          <Link href={ROUTE_BY_ID.home.path} className="mt-4 inline-flex text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline">
            Return to the public site
          </Link>
        </section>
      </div>
    </div>
  );
}

function ForbiddenState() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6 text-center">
        <section className="w-full border border-border bg-card p-8 shadow-sm" aria-labelledby="admin-access-title">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 id="admin-access-title" className="mt-5 font-display text-3xl font-black tracking-tight">
            Administrator access required
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            This workspace is restricted to authorized administrators. Learner accounts cannot open administrative tools.
          </p>
          <Button asChild className="mt-7">
            <Link href={ROUTE_BY_ID.today.path}>Return to learner workspace</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      <header className="sticky top-0 z-50 border-b border-black bg-[#1f1f1f] text-white shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4">
          <BrandMark />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Public navigation">
            {PUBLIC_NAV_ROUTES.filter((route) => route.id !== "booking").map((route) => (
              <NavLink key={route.id} route={route} variant="public" />
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={ROUTE_BY_ID.booking.path}
              className="rounded-sm border border-[var(--nexus-amber)] px-3 py-2 text-sm font-bold text-[var(--nexus-amber)] transition-colors hover:bg-[var(--nexus-amber)] hover:text-black"
            >
              Book a session
            </Link>
            <Link
              href={ROUTE_BY_ID.today.path}
              className="rounded-sm bg-[var(--nexus-teal)] px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-[#35bdca]"
            >
              {user ? "Open workspace" : "Learner sign in"}
            </Link>
          </div>
          <button
            type="button"
            className="rounded-sm p-2 text-[var(--nexus-amber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nexus-amber)] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-nav"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {mobileOpen ? (
          <nav id="public-mobile-nav" className="border-t border-white/10 px-4 py-4 md:hidden" aria-label="Public mobile navigation">
            <div className="flex flex-col gap-1">
              {PUBLIC_NAV_ROUTES.map((route) => (
                <NavLink key={route.id} route={route} variant="public" onNavigate={() => setMobileOpen(false)} />
              ))}
              <Link
                href={ROUTE_BY_ID.today.path}
                className="mt-2 rounded-sm bg-[var(--nexus-teal)] px-3 py-2.5 text-center text-sm font-bold text-black"
                onClick={() => setMobileOpen(false)}
              >
                {user ? "Open learner workspace" : "Learner sign in"}
              </Link>
            </div>
          </nav>
        ) : null}
      </header>
      <main id="main-content">{children}</main>
    </div>
  );
}

function AccountBlock({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  const { user, logout } = useAuth();
  const dark = tone === "dark";
  return (
    <div className={`border-t ${dark ? "border-[var(--workspace-rail-border)]" : "border-border"} ${compact ? "px-3 py-3" : "p-4"}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${dark ? "bg-[var(--nexus-amber)] text-[var(--workspace-rail)]" : "bg-[var(--nexus-navy)] text-white"}`}>
          {(user?.name || user?.email || "L").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-bold ${dark ? "text-[var(--workspace-rail-foreground)]" : ""}`}>{user?.name || "Learner"}</p>
          {!compact ? <p className={`truncate text-xs ${dark ? "text-[var(--workspace-rail-muted)]" : "text-muted-foreground"}`}>{user?.email}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className={`rounded-sm p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${dark ? "text-[var(--workspace-rail-muted)] hover:bg-white/5 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function LearnerShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const workspaceQuery = trpc.learner.continueLearning.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });

  if (loading) return <LoadingShell label="Opening learner workspace" />;
  if (!user) return <SignInState />;

  const primaryRoutes = LEARNER_NAV_ROUTES.filter((route) => route.navGroup === "primary");
  const mobileRoutes = primaryRoutes.filter((route) => route.id !== "plan").slice(0, 5);
  const targetTestDate = workspaceQuery.data?.workspaceContext?.targetTestDate ?? null;
  const targetLabel = targetTestDate
    ? `Test ${new Date(targetTestDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
    : "Set test date";

  return (
    <div className="learner-ledger min-h-screen bg-[var(--ledger-paper)] text-[var(--ledger-ink)]">
      <SkipLink />
      <header className="sticky top-0 z-50 border-b-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)]">
        <div className="ledger-desktop-nav mx-auto hidden h-16 max-w-[1440px] items-stretch px-8 lg:flex">
          <div className="flex shrink-0 items-center border-r-2 border-[var(--ledger-rule)] pr-8">
            <BrandMark compact ledger />
          </div>
          <nav className="flex min-w-0 flex-1 items-stretch gap-1 px-7" aria-label="Learner navigation">
            {primaryRoutes.map((route) => <LedgerDesktopNavLink key={route.id} route={route} />)}
          </nav>
          <div className="flex shrink-0 items-center gap-4 border-l-2 border-[var(--ledger-rule)] pl-6">
            <Link href={ROUTE_BY_ID.plan.path} className="text-[0.68rem] font-bold uppercase tracking-[0.09em] text-muted-foreground hover:text-[var(--ledger-accent)]">
              {targetLabel}
            </Link>
            <details className="group relative">
              <summary className="flex h-9 w-9 list-none items-center justify-center bg-[var(--ledger-ink)] text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden" aria-label="Open account menu">
                {(user.name || user.email || "L").charAt(0).toUpperCase()}
              </summary>
              <div className="absolute right-0 top-11 z-50 w-64 border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] p-2 shadow-xl">
                <div className="border-b-2 border-[var(--ledger-rule)] px-3 py-2">
                  <p className="truncate text-sm font-bold">{user.name || "Learner"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link href={ROUTE_BY_ID.resources.path} className="mt-2 flex min-h-11 items-center px-3 text-sm font-semibold hover:bg-[var(--ledger-accent-tint)]">Resources</Link>
                <button type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center px-3 text-left text-sm font-semibold hover:bg-[var(--ledger-negative-tint)] hover:text-[var(--ledger-negative)]">Sign out</button>
              </div>
            </details>
          </div>
        </div>

        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <BrandMark compact ledger />
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{targetLabel}</span>
            <details className="group relative">
              <summary className="flex min-h-11 min-w-11 list-none items-center justify-center text-[var(--ledger-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden" aria-label="Open more navigation">
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 top-12 z-50 w-64 border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] p-2 shadow-xl">
                <Link href={ROUTE_BY_ID.plan.path} className="flex min-h-11 items-center px-3 text-sm font-semibold hover:bg-[var(--ledger-accent-tint)]">Plan</Link>
                <Link href={ROUTE_BY_ID.resources.path} className="flex min-h-11 items-center px-3 text-sm font-semibold hover:bg-[var(--ledger-accent-tint)]">Resources</Link>
                <div className="border-t-2 border-[var(--ledger-rule)] px-3 py-2">
                  <p className="truncate text-sm font-bold">{user.name || "Learner"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center px-3 text-left text-sm font-semibold hover:bg-[var(--ledger-negative-tint)] hover:text-[var(--ledger-negative)]">Sign out</button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main id="main-content" className="ledger-mobile-content min-h-screen lg:pb-0">{children}</main>

      <nav className="ledger-mobile-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] lg:hidden" aria-label="Learner mobile navigation">
        {mobileRoutes.map((route) => <LedgerMobileNavLink key={route.id} route={route} />)}
      </nav>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <LoadingShell label="Opening administrator workspace" />;
  if (!user) return <SignInState />;
  if (user.role !== "admin") return <ForbiddenState />;

  return (
    <div className="min-h-screen bg-muted/35 text-foreground md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <SkipLink />
      <aside className="hidden min-h-screen border-r border-border bg-card md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex h-16 items-center bg-[#1f1f1f] px-5">
          <BrandMark compact />
        </div>
        <div className="px-4 pb-2 pt-6">
          <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Administration</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-5" aria-label="Administrator navigation">
          {ADMIN_NAV_ROUTES.map((route) => (
            <NavLink key={route.id} route={route} variant="admin" />
          ))}
        </nav>
        <div className="px-4 pb-3">
          <Link
            href={ROUTE_BY_ID.today.path}
            className="inline-flex w-full items-center justify-between rounded-sm border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Learner workspace
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <AccountBlock />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:hidden">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <span className="hidden text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground min-[410px]:inline">Admin</span>
          </div>
          <button
            type="button"
            className="rounded-sm p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
            aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </header>
        {mobileOpen ? (
          <div id="admin-mobile-nav" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-card p-4 shadow-xl md:hidden">
            <nav className="space-y-1" aria-label="Administrator mobile navigation">
              {ADMIN_NAV_ROUTES.map((route) => (
                <NavLink key={route.id} route={route} variant="admin" onNavigate={() => setMobileOpen(false)} />
              ))}
            </nav>
            <Link
              href={ROUTE_BY_ID.today.path}
              className="mt-4 inline-flex w-full items-center justify-between rounded-sm border border-border px-3 py-2 text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Learner workspace
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <AccountBlock compact />
          </div>
        ) : null}
        <main id="main-content" className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export function AdminWorkspacePlaceholder({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <PageFrame>
      <PageHeader eyebrow="Administrator workspace" title={title} description={description} />
      <StatePanel
        icon={Settings2}
        eyebrow="Current release status"
        title="Workspace migration in progress"
        description={status}
        tone="warning"
        className="max-w-3xl"
      />
    </PageFrame>
  );
}

export function ReviewUnavailablePage() {
  return (
    <PageFrame width="reading">
      <StatePanel
        icon={ListChecks}
        eyebrow="Review"
        title="Your review queue is not ready yet"
        description="LSAT Nexus will add questions here only after a server-authoritative practice attempt creates evidence that a question should be reviewed. No due items are inferred or fabricated."
        tone="info"
        action={<Button asChild><Link href={ROUTE_BY_ID.practice.path}>Start evidence-producing practice</Link></Button>}
        secondaryAction={<Button asChild variant="outline"><Link href={ROUTE_BY_ID.learn.path}>Continue learning</Link></Button>}
      />
    </PageFrame>
  );
}

export function ProgressEvidencePage() {
  return (
    <PageFrame width="reading">
      <StatePanel
        icon={BarChart3}
        eyebrow="Progress"
        title="Not enough evidence yet"
        description={<>Progress reports only observed practice attempts, active timing, confidence calibration, review completion, and mapped skill evidence. Score gains, percentiles, and mastery estimates remain withheld until their evidence thresholds are met.<span className="mt-4 block">Complete an evidence-producing practice session after the new attempt workflow is released. Historical local-only activity is not presented as authoritative performance data.</span></>}
        tone="info"
        action={<Button asChild><Link href={ROUTE_BY_ID.practice.path}>Open practice</Link></Button>}
      />
    </PageFrame>
  );
}
