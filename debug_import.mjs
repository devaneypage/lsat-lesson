import { insertQuestions, getQuestions, getQuestionCount } from './server/db.ts';

async function testImport() {
  console.log('=== TESTING IMPORT FUNCTION ===\n');
  
  try {
    // Sample question data
    const sampleQuestions = [
      {
        questionId: "TEST001",
        questionText: "Test question 1",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        optionE: null,
        correctAnswer: "A",
        explanation: "This is the explanation",
        category: "Test",
        difficulty: "easy",
        source: "test",
      }
    ];
    
    console.log('Inserting sample question...');
    const insertedCount = await insertQuestions(sampleQuestions);
    console.log(`✓ Inserted ${insertedCount} questions\n`);
    
    console.log('Retrieving questions...');
    const allQuestions = await getQuestions(100, 0);
    console.log(`✓ Retrieved ${allQuestions.length} questions\n`);
    
    console.log('Getting question count...');
    const count = await getQuestionCount();
    console.log(`✓ Total questions: ${count}\n`);
    
    if (allQuestions.length > 0) {
      console.log('First question:');
      console.log(JSON.stringify(allQuestions[0], null, 2));
    }
    
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

testImport();
