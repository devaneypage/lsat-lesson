import { getDb } from './server/db.ts';
import { questions } from './drizzle/schema.ts';

async function debugDatabase() {
  console.log('=== DATABASE DEBUG ===\n');
  
  try {
    const db = await getDb();
    
    if (!db) {
      console.error('ERROR: Database connection failed');
      process.exit(1);
    }
    
    console.log('✓ Database connection successful\n');
    
    // Check question count
    const allQuestions = await db.select().from(questions);
    console.log(`Total questions in database: ${allQuestions.length}`);
    
    if (allQuestions.length > 0) {
      console.log('\nFirst 5 questions:');
      allQuestions.slice(0, 5).forEach((q, i) => {
        console.log(`  ${i + 1}. ID: ${q.id}, Text: ${q.questionText?.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠ No questions found in database');
    }
    
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
}

debugDatabase();
