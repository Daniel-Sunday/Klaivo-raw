import * as db from './database';

async function testAuth() {
  await db.initDb();
  const supabase = db.getSupabase();
  console.log('Supabase client initialized:', !!supabase);

  if (!supabase) {
    console.error('Supabase is NOT configured!');
    return;
  }

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPass = 'Password123!';

  console.log(`Testing SignUp with ${testEmail}...`);
  const signupRes = await supabase.auth.signUp({
    email: testEmail,
    password: testPass,
  });

  console.log('SignUp result error:', signupRes.error);
  console.log('SignUp user:', signupRes.data.user?.id);
  console.log('SignUp session token:', !!signupRes.data.session?.access_token);

  console.log(`Testing SignIn with ${testEmail}...`);
  const loginRes = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  console.log('SignIn result error:', loginRes.error);
  console.log('SignIn user:', loginRes.data.user?.id);
  console.log('SignIn session token:', !!signupRes.data.session?.access_token);
}

testAuth().catch(console.error);
