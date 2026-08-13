import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AdminShell,
  AdminWorkspacePlaceholder,
  LearnerShell,
  ProgressEvidencePage,
  PublicShell,
  ReviewUnavailablePage,
} from "@/components/ApplicationShells";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { CommandPalette } from "@/components/CommandPalette";
import { RouteOrientation } from "@/components/ContextualOrientationHeader";
import PathSelector from "@/components/PathSelector";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PathProvider } from "@/contexts/PathContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useLegacyProgressImport } from "@/hooks/useLegacyProgressImport";
import About from "@/pages/About";
import Booking from "@/pages/Booking";
import CurriculumGuide from "@/pages/CurriculumGuide";
import Dashboard from "@/pages/Dashboard";
import FlagAdmin from "@/pages/FlagAdmin";
import LessonPlanGenerator from "@/pages/LessonPlanGenerator";
import Lessons from "@/pages/Lessons";
import NotFound from "@/pages/NotFound";
import QuestionBank from "@/pages/QuestionBank";
import QuestionAuthoring from "@/pages/QuestionAuthoring";
import Resources from "@/pages/Resources";
import TagManager from "@/pages/TagManager";
import LessonCommonFlaws from "@/pages/lessons/LessonCommonFlaws";
import LessonFlawInReasoning from "@/pages/lessons/LessonFlawInReasoning";
import LessonFormalLogic from "@/pages/lessons/LessonFormalLogic";
import LessonNecessaryAssumptions from "@/pages/lessons/LessonNecessaryAssumptions";
import LessonReadingComprehension from "@/pages/lessons/LessonReadingComprehension";
import LessonStrengthenWeaken from "@/pages/lessons/LessonStrengthenWeaken";
import LessonSufficientAssumptions from "@/pages/lessons/LessonSufficientAssumptions";
import { Route, Switch } from "wouter";

function LearnerStateBridge() {
  useLegacyProgressImport();
  return null;
}

