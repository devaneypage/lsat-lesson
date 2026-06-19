import { useMemo, useState } from "react";
import {
  ANSWER_TRAPS,
  ERROR_CATEGORIES,
  LR_TYPE_NAMES,
  NEXUS_COLORS,
} from "@/lib/nexus/data";
import {
  NxBadge,
  NxButton,
  NxCard,
  NxLabel,
  NxSectionHeader,
} from "../components/primitives";
import { useErrorLog, type ErrorDraft, type ErrorEntry } from "../useErrorLog";

const REASONS = ANSWER_TRAPS.map(t => t.name);

function emptyDraft(): ErrorDraft {
  return {
    category: ERROR_CATEGORIES[0],
    questionType: LR_TYPE_NAMES[0],
    errorReason: REASONS[0],
    notes: "",
    source: "",
    confidence: 2,
  };
}

function EntryForm({
  onSubmit,
}: {
  onSubmit: (d: ErrorDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ErrorDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ErrorDraft>(k: K, v: ErrorDraft[K]) =>
    setDraft(d => ({ ...d, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit(draft);
      setDraft(emptyDraft());
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "nx-card-flat w-full bg-white px-3 py-2 text-sm outline-none";

  return (
    <NxCard className="p-4">
      <NxLabel color={NEXUS_COLORS.lime}>Log a mistake</NxLabel>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <NxLabel className="mb-1 block text-black/40">Category</NxLabel>
          <select
            className={inputCls}
            value={draft.category}
            onChange={e => set("category", e.target.value)}
          >
            {ERROR_CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <NxLabel className="mb-1 block text-black/40">Question Type</NxLabel>
          <select
            className={inputCls}
            value={draft.questionType}
            onChange={e => set("questionType", e.target.value)}
          >
            {LR_TYPE_NAMES.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <NxLabel className="mb-1 block text-black/40">
            Why you missed it
          </NxLabel>
          <select
            className={inputCls}
            value={draft.errorReason}
            onChange={e => set("errorReason", e.target.value)}
          >
            {REASONS.map(r => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <NxLabel className="mb-1 block text-black/40">
            Source (optional)
          </NxLabel>
          <input
            className={inputCls}
            placeholder="PT 73 · S2 · Q14"
            value={draft.source}
            onChange={e => set("source", e.target.value)}
          />
        </label>
      </div>
      <label className="mt-3 block">
        <NxLabel className="mb-1 block text-black/40">Takeaway</NxLabel>
        <textarea
          className={inputCls}
          rows={2}
          placeholder="In your own words: what's the rule you'll apply next time?"
          value={draft.notes}
          onChange={e => set("notes", e.target.value)}
        />
      </label>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2">
          <NxLabel className="text-black/40">Confidence now</NxLabel>
          <input
            type="range"
            min={1}
            max={5}
            value={draft.confidence}
            onChange={e => set("confidence", Number(e.target.value))}
          />
          <span className="nx-mono text-sm font-bold">
            {draft.confidence}/5
          </span>
        </label>
        <NxButton color={NEXUS_COLORS.lime} disabled={busy} onClick={submit}>
          {busy ? "Saving…" : "Add to error log"}
        </NxButton>
      </div>
    </NxCard>
  );
}

function EntryRow({
  entry,
  onResolve,
  onDelete,
}: {
  entry: ErrorEntry;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const resolved = entry.resolved === 1;
  return (
    <NxCard
      flat
      className="p-3"
      accent={resolved ? NEXUS_COLORS.lime : NEXUS_COLORS.terra}
    >
      <div className="flex flex-wrap items-center gap-2">
        <NxBadge color={NEXUS_COLORS.teal}>{entry.category}</NxBadge>
        <span className="nx-display text-sm">{entry.questionType}</span>
        {entry.errorReason && (
          <NxBadge color={NEXUS_COLORS.terra}>{entry.errorReason}</NxBadge>
        )}
        <span className="ml-auto nx-mono text-[10px] text-black/40">
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
      </div>
      {entry.notes && (
        <p className="mt-2 text-[13px] text-black/70">{entry.notes}</p>
      )}
      <div className="mt-2 flex items-center gap-3">
        {entry.source && (
          <span className="nx-mono text-[10px] text-black/40">
            {entry.source}
          </span>
        )}
        <span className="nx-mono text-[10px] text-black/40">
          conf {entry.confidence}/5
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onResolve}
            className="nx-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ color: resolved ? NEXUS_COLORS.lime : NEXUS_COLORS.pine }}
          >
            {resolved ? "✓ Resolved" : "Mark resolved"}
          </button>
          <button
            onClick={onDelete}
            className="nx-mono text-[10px] font-bold uppercase tracking-wider text-black/40 hover:text-terra"
          >
            Delete
          </button>
        </div>
      </div>
    </NxCard>
  );
}

function ErrorLog() {
  const { entries, isAuthed, isLoading, add, update, remove } = useErrorLog();
  return (
    <div className="grid gap-4">
      {!isAuthed && (
        <NxCard flat className="p-3" accent={NEXUS_COLORS.amber}>
          <p className="text-[12px] text-black/60">
            You're not signed in, so entries are saved to this browser only.
            Sign in to sync your error log across devices.
          </p>
        </NxCard>
      )}
      <EntryForm onSubmit={add} />
      {isLoading ? (
        <p className="nx-mono text-sm text-black/40">Loading…</p>
      ) : entries.length === 0 ? (
        <NxCard flat className="p-6 text-center">
          <p className="nx-display text-sm">No mistakes logged yet.</p>
          <p className="mt-1 text-[12px] text-black/50">
            Every miss is data. Log it, name the trap, and watch the patterns
            emerge.
          </p>
        </NxCard>
      ) : (
        <div className="grid gap-2">
          {entries.map(e => (
            <EntryRow
              key={e.id}
              entry={e}
              onResolve={() =>
                update(e.id, { resolved: e.resolved === 1 ? 0 : 1 })
              }
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[12px] font-semibold text-black/70">{label}</span>
        <span className="nx-mono text-[11px]" style={{ color }}>
          {value}
        </span>
      </div>
      <div
        className="h-2 border border-ink bg-cream"
        style={{ background: "#F4EFE2" }}
      >
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Analytics() {
  const { entries } = useErrorLog();

  const stats = useMemo(() => {
    const byType = new Map<string, number>();
    const byReason = new Map<string, number>();
    let resolved = 0;
    for (const e of entries) {
      byType.set(e.questionType, (byType.get(e.questionType) ?? 0) + 1);
      if (e.errorReason)
        byReason.set(e.errorReason, (byReason.get(e.errorReason) ?? 0) + 1);
      if (e.resolved === 1) resolved += 1;
    }
    const total = entries.length;
    // Mastery: resolution rate weighted by mean confidence.
    const avgConf = total
      ? entries.reduce((a, e) => a + e.confidence, 0) / total
      : 0;
    const mastery = total
      ? Math.round(((resolved / total) * 0.6 + (avgConf / 5) * 0.4) * 100)
      : 0;
    const sortDesc = (m: Map<string, number>) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    return {
      total,
      resolved,
      mastery,
      byType: sortDesc(byType),
      byReason: sortDesc(byReason),
    };
  }, [entries]);

  if (stats.total === 0) {
    return (
      <NxCard flat className="p-6 text-center">
        <p className="nx-display text-sm">No data yet.</p>
        <p className="mt-1 text-[12px] text-black/50">
          Log a few errors and your trends will appear here.
        </p>
      </NxCard>
    );
  }

  const maxType = Math.max(...stats.byType.map(([, v]) => v));
  const maxReason = Math.max(...stats.byReason.map(([, v]) => v));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <NxCard className="p-5 md:col-span-1" accent={NEXUS_COLORS.lime}>
        <NxLabel className="text-black/40">Mastery Score</NxLabel>
        <div
          className="nx-display mt-2 text-5xl"
          style={{ color: NEXUS_COLORS.pine }}
        >
          {stats.mastery}
        </div>
        <p className="mt-1 text-[12px] text-black/50">
          Resolution rate weighted by confidence. {stats.resolved}/{stats.total}{" "}
          errors resolved.
        </p>
      </NxCard>

      <NxCard className="p-5 md:col-span-2">
        <NxLabel className="text-black/40">
          Trend Patterns — by question type
        </NxLabel>
        <div className="mt-3 space-y-2">
          {stats.byType.map(([type, n]) => (
            <Bar
              key={type}
              label={type}
              value={n}
              max={maxType}
              color={NEXUS_COLORS.terra}
            />
          ))}
        </div>
      </NxCard>

      <NxCard className="p-5 md:col-span-3">
        <NxLabel className="text-black/40">
          Why you miss — by error type
        </NxLabel>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {stats.byReason.map(([reason, n]) => (
            <Bar
              key={reason}
              label={reason}
              value={n}
              max={maxReason}
              color={NEXUS_COLORS.teal}
            />
          ))}
        </div>
      </NxCard>
    </div>
  );
}

export default function ReviewAnalytics({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Review & Analytics"
        title={tab}
        color={color}
        blurb={
          tab === "Error Log"
            ? "Capture every miss with the trap that caused it. Synced to your account when signed in."
            : "Mastery score and trend patterns computed live from your error log."
        }
      />
      {tab === "Error Log" && <ErrorLog />}
      {tab === "Analytics" && <Analytics />}
    </div>
  );
}
