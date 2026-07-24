import { generateSessionTitle, formatTitleCase } from '../utils/sessionTitler';

function runSessionTitlerTest() {
  console.log('🧪 Starting Session Titler Unit Tests...\n');

  // Test 1: Subject-driven titling
  const title1 = generateSessionTitle(
    "I want to learn how to build an LLM from scratch",
    "LLM from scratch"
  );
  if (title1 !== "Building LLM from Scratch") {
    throw new Error(`FAILED Test 1: Expected "Building LLM from Scratch", got "${title1}"`);
  }
  console.log(`✅ Test 1 Passed: "${title1}"`);

  // Test 2: Exam prep titling
  const title2 = generateSessionTitle(
    "Prepare me for WAEC Chemistry organic chemistry section",
    "WAEC Chemistry"
  );
  if (title2 !== "WAEC Chemistry Prep") {
    throw new Error(`FAILED Test 2: Expected "WAEC Chemistry Prep", got "${title2}"`);
  }
  console.log(`✅ Test 2 Passed: "${title2}"`);

  // Test 3: Raw long prompt cleaning
  const title3 = generateSessionTitle(
    "Help me understand calculus differentiation and integration step by step with practice problems"
  );
  if (!title3.includes("Calculus") || title3.split(' ').length > 6) {
    throw new Error(`FAILED Test 3: Expected concise calculus title, got "${title3}"`);
  }
  console.log(`✅ Test 3 Passed: "${title3}"`);

  console.log('\n🎉 ALL SESSION TITLING TESTS PASSED PERFECTLY!');
}

runSessionTitlerTest();
