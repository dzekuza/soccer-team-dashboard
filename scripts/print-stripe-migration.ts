import * as fs from 'fs';
import * as path from 'path';

async function printStripeMigration() {
  console.log('🔧 Stripe Migration SQL for Manual Execution\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'scripts', 'add-stripe-columns.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Copy and paste this SQL into your Supabase SQL Editor:\n');
    console.log('=' .repeat(60));
    console.log(sqlContent);
    console.log('=' .repeat(60));
    console.log('\n💡 Instructions:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the SQL above');
    console.log('   4. Click "Run" to execute');
    console.log('   5. After execution, run: npm run test-db');

  } catch (error: any) {
    console.error('❌ Failed to read migration file:', error.message);
  }
}

printStripeMigration().catch(console.error);