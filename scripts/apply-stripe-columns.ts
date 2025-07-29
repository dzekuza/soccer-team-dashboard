import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyStripeColumns() {
  console.log('🔧 Applying Stripe columns to subscriptions table...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'scripts', 'add-stripe-columns.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL Migration Content:');
    console.log('=' .repeat(50));
    console.log(sqlContent);
    console.log('=' .repeat(50));
    console.log('\n');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 50)}...`);
        
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} failed: ${error.message}`);
            console.log(`   This might be expected if the column already exists`);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err: any) {
          console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
          console.log(`   This might be expected if the RPC function doesn't exist`);
        }
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run the database test: npm run test-db');
    console.log('   2. Test the Stripe integration: npm run test-stripe');
    console.log('   3. If the RPC function failed, run the SQL manually in Supabase SQL Editor');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Run the SQL manually in your Supabase SQL Editor');
    console.log('   Copy the SQL content from scripts/add-stripe-columns.sql');
  }
}

applyStripeColumns().catch(console.error);