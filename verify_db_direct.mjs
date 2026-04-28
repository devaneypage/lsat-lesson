import mysql from 'mysql2/promise';

async function verifyDatabase() {
  console.log('=== VERIFYING DATABASE ===\n');
  
  try {
    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    console.log('Using DATABASE_URL from environment\n');
    
    // Create connection using DATABASE_URL
    const connection = await mysql.createConnection(dbUrl);
    
    console.log('✓ Connected to TiDB Cloud\n');
    
    // Check questions table
    const [tables] = await connection.execute("SHOW TABLES LIKE 'questions'");
    console.log(`Questions table exists: ${tables.length > 0}`);
    
    if (tables.length > 0) {
      // Count questions
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM questions');
      const count = countResult[0].count;
      console.log(`Total questions: ${count}\n`);
      
      if (count > 0) {
        const [questions] = await connection.execute('SELECT id, questionId, questionText FROM questions LIMIT 3');
        console.log('Sample questions:');
        questions.forEach((q, i) => {
          console.log(`  ${i + 1}. ${q.questionId}: ${q.questionText.substring(0, 60)}...`);
        });
      }
    } else {
      console.log('⚠ Questions table not found\n');
      
      // List all tables
      const [allTables] = await connection.execute('SHOW TABLES');
      console.log('Available tables:');
      allTables.forEach(t => {
        console.log(`  - ${Object.values(t)[0]}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
