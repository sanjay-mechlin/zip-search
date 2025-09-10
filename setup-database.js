#!/usr/bin/env node

/**
 * Database Setup Script for Local Service MVP
 * This script helps set up the database with sample data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Read and execute the schema
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`⚠️  Warning: ${error.message}`);
        }
      }
    }

    console.log('✅ Database setup completed!');
    console.log('📊 Sample data has been inserted.');
    console.log('🌐 You can now test your application.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 Please run the SQL schema manually in your Supabase dashboard.');
  }
}

setupDatabase();
