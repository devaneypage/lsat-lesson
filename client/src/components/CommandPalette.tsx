import { BookOpen, ChevronRight, FileQuestion, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { trpc } from "@/lib/trpc";
import { useFeatureFlag } from "@/lib/flags";
import { CURRICULUM_LESSONS } from "@shared/learnerDomain";
import {
  QUESTION_SEARCH_DEBOUNCE_MS,
  scheduleDebouncedSearch,
} from "@/lib/learnerExperience";

export function useDebouncedSearchQuery(value: string, delay = QUESTION_SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => scheduleDebouncedSearch(value, setDebounced, delay), [delay, value]);
  return debounced;
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function CommandPalette() {
  const { enabled } = useFeatureFlag("unified_command_search");
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [questionResults, setQuestionResults] = useState<Array<{
    id: number;
    questionId: string;
    questionText: string;
    category: string | null;
    difficulty: string | null;
    source: string | null;
  }>>([]);
  const debouncedQuery = useDebouncedSearchQuery(query);
  const queryInput = useMemo(() => ({ query: debouncedQuery, limit: 8, offset }), [debouncedQuery, offset]);
  const questionSearch = trpc.search.questions.useQuery(queryInput, {
    enabled: enabled && open && isAuthenticated && debouncedQuery.length >= 2,
    retry: false,
    staleTime: 30_000,
  });

  const localResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return CURRICULUM_LESSONS;
    return CURRICULUM_LESSONS.filter(lesson =>
      [lesson.title, lesson.description, lesson.section, ...lesson.primarySkillIds]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    setOffset(0);
    setQuestionResults([]);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!questionSearch.data) return;
    setQuestionResults(current => offset === 0
      ? questionSearch.data.items
      : [...current, ...questionSearch.data.items.filter(item => !current.some(existing => existing.id === item.id))]);
  }, [offset, questionSearch.data]);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.documentElement.dataset.keyboardShortcuts === "off") return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => !value);
      }
      if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  if (!enabled) return null;

  const selectRoute = (route: string) => {
    setOpen(false);
    setQuery("");
    navigate(route);
  };

  return (
    <>
      <Button variant="outline" className="fixed bottom-4 right-4 z-40 gap-2 bg-background shadow-lg" onClick={() => setOpen(true)} aria-label="Open search and command palette">
        <Search className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Search</span><kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground md:inline">⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search lessons and questions" description="Type to search curriculum lessons immediately and practice questions after a short pause." className="sm:max-w-2xl">
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search lessons, skills, or question text…" aria-label="Search lessons and practice questions" />
        <CommandList className="max-h-[65vh]">
          <CommandEmpty>{questionSearch.isFetching ? "Searching questions…" : "No matching lessons or questions."}</CommandEmpty>
          {localResults.length > 0 && (
            <CommandGroup heading="Curriculum">
              {localResults.map(lesson => (
                <CommandItem key={lesson.id} value={`${lesson.title} ${lesson.description} ${lesson.section}`} onSelect={() => selectRoute(lesson.route)}>
                  <BookOpen className="size-4 text-primary" aria-hidden="true" />
                  <div className="min-w-0"><div className="font-semibold">{lesson.title}</div><div className="truncate text-xs text-muted-foreground">{lesson.description}</div></div>
                  <CommandShortcut>{lesson.durationMinutes} min</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(questionResults.length > 0 || (debouncedQuery.length >= 2 && !isAuthenticated)) && <CommandSeparator />}
          {questionResults.length > 0 && (
            <CommandGroup heading={`Practice questions · ${questionSearch.data?.total ?? questionResults.length} found`}>
              {questionResults.map(item => (
                <CommandItem key={item.id} value={`${item.questionId} ${item.questionText} ${item.category ?? ""}`} onSelect={() => selectRoute(`/question-bank?question=${encodeURIComponent(item.questionId)}`)}>
                  <FileQuestion className="size-4 text-primary" aria-hidden="true" />
                  <div className="min-w-0"><div className="font-semibold">{item.questionId}{item.category ? ` · ${item.category}` : ""}</div><div className="line-clamp-2 text-xs text-muted-foreground">{item.questionText}</div></div>
                  <ChevronRight className="ml-auto size-4" aria-hidden="true" />
                </CommandItem>
              ))}
              {questionSearch.data?.nextOffset !== null && questionSearch.data?.nextOffset !== undefined && (
                <CommandItem value={`load-more-${questionSearch.data.nextOffset}`} onSelect={() => setOffset(questionSearch.data!.nextOffset!)} className="justify-center font-semibold text-primary">Load more questions</CommandItem>
              )}
            </CommandGroup>
          )}
          {debouncedQuery.length >= 2 && !isAuthenticated && (
            <div className="px-4 py-5 text-sm text-muted-foreground">Sign in to search the private practice-question library. Curriculum search remains available.</div>
          )}
          {questionSearch.isError && <div className="px-4 py-5 text-sm text-destructive" role="alert">Question search is unavailable. Curriculum search still works.</div>}
        </CommandList>
      </CommandDialog>
    </>
  );
}
