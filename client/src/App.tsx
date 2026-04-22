import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import LessonNecessaryAssumptions from "./pages/lessons/LessonNecessaryAssumptions";
import LessonCommonFlaws from "./pages/lessons/LessonCommonFlaws";
import LessonStrengthenWeaken from "./pages/lessons/LessonStrengthenWeaken";
import LessonReadingComprehension from "./pages/lessons/LessonReadingComprehension";
import LessonFormalLogic from "./pages/lessons/LessonFormalLogic";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/lessons/necessary-assumptions"} component={LessonNecessaryAssumptions} />
      <Route path={"/lessons/common-flaws"} component={LessonCommonFlaws} />
      <Route path={"/lessons/strengthen-weaken"} component={LessonStrengthenWeaken} />
      <Route path={"/lessons/reading-comprehension"} component={LessonReadingComprehension} />
      <Route path={"/lessons/formal-logic"} component={LessonFormalLogic} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
