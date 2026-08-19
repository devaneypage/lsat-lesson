import LessonGrid from "@/components/LessonGrid";
import { LedgerFrame } from "@/components/ledger/LedgerPrimitives";
import PageMeta from "@/components/PageMeta";
import PathSelector from "@/components/PathSelector";
import { useFeatureFlag } from "@/lib/flags";

export default function Lessons() {
  const { enabled: lessonGridEnabled, loading } = useFeatureFlag("lesson_grid");

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 md:px-8" aria-label="Loading curriculum">
        <div className="mx-auto h-[34rem] max-w-7xl animate-pulse border border-border bg-card" />
      </div>
    );
  }

  if (!lessonGridEnabled) return <PathSelector />;

  return (
    <div className="min-h-screen">
      <PageMeta
        title="LSAT Lessons: Logical Reasoning & Reading | Devaney"
        description="Seven structured LSAT lessons covering necessary assumptions, sufficient assumptions, flaw in reasoning, reading comprehension, and more."
        keywords={[
          "LSAT lessons",
          "logical reasoning",
          "necessary assumptions",
          "flaw in reasoning",
          "reading comprehension",
          "LSAT tutor",
          "law school admissions",
        ]}
        canonical="https://devasophy.blog/lessons"
      />
      <LedgerFrame>
        <LessonGrid />
      </LedgerFrame>
    </div>
  );
}
