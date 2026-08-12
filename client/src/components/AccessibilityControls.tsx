import { Accessibility, Contrast, Keyboard, MoveHorizontal, ScanText, Text } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useFeatureFlag } from "@/lib/flags";
import { DEFAULT_ACCESSIBILITY_PREFERENCES, type AccessibilityPreferences } from "@shared/learnerDomain";
import {
  createPreferenceTransition,
  persistAccessibilityPreferences,
  readAccessibilityPreferences,
  rollbackPreferenceTransition,
} from "@/lib/learnerExperience";

type PreferenceKey = keyof AccessibilityPreferences;

const groups: Array<{
  key: PreferenceKey;
  label: string;
  description: string;
  icon: typeof Text;
  options: Array<{ value: string; label: string }>;
}> = [
  { key: "textScale", label: "Text size", description: "Scale lesson and interface text.", icon: Text, options: [{ value: "default", label: "Default" }, { value: "large", label: "Large" }, { value: "extra_large", label: "Extra large" }] },
  { key: "readingWidth", label: "Reading width", description: "Control the maximum reading line length.", icon: MoveHorizontal, options: [{ value: "comfortable", label: "Comfortable" }, { value: "wide", label: "Wide" }, { value: "full", label: "Full" }] },
  { key: "contrast", label: "Contrast", description: "Increase text and boundary contrast.", icon: Contrast, options: [{ value: "default", label: "Default" }, { value: "high", label: "High" }] },
  { key: "motion", label: "Motion", description: "Follow the device setting or reduce motion here.", icon: ScanText, options: [{ value: "system", label: "System" }, { value: "reduced", label: "Reduced" }] },
  { key: "passageFocus", label: "Passage focus", description: "Visually prioritize long reading passages.", icon: ScanText, options: [{ value: "off", label: "Off" }, { value: "on", label: "On" }] },
  { key: "keyboardShortcuts", label: "Keyboard shortcuts", description: "Enable global shortcuts such as Command/Ctrl + K.", icon: Keyboard, options: [{ value: "on", label: "On" }, { value: "off", label: "Off" }] },
];

export function applyAccessibilityPreferences(preferences: AccessibilityPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.textScale = preferences.textScale;
  root.dataset.readingWidth = preferences.readingWidth;
  root.dataset.contrast = preferences.contrast;
  root.dataset.motion = preferences.motion;
  root.dataset.passageFocus = preferences.passageFocus;
  root.dataset.keyboardShortcuts = preferences.keyboardShortcuts;
}

export function AccessibilityControls() {
  const { enabled } = useFeatureFlag("accessibility_controls");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() =>
    readAccessibilityPreferences(typeof window === "undefined" ? null : window.localStorage),
  );
  const serverPreferences = trpc.preferences.get.useQuery(undefined, {
    enabled: enabled && isAuthenticated,
    retry: false,
  });
  const save = trpc.preferences.save.useMutation({
    onMutate: async next => {
      await utils.preferences.get.cancel();
      const previous = utils.preferences.get.getData();
      utils.preferences.get.setData(undefined, (current: any) => current ? { ...current, ...next } : current);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) utils.preferences.get.setData(undefined, context.previous);
    },
    onSettled: () => utils.preferences.get.invalidate(),
  });

  useEffect(() => {
    if (!enabled) {
      applyAccessibilityPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES);
      return;
    }
    applyAccessibilityPreferences(preferences);
  }, [enabled, preferences]);

  useEffect(() => {
    if (!enabled || !serverPreferences.data) return;
    const next = {
      textScale: serverPreferences.data.textScale,
      readingWidth: serverPreferences.data.readingWidth,
      contrast: serverPreferences.data.contrast,
      motion: serverPreferences.data.motion,
      passageFocus: serverPreferences.data.passageFocus,
      keyboardShortcuts: serverPreferences.data.keyboardShortcuts,
    } satisfies AccessibilityPreferences;
    setPreferences(next);
    persistAccessibilityPreferences(window.localStorage, next);
  }, [enabled, serverPreferences.data]);

  if (!enabled) return null;

  const update = <K extends PreferenceKey>(key: K, value: AccessibilityPreferences[K]) => {
    const transition = createPreferenceTransition(preferences, key, value);
    setPreferences(transition.next);
    persistAccessibilityPreferences(window.localStorage, transition.next);
    if (isAuthenticated) {
      save.mutate(transition.next, {
        onError: () => {
          const previous = rollbackPreferenceTransition(transition);
          setPreferences(previous);
          persistAccessibilityPreferences(window.localStorage, previous);
        },
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 left-4 z-40 gap-2 bg-background shadow-lg" aria-label="Open accessibility preferences">
          <Accessibility className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Accessibility</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold tracking-[-0.02em]">Accessibility preferences</DialogTitle>
          <DialogDescription>{isAuthenticated ? "Preferences are saved to your learner profile." : "Guest preferences are saved in this browser."}</DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-5">
          {groups.map(group => {
            const Icon = group.icon;
            return (
              <fieldset key={group.key} className="rounded-sm border border-border p-4">
                <legend className="px-2 text-sm font-bold"><Icon className="mr-2 inline size-4 text-primary" aria-hidden="true" />{group.label}</legend>
                <p className="mb-3 text-xs text-muted-foreground">{group.description}</p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map(option => {
                    const selected = preferences[group.key] === option.value;
                    return <button key={option.value} type="button" aria-pressed={selected} className={`rounded-sm border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`} onClick={() => update(group.key, option.value as never)}>{option.label}</button>;
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
