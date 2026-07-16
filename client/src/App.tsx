import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PathProvider } from "./contexts/PathContext";
import PathSelector from "@/components/PathSelector";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import ProgressTracker from "@/pages/ProgressTracker";
import SessionPlanGenerator from "@/pages/SessionPlanGenerator";
import LessonNecessaryAssumptions from "@/pages/lessons/LessonNecessaryAssumptions";
import LessonCommonFlaws from "@/pages/lessons/LessonCommonFlaws";
import LessonStrengthenWeaken from "@/pages/lessons/LessonStrengthenWeaken";
import LessonReadingComprehension from "@/pages/lessons/LessonReadingComprehension";
import LessonFormalLogic from "@/pages/lessons/LessonFormalLogic";
import LessonSufficientAssumptions from "@/pages/lessons/LessonSufficientAssumptions";
import LessonFlawInReasoning from "@/pages/lessons/LessonFlawInReasoning";
import Resources from "./pages/Resources";
import QuestionBank from "./pages/QuestionBank";
import CurriculumGuide from "./pages/CurriculumGuide";
import CSVImportManager from "./pages/CSVImportManager";
import StudyGuide from "./pages/StudyGuide";
import Dashboard from "@/pages/Dashboard";
import Lessons from "@/pages/Lessons";
import LessonPlanGenerator from "./pages/LessonPlanGenerator";
import TagManager from "./pages/TagManager";
import MainNavigationBar from "./components/MainNavigationBar";
import About from "@/pages/About";
import Booking from "@/pages/Booking";
import FlagAdmin from "@/pages/FlagAdmin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <MainNavigationBar />
      <Switch>
        <Route path={"/"} component={PathSelector} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/progress"} component={ProgressTracker} />
        <Route path={"/session-plan-generator"} component={SessionPlanGenerator} />
        
        {/* Lessons — /lessons is the Nexus lesson grid hub */}
        <Route path={"/lessons"} component={Lessons} />
        <Route path={"/lessons/necessary-assumptions"} component={LessonNecessaryAssumptions} />
        <Route path={"/lessons/common-flaws"} component={LessonCommonFlaws} />
        <Route path={"/lessons/strengthen-weaken"} component={LessonStrengthenWeaken} />
        <Route path={"/lessons/reading-comprehension"} component={LessonReadingComprehension} />
        <Route path={"/lessons/formal-logic"} component={LessonFormalLogic} />
        <Route path={'/lessons/sufficient-assumptions'} component={LessonSufficientAssumptions} />
        <Route path={'/lessons/flaw-in-reasoning'} component={LessonFlawInReasoning} />
        
        {/* Main Features */}
        <Route path="/resources" component={Resources} />
        <Route path={"/question-bank"} component={QuestionBank} />
        <Route path={"/curriculum"} component={CurriculumGuide} />
        <Route path={"/import"} component={CSVImportManager} />
        <Route path={'/study-guide'} component={StudyGuide} />
        <Route path={'/lesson-plan-generator'} component={LessonPlanGenerator} />
        <Route path={'/tag-manager'} component={TagManager} />
        
        {/* About / Hire Me */}
        <Route path="/about" component={About} />

        {/* Contact & Booking — Calendly embed */}
        <Route path="/booking" component={Booking} />

        {/* Admin — owner-only */}
        <Route path="/admin/flags" component={FlagAdmin} />

        {/* Error handling */}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <PathProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PathProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
