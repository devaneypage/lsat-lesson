import { readFile, writeFile } from "node:fs/promises";

const files = [
  "client/src/components/BookingCTA.tsx",
  "client/src/components/ConceptMap.tsx",
  "client/src/components/ContextualOrientationHeader.tsx",
  "client/src/components/ContinueLearningDashboard.tsx",
  "client/src/components/LessonGrid.tsx",
  "client/src/components/MainNavigationBar.tsx",
  "client/src/components/MasteryOverview.tsx",
  "client/src/components/NexusDashboardLayout.tsx",
  "client/src/components/PathSelector.tsx",
  "client/src/components/QuickNavigation.tsx",
  "client/src/components/ScoreCard.tsx",
  "client/src/pages/Dashboard.tsx",
  "client/src/pages/FlagAdmin.tsx",
  "client/src/pages/LessonPlanGenerator.tsx",
  "client/src/pages/Lessons.tsx",
];

const replacements = [
  ["font-['Archivo_Black']", "font-display font-bold"],
  ["font-['Archivo']", "font-sans"],
  ["'Archivo Black', sans-serif", "'Space Grotesk', sans-serif"],
  ["\"'Archivo Black', sans-serif\"", "\"'Space Grotesk', sans-serif\""],
  ["'Archivo', sans-serif", "'Space Grotesk', sans-serif"],
  ["\"'Archivo', sans-serif\"", "\"'Space Grotesk', sans-serif\""],
  ["Archivo Black / Archivo", "Space Grotesk / Lora"],
];

let changedFiles = 0;
for (const file of files) {
  const source = await readFile(file, "utf8");
  let next = source;
  for (const [from, to] of replacements) next = next.split(from).join(to);
  if (next !== source) {
    await writeFile(file, next);
    changedFiles += 1;
  }
}

console.log(`Updated ${changedFiles} source files.`);
