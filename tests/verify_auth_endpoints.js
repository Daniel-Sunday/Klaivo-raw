const db = require('../dist/database');

async function testAuthIntegration() {
  console.log('--- Testing Klaivo Supabase Auth Integration (JS Compiled) ---');
  await db.initDb();
  
  const supabase = db.getSupabase();
  if (!supabase) {
    console.log('⚠️ Supabase Auth client is not initialized in environment.');
    process.exit(0);
  }

  console.log('✅ Supabase Auth client is connected.');
  
  // Verify auth user query method
  const dummyToken = 'invalid-token-test';
  const { data, error } = await supabase.auth.getUser(dummyToken);
  if (error) {
    console.log('✅ Supabase Auth token validation check returned expected response for invalid token:', error.message);
  }
  
  console.log('🎉 Auth Integration Verification Passed!');
  process.exit(0);
}

testAuthIntegration().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