function PublicPage({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}

function LearnerPage({ children }: { children: React.ReactNode }) {
  return (
    <LearnerShell>
      <RouteOrientation />
      {children}
    </LearnerShell>
  );
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

function TodayRoute() {
  return <LearnerPage><Dashboard /></LearnerPage>;
}

function LearnRoute() {
  return <LearnerPage><Lessons /></LearnerPage>;
}

function PracticeRoute() {
  return <LearnerPage><QuestionBank /></LearnerPage>;
}

function PlanRoute() {
  return <LearnerPage><LessonPlanGenerator /></LearnerPage>;
}

function Router() {
  return (
    <Switch>
      {/* Public shell */}
      <Route path="/">
        <PublicPage><PathSelector /></PublicPage>
      </Route>
      <Route path="/about">
        <PublicPage><About /></PublicPage>
      </Route>
      <Route path="/booking">
        <PublicPage><Booking /></PublicPage>
      </Route>

      {/* Canonical learner shell */}
      <Route path="/today" component={TodayRoute} />
      <Route path="/learn" component={LearnRoute} />
      <Route path="/practice" component={PracticeRoute} />
      <Route path="/review">
        <LearnerPage><ReviewUnavailablePage /></LearnerPage>
      </Route>
      <Route path="/progress">
        <LearnerPage><ProgressEvidencePage /></LearnerPage>
      </Route>
      <Route path="/plan" component={PlanRoute} />
      <Route path="/resources">
        <LearnerPage><Resources /></LearnerPage>
      </Route>

      {/* Canonical learner lesson routes */}
      <Route path="/learn/necessary-assumptions">
        <LearnerPage><LessonNecessaryAssumptions /></LearnerPage>
      </Route>
      <Route path="/learn/common-flaws">
        <LearnerPage><LessonCommonFlaws /></LearnerPage>
      </Route>
      <Route path="/learn/strengthen-weaken">
        <LearnerPage><LessonStrengthenWeaken /></LearnerPage>
      </Route>
      <Route path="/learn/reading-comprehension">
        <LearnerPage><LessonReadingComprehension /></LearnerPage>
      </Route>
      <Route path="/learn/formal-logic">
        <LearnerPage><LessonFormalLogic /></LearnerPage>
      </Route>
      <Route path="/learn/sufficient-assumptions">
        <LearnerPage><LessonSufficientAssumptions /></LearnerPage>
      </Route>
      <Route path="/learn/flaw-in-reasoning">
        <LearnerPage><LessonFlawInReasoning /></LearnerPage>
      </Route>

      {/* Compatibility aliases retained during link migration */}
      <Route path="/dashboard" component={TodayRoute} />
      <Route path="/lessons" component={LearnRoute} />
      <Route path="/question-bank" component={PracticeRoute} />
      <Route path="/lesson-plan-generator" component={PlanRoute} />
      <Route path="/session-plan-generator" component={PlanRoute} />
      <Route path="/study-guide">
        <LearnerPage><Resources /></LearnerPage>
      </Route>
      <Route path="/lessons/necessary-assumptions">
        <LearnerPage><LessonNecessaryAssumptions /></LearnerPage>
      </Route>
      <Route path="/lessons/common-flaws">
        <LearnerPage><LessonCommonFlaws /></LearnerPage>
      </Route>
      <Route path="/lessons/strengthen-weaken">
        <LearnerPage><LessonStrengthenWeaken /></LearnerPage>
      </Route>
      <Route path="/lessons/reading-comprehension">
        <LearnerPage><LessonReadingComprehension /></LearnerPage>
      </Route>
      <Route path="/lessons/formal-logic">
        <LearnerPage><LessonFormalLogic /></LearnerPage>
      </Route>
      <Route path="/lessons/sufficient-assumptions">
        <LearnerPage><LessonSufficientAssumptions /></LearnerPage>
      </Route>
      <Route path="/lessons/flaw-in-reasoning">
        <LearnerPage><LessonFlawInReasoning /></LearnerPage>
      </Route>

      {/* Administrator shell */}
      <Route path="/admin">
        <AdminPage>
          <AdminWorkspacePlaceholder
            title="Administration overview"
            description="Content, taxonomy, feature rollout, imports, and aggregate analytics are separated from learner study workflows."
            status="Feature flags are operational. Content import and analytics remain unavailable until their server-authoritative workflows are implemented and verified."
          />
        </AdminPage>
      </Route>
      <Route path="/admin/content">
        <AdminPage><CurriculumGuide /></AdminPage>
      </Route>
      <Route path="/admin/content/authoring">
        <AdminPage><QuestionAuthoring /></AdminPage>
      </Route>
      <Route path="/admin/content/import">
        <AdminPage>
          <AdminWorkspacePlaceholder
            title="Content import"
            description="A durable import must validate every row, present a preview, require explicit commit, and preserve immutable import history."
            status="The prior client-only simulated import has been removed from the active workflow. Import remains unavailable until the validated server procedure is released."
          />
        </AdminPage>
      </Route>
      <Route path="/admin/taxonomy">
        <AdminPage><TagManager /></AdminPage>
      </Route>
      <Route path="/admin/flags">
        <AdminPage><FlagAdmin /></AdminPage>
      </Route>
      <Route path="/admin/analytics">
        <AdminPage>
          <AdminWorkspacePlaceholder
            title="Product analytics"
            description="This workspace will report aggregate feature discovery and workflow completion without exposing private learner reflections."
            status="Analytics remain unavailable until the approved event taxonomy, consent notice, retention policy, and aggregate-only reporting contract are implemented."
          />
        </AdminPage>
      </Route>

      {/* Administrative compatibility aliases remain role-protected */}
      <Route path="/curriculum">
        <AdminPage><CurriculumGuide /></AdminPage>
      </Route>
      <Route path="/import">
        <AdminPage>
          <AdminWorkspacePlaceholder
            title="Content import"
            description="This legacy address now resolves inside the protected administrator workspace."
            status="Import remains unavailable until preview, validation, commit, and history are server-backed."
          />
        </AdminPage>
      </Route>
      <Route path="/tag-manager">
        <AdminPage><TagManager /></AdminPage>
      </Route>

      <Route path="/404">
        <PublicPage><NotFound /></PublicPage>
      </Route>
      <Route>
        <PublicPage><NotFound /></PublicPage>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <PathProvider>
          <TooltipProvider>
            <Toaster />
            <LearnerStateBridge />
            <Router />
            <AccessibilityControls />
            <CommandPalette />
          </TooltipProvider>
        </PathProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
