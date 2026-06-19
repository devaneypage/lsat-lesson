import {
  MAPPING_PROTOCOL,
  PASSAGE_GENRES,
  RC_QUESTION_TYPES,
} from "@/lib/nexus/data";
import { NxCard, NxLabel, NxSectionHeader } from "../components/primitives";

function QuestionTypes() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {RC_QUESTION_TYPES.map(q => (
        <NxCard key={q.name} flat className="p-4" accent={q.color}>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3"
              style={{ background: q.color }}
            />
            <span className="nx-display text-sm">{q.name}</span>
          </div>
          <p
            className="mt-2 border-l-[3px] pl-3 text-sm italic text-black/70"
            style={{ borderColor: q.color }}
          >
            "{q.stem}"
          </p>
          <NxLabel className="mt-2 block text-black/40">{q.tip}</NxLabel>
        </NxCard>
      ))}
    </div>
  );
}

function PassageGenres() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PASSAGE_GENRES.map(g => (
        <NxCard key={g.type} flat className="overflow-hidden">
          <div className="px-4 py-2" style={{ background: g.color }}>
            <span className="nx-display text-sm text-[#FFFDF8]">{g.type}</span>
          </div>
          <ul className="space-y-1.5 p-4">
            {g.traits.map(t => (
              <li
                key={t}
                className="flex items-start gap-2 text-[12px] text-black/70"
              >
                <span
                  className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                  style={{ background: g.color }}
                />
                {t}
              </li>
            ))}
          </ul>
        </NxCard>
      ))}
    </div>
  );
}

function MappingProtocol() {
  return (
    <NxCard className="p-5">
      <NxLabel className="text-black/40">Passage Mapping Protocol</NxLabel>
      <p className="mt-1 mb-4 text-sm text-black/60">
        Run these six passes before touching the questions. Thirty seconds of
        mapping saves minutes of re-reading.
      </p>
      <ol className="space-y-2">
        {MAPPING_PROTOCOL.map(s => (
          <li key={s.step} className="flex items-start gap-3">
            <span className="nx-mono flex h-7 w-7 flex-shrink-0 items-center justify-center border-2 border-ink text-sm font-bold">
              {s.step}
            </span>
            <div>
              <span className="nx-display text-sm">{s.label}</span>
              <p className="text-[12px] text-black/60">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </NxCard>
  );
}

export default function ReadingComp({
  tab,
  color,
}: {
  tab: string;
  color: string;
}) {
  return (
    <div>
      <NxSectionHeader
        eyebrow="Reading Comprehension"
        title={tab}
        color={color}
        blurb={
          tab === "Question Types"
            ? "The seven RC question stems and how to answer each."
            : tab === "Passage Genres"
              ? "Know the genre and you know where the trap will be."
              : "A repeatable six-step read for every passage."
        }
      />
      {tab === "Question Types" && <QuestionTypes />}
      {tab === "Passage Genres" && <PassageGenres />}
      {tab === "Mapping Protocol" && <MappingProtocol />}
    </div>
  );
}
