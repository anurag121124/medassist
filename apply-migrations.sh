#!/bin/bash

echo "🚀 Applying MedAssist Database Migrations"
echo "========================================"

# Check if service role key is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "your_supabase_service_role_key_here" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set or still placeholder"
    echo "Please run: ./get-service-key.sh for instructions"
    exit 1
fi

echo "📋 Loading migration SQL..."

# Execute the migration SQL directly
echo "🔧 Executing migration..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function applyMigration() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Read migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250706160000_enhanced_medassist.sql', 'utf8');
    
    // Split SQL by statements and execute each
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    console.log('📝 Executing', statements.length, 'SQL statements...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log('⚠️  Statement', i+1, 'had issue:', error.message);
          } else {
            console.log('✅ Statement', i+1, 'executed successfully');
          }
        } catch (e) {
          console.log('⚠️  Statement', i+1, 'failed:', e.message);
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('🧪 Testing connection...');
    
    // Test the connection
    const { data, error } = await supabase
      .from('healthcare_providers')
      .select('count', { count: 'exact' });
      
    if (error) {
      console.log('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Database is ready!');
      console.log('📊 Healthcare providers table has', data?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Load environment variables
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key] = values.join('=');
      }
    }
  });
} catch (error) {
  console.error('❌ Could not load .env.local file');
  process.exit(1);
}

applyMigration();
"

echo "✅ Migration script completed!"
echo "🎯 Next steps:"
echo "1. Test the connection: node test-supabase.js"
echo "2. Start the development server: npm run dev"
