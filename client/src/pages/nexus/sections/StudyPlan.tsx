import {
  DAILY_TEMPLATE,
  NEXUS_COLORS,
  STUDY_TEMPLATES,
} from "@/lib/nexus/data";
import {
  NxBadge,
  NxCard,
  NxLabel,
  NxSectionHeader,
} from "../components/primitives";

function Templates() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STUDY_TEMPLATES.map(t => (
        <NxCard key={t.name} className="overflow-hidden" accent={t.color}>
          <div className="p-4">
            <span className="nx-display text-base">{t.name}</span>
            <div className="mt-2">
              <NxBadge color={t.color}>{t.intensity}</NxBadge>
            </div>
          </div>
          <div className="space-y-3 border-t-2 border-ink/10 p-4">
            {t.phases.map(p => (
              <div
                key={p.phase}
                className="border-l-[3px] pl-3"
                style={{ borderColor: t.color }}
              >
                <div
                  className="nx-mono text-[11px] font-bold"
                  style={{ color: t.color }}
                >
                  {p.phase}
                </div>
                <p className="text-[12px] text-black/60">{p.focus}</p>
              </div>
            ))}
          </div>
        </NxCard>
      ))}
    </div>
  );
}

function DailyTemplate() {
  const totalMin = DAILY_TEMPLATE.reduce((a, b) => a + parseInt(b.time, 10), 0);
  return (
    <NxCard className="p-5">
      <div className="flex items-center justify-between">
        <NxLabel className="text-black/40">Daily Template</NxLabel>
        <NxBadge color={NEXUS_COLORS.pine}>≈ {totalMin} min/day</NxBadge>
      </div>
      <div className="mt-4 space-y-3">
        {DAILY_TEMPLATE.map(b => (
          <div key={b.label} className="flex items-start gap-3">
            <span
              className="nx-mono flex h-12 w-16 flex-shrink-0 items-center justify-center border-2 border-ink text-[11px] font-bold"
              style={{ background: b.color, color: "#FFFDF8" }}
            >
              {b.time}
            </span>
            <div>
              <span className="nx-display text-sm">{b.label}</span>
              <p className="text-[12px] text-black/60">{b.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t-2 border-ink/10 pt-3 text-[12px] text-black/50">
        Consistency beats marathon cramming. The warm-up loop on logged errors
        is the single highest-leverage 20 minutes in this block.
      </p>
    </NxCard>
  );
}

export default function StudyPlan({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Study Plan"
        title={tab}
        color={color}
        blurb={
          tab === "Templates"
            ? "Pick the runway that matches your test date and build backward from it."
            : "A repeatable daily block that fits study around a full schedule."
        }
      />
      {tab === "Templates" && <Templates />}
      {tab === "Daily Template" && <DailyTemplate />}
    </div>
  );
}
