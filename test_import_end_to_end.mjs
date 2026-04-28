import { getDb } from './server/db.ts';
import { questions } from './drizzle/schema.ts';

async function testImport() {
  console.log('=== END-TO-END IMPORT TEST ===\n');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('ERROR: Database not available');
      process.exit(1);
    }
    
    // Clear existing questions
    console.log('Clearing existing questions...');
    await db.delete(questions);
    console.log('✓ Cleared\n');
    
    // Insert test questions
    console.log('Inserting test questions...');
    const testQuestions = [
      {
        questionId: "TEST001",
        questionText: "What is the main point?",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        optionE: null,
        correctAnswer: "A",
        explanation: "Explanation here",
        category: "Main Point",
        difficulty: "easy",
        source: "test",
      },
      {
        questionId: "TEST002",
        questionText: "What is assumed?",
        optionA: "Assumption A",
        optionB: "Assumption B",
        optionC: "Assumption C",
        optionD: "Assumption D",
        optionE: null,
        correctAnswer: "B",
        explanation: "Explanation here",
        category: "Assumption",
        difficulty: "medium",
        source: "test",
      }
    ];
    
    await db.insert(questions).values(testQuestions);
    console.log(`✓ Inserted ${testQuestions.length} questions\n`);
    
    // Verify insertion
    console.log('Verifying insertion...');
    const allQuestions = await db.select().from(questions);
    console.log(`✓ Found ${allQuestions.length} questions in database\n`);
    
    if (allQuestions.length > 0) {
      console.log('Sample questions:');
      allQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.questionId}: ${q.questionText}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

testImport();
