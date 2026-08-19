import { seedCurriculumPracticeLibrary } from "../server/db.ts";

const result = await seedCurriculumPracticeLibrary();
console.log(JSON.stringify(result));
