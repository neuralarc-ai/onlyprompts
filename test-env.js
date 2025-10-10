// Test environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...');
console.log('=====================================');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
    allPresent = false;
  }
});

console.log('=====================================');
if (allPresent) {
  console.log('✅ All environment variables are present');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('📝 Make sure your .env.local file contains:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}
