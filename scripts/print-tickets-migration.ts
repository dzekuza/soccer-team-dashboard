import { readFileSync } from 'fs';
import { join } from 'path';

console.log('📋 Tickets Migration SQL');
console.log('========================\n');

try {
  const sqlPath = join(process.cwd(), 'scripts', 'add-stripe-session-id.sql');
  const sqlContent = readFileSync(sqlPath, 'utf8');
  
  console.log(sqlContent);
  
  console.log('\n📝 Instructions:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to your Supabase dashboard');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Paste and execute the SQL');
  console.log('5. This will add stripe_session_id column to tickets table');
  
} catch (error) {
  console.error('❌ Error reading migration file:', error);
}