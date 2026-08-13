export type QuestionBankContentBaselineInput = {
  totalQuestions: number;
  categories: readonly string[];
  sources: readonly string[];
};

export type QuestionBankContentBaseline = {
  totalQuestions: number;
  categories: string[];
  sources: string[];
  sourceLabel: string;
  statement: string;
};

function normalizeLabels(labels: readonly string[]): string[] {
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function buildQuestionBankContentBaseline({
  totalQuestions,
  categories,
  sources,
}: QuestionBankContentBaselineInput): QuestionBankContentBaseline {
  const normalizedCategories = normalizeLabels(categories);
  const normalizedSources = normalizeLabels(sources);
  const sourceLabel = normalizedSources.length === 0
    ? "No source metadata loaded"
    : normalizedSources.join(" · ");
  const isOriginalStarterSet = normalizedSources.length > 0
    && normalizedSources.every((source) => /original.*sample|sample.*original/i.test(source));

  let statement = "No practice questions are currently loaded. The collection will remain unavailable until reviewed content is added.";
  if (totalQuestions > 0 && isOriginalStarterSet) {
    statement = "This deliberately limited starter set contains original LSAT-style practice items written for LSAT Nexus. It is not an official LSAC question set.";
  } else if (totalQuestions > 0) {
    statement = "This collection contains the currently available reviewed practice items. Coverage will expand as additional sources are added.";
  }

  return {
    totalQuestions,
    categories: normalizedCategories,
    sources: normalizedSources,
    sourceLabel,
    statement,
  };
}
