// Test script to check if contact_messages table exists
// Run this with: node test-contact-db.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactTable() {
  console.log('🔍 Testing contact_messages table...');
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "contact_messages" does not exist');
        console.log('📝 Please run the SQL script in your Supabase SQL Editor:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste the contents of CONTACT_TABLE_SETUP.sql');
        console.log('   4. Click "Run"');
      } else {
        console.error('❌ Database error:', error.message);
        console.error('Error code:', error.code);
      }
      return false;
    }

    console.log('✅ contact_messages table exists and is accessible');
    console.log(`📊 Found ${data.length} records`);
    return true;

  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function testInsert() {
  console.log('🧪 Testing insert operation...');
  
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message',
        category: 'General Inquiry'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('Error code:', error.code);
      return false;
    }

    console.log('✅ Insert test successful');
    console.log('📝 Test record ID:', data.id);
    
    // Clean up test record
    await supabase
      .from('contact_messages')
      .delete()
      .eq('id', data.id);
    
    console.log('🧹 Test record cleaned up');
    return true;

  } catch (err) {
    console.error('❌ Insert test error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Contact Form Database Test');
  console.log('============================');
  
  const tableExists = await testContactTable();
  
  if (tableExists) {
    await testInsert();
  }
  
  console.log('\n📋 Next steps:');
  if (!tableExists) {
    console.log('1. Run the SQL setup script in Supabase');
    console.log('2. Re-run this test: node test-contact-db.js');
    console.log('3. Test the contact form in your app');
  } else {
    console.log('1. Test the contact form in your app');
    console.log('2. Check the admin interface at /admin/contact');
  }
}

main().catch(console.error);
