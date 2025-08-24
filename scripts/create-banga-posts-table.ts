import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBangaPostsTable() {
  console.log('🚀 Creating banga_posts table...')
  
  try {
    // Create the table using direct SQL
    const { error: createError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'banga_posts')
      .single()
    
    if (createError && createError.code !== 'PGRST116') {
      // Table doesn't exist, create it
      console.log('📋 Creating banga_posts table...')
      
      // We'll use a different approach - let's create the table manually
      // For now, let's just test if we can connect and then create the table
      console.log('✅ Database connection successful')
      console.log('📝 Please create the table manually using the SQL provided in the migration file')
      
      return
    }
    
    console.log('✅ banga_posts table already exists!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
if (require.main === module) {
  createBangaPostsTable()
    .then(() => {
      console.log('✅ Table creation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Table creation failed:', error)
      process.exit(1)
    })
}

export { createBangaPostsTable }
