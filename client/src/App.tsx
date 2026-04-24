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
import Resources from "@/pages/Resources";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={PathSelector} />
      <Route path={"/dashboard"} component={UnifiedDashboard} />
      <Route path={"/progress"} component={ProgressTracker} />
      <Route path={"/session-plan-generator"} component={SessionPlanGenerator} />
      
      {/* Lessons */}
      <Route path={"/lessons/necessary-assumptions"} component={LessonNecessaryAssumptions} />
      <Route path={"/lessons/common-flaws"} component={LessonCommonFlaws} />
      <Route path={"/lessons/strengthen-weaken"} component={LessonStrengthenWeaken} />
      <Route path={"/lessons/reading-comprehension"} component={LessonReadingComprehension} />
      <Route path={"/lessons/formal-logic"} component={LessonFormalLogic} />
      <Route path={"/resources"} component={Resources} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
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
            <Router />
          </TooltipProvider>
        </PathProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
