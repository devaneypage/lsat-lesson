import mysql from 'mysql2/promise';

async function checkConnection() {
  console.log('=== DATABASE CONNECTION CHECK ===\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'lsat_lesson',
    });
    
    console.log('✓ Connected to MySQL\n');
    
    // Check if questions table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'questions'");
    console.log(`Questions table exists: ${tables.length > 0}\n`);
    
    // Check question count
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM questions');
    console.log(`Total questions in database: ${rows[0].count}\n`);
    
    // Show first 3 questions
    const [questions] = await connection.execute('SELECT id, questionId, questionText FROM questions LIMIT 3');
    if (questions.length > 0) {
      console.log('First 3 questions:');
      questions.forEach((q, i) => {
        console.log(`  ${i + 1}. ID: ${q.id}, QuestionID: ${q.questionId}, Text: ${q.questionText.substring(0, 50)}...`);
      });
    } else {
      console.log('No questions found');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

checkConnection();
