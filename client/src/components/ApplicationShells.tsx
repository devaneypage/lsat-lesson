import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
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

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={ROUTE_BY_ID.home.path}
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
        <rect x="1" y="1" width="26" height="26" rx="2" fill="var(--nexus-amber)" />
        <path
          d="M7 21V7L21 21V7"
          stroke="#111111"
          strokeWidth="2.8"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      <span className="font-display text-sm font-black uppercase tracking-[0.08em] text-[var(--nexus-amber)]">
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

function AccountBlock({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuth();
  return (
    <div className={`border-t border-border ${compact ? "px-3 py-3" : "p-4"}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nexus-navy)] text-sm font-black text-white">
          {(user?.name || user?.email || "L").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{user?.name || "Learner"}</p>
          {!compact ? <p className="truncate text-xs text-muted-foreground">{user?.email}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-sm p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function LearnerShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <LoadingShell label="Opening learner workspace" />;
  if (!user) return <SignInState />;

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-foreground md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <SkipLink />
      <aside className="hidden min-h-screen border-r border-border bg-card md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex h-16 items-center bg-[#1f1f1f] px-5">
          <BrandMark compact />
        </div>
        <div className="px-4 pb-2 pt-6">
          <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Study workspace</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-5" aria-label="Learner navigation">
          {LEARNER_NAV_ROUTES.map((route) => (
            <NavLink key={route.id} route={route} variant="learner" />
          ))}
        </nav>
        <AccountBlock />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:hidden">
          <BrandMark compact />
          <button
            type="button"
            className="rounded-sm p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={mobileOpen}
            aria-controls="learner-mobile-nav"
            aria-label={mobileOpen ? "Close study navigation" : "Open study navigation"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </header>
        {mobileOpen ? (
          <div id="learner-mobile-nav" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-card p-4 shadow-xl md:hidden">
            <nav className="space-y-1" aria-label="Learner mobile navigation">
              {LEARNER_NAV_ROUTES.map((route) => (
                <NavLink key={route.id} route={route} variant="learner" onNavigate={() => setMobileOpen(false)} />
              ))}
            </nav>
            <AccountBlock compact />
          </div>
        ) : null}
        <main id="main-content" className="min-h-screen">{children}</main>
      </div>
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
    <div className="container py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nexus-teal)]">Administrator workspace</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>
      <section className="mt-8 max-w-3xl border border-border bg-card p-6 shadow-sm" aria-labelledby="workspace-status-title">
        <div className="flex items-start gap-4">
          <Settings2 className="mt-1 h-5 w-5 shrink-0 text-[var(--nexus-amber)]" aria-hidden="true" />
          <div>
            <h2 id="workspace-status-title" className="font-display text-lg font-black">Current release status</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{status}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ReviewUnavailablePage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nexus-teal)]">Review</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Your review queue is not ready yet</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          LSAT Nexus will add questions here only after a server-authoritative practice attempt creates evidence that a question should be reviewed. No due items are inferred or fabricated.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={ROUTE_BY_ID.practice.path}>Start evidence-producing practice</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTE_BY_ID.learn.path}>Continue learning</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProgressEvidencePage() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nexus-teal)]">Progress</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Not enough evidence yet</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Progress will report only observed practice attempts, active timing, confidence calibration, review completion, and mapped skill evidence. Score gains, percentiles, and mastery estimates are withheld until their evidence thresholds are met.
        </p>
      </div>
      <section className="mt-8 max-w-3xl border border-border bg-card p-6 shadow-sm" aria-labelledby="progress-next-step-title">
        <div className="flex items-start gap-4">
          <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-[var(--nexus-amber)]" aria-hidden="true" />
          <div>
            <h2 id="progress-next-step-title" className="font-display text-lg font-black">How progress evidence begins</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Complete an evidence-producing practice session after the new attempt workflow is released. Historical local-only activity is not presented as authoritative performance data.
            </p>
            <Button asChild className="mt-5">
              <Link href={ROUTE_BY_ID.practice.path}>Open practice</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
