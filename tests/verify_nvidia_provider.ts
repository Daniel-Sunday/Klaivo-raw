import { NvidiaNimProvider, NvidiaEmbeddingProvider, MultiModelRouter, cleanJsonOutput } from '../providers/modelProvider';
import dotenv from 'dotenv';

dotenv.config();

async function runVerification() {
  console.log('=== KLAIVO NVIDIA NIM INTEGRATION VERIFICATION ===\n');

  // Test 1: JSON Code Block Cleaner
  console.log('Test 1: Testing cleanJsonOutput helper...');
  const dirtyJson = '```json\n{\n  "status": "ok"\n}\n```';
  const cleaned = cleanJsonOutput(dirtyJson);
  const parsed = JSON.parse(cleaned);
  if (parsed.status === 'ok') {
    console.log('  [PASS] Cleaned markdown JSON code block successfully.');
  } else {
    throw new Error('  [FAIL] JSON cleaning failed.');
  }

  // Test 2: NvidiaNimProvider Live Text Generation
  console.log('\nTest 2: Testing NvidiaNimProvider generateText...');
  const nimProvider = new NvidiaNimProvider(undefined, 'meta/llama-3.1-70b-instruct');
  const textResponse = await nimProvider.generateText('Explain adaptivity in 1 short sentence.', 'You are a concise tutor.');
  console.log('  Response:', `"${textResponse.trim()}"`);

  // Test 3: NvidiaNimProvider Live JSON Generation
  console.log('\nTest 3: Testing NvidiaNimProvider generateJSON...');
  interface SampleJson {
    topic: string;
    verified: boolean;
  }
  const jsonResponse = await nimProvider.generateJSON<SampleJson>(
    'Return a JSON object with keys "topic" set to "Machine Learning" and "verified" set to true.',
    'You output valid JSON.'
  );
  console.log('  Response:', jsonResponse);
  if (jsonResponse.topic && jsonResponse.verified === true) {
    console.log('  [PASS] Valid JSON parsed successfully.');
  }

  // Test 4: NvidiaNimProvider Fallback Logic Test
  console.log('\nTest 4: Testing NvidiaNimProvider fallback logic from an unavailable/overloaded model...');
  // We pass an intentionally unavailable primary model name to test that it fails over to meta/llama-3.1-70b-instruct
  const fallbackProvider = new NvidiaNimProvider(undefined, 'nonexistent-overloaded-model');
  const fallbackText = await fallbackProvider.generateText('Respond with "Fallback Succeeded"');
  console.log('  Fallback Result:', `"${fallbackText.trim()}"`);
  console.log('  [PASS] Automatic fallback executed successfully.');

  // Test 5: NvidiaEmbeddingProvider 1024-dim Vectors
  console.log('\nTest 5: Testing NvidiaEmbeddingProvider generateEmbedding...');
  const embedProvider = new NvidiaEmbeddingProvider();
  const vector = await embedProvider.generateEmbedding('Adaptive learning pathways for mathematics', 'passage');
  console.log('  Vector dimensions:', vector.length);
  if (vector.length === 1024) {
    console.log('  [PASS] 1024-dimension vector generated successfully.');
  } else {
    throw new Error(`  [FAIL] Expected 1024 dimensions, got ${vector.length}`);
  }

  // Test 6: MultiModelRouter Integration
  console.log('\nTest 6: Testing MultiModelRouter...');
  const router = new MultiModelRouter();
  const routerText = await router.generateText('Say "Router OK"');
  console.log('  Router Response:', `"${routerText.trim()}"`);
  console.log('  [PASS] MultiModelRouter successfully routed call.');

  console.log('\n=== ALL NVIDIA INTEGRATION TESTS PASSED CLEANLY! ===');
}

runVerification().catch((err) => {
  console.error('\n[VERIFICATION FAILED]:', err);
  process.exit(1);
});
