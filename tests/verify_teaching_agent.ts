import assert from 'assert';
import { runTeachingAgent, streamFollowUpAnswer } from '../agents/teachingAgent';
import { TreeNode, NodeContentSchema, LearnerGoal } from '../schemas';

async function runTeachingAgentVerification() {
  console.log('🧪 Starting SOTA Teaching Agent Verification Tests...\n');

  // Set test mode if needed
  process.env.USE_AGENT_MOCKS = 'true';

  const learnerId = 'test_learner_sota';
  const softwareGoal: LearnerGoal = {
    rawStatement: 'Learn memory management in Rust',
    domain: 'Software Engineering',
    specificObjective: 'Master borrow checker and ownership',
    contextArtifacts: [],
  };

  // ----------------------------------------------------
  // Test 1: Definitional / Simple Node Omission Assertion
  // ----------------------------------------------------
  console.log('--- Test 1: Definitional Node Omission Assertion ---');
  const simpleDefinitionalNode: TreeNode = {
    id: 'node_def_1',
    title: 'Definition of an Acid',
    oneLineSummary: 'Substance that produces hydrogen ions in aqueous solution',
    goalRelevance: 'Basic chemistry vocabulary',
    prerequisiteIds: [],
    status: 'in_progress',
    content: null,
    masteryScore: 0,
    depth: 0,
  };

  const simpleResult = await runTeachingAgent(
    {
      learnerId,
      node: simpleDefinitionalNode,
      vocabularyLevel: 'beginner',
    },
    {
      explanation: 'An acid is a substance that releases hydrogen ions (H+) when dissolved in water.',
      examples: ['Hydrochloric acid (HCl)', 'Citric acid in lemons'],
      // Intentionally omitting coreConcept, anchorAnalogy, workedExample, checkForUnderstanding, commonMisconceptions
    }
  );

  console.log('Generated Explanation preview:', simpleResult.output.explanation);
  assert.ok(simpleResult.output.explanation.length > 10, 'Explanation should be present');
  assert.strictEqual(simpleResult.output.anchorAnalogy, undefined, 'Definitional node MUST allow anchorAnalogy to be omitted/undefined');
  assert.strictEqual(simpleResult.output.workedExample, undefined, 'Definitional node MUST allow workedExample to be omitted/undefined');
  assert.strictEqual(simpleResult.output.checkForUnderstanding, undefined, 'Definitional node MUST allow checkForUnderstanding to be omitted/undefined');

  const parsedSimple = NodeContentSchema.safeParse(simpleResult.output);
  assert.ok(parsedSimple.success, 'NodeContent with omitted optional fields MUST parse cleanly in NodeContentSchema');
  console.log('✅ Definitional Node Omission Assertion passed!\n');

  // ----------------------------------------------------
  // Test 2: Rich Pedagogical Repertoire Validation
  // ----------------------------------------------------
  console.log('--- Test 2: Rich Pedagogical Repertoire Validation ---');
  const complexNode: TreeNode = {
    id: 'node_complex_1',
    title: 'Rust Borrow Checker & Reference Scopes',
    oneLineSummary: 'How Rust enforces memory safety without a garbage collector using lifetimes and borrow rules.',
    goalRelevance: 'Core objective for building memory-safe systems',
    prerequisiteIds: [],
    status: 'in_progress',
    content: null,
    masteryScore: 0,
    depth: 1,
  };

  const richResult = await runTeachingAgent(
    {
      learnerId,
      node: complexNode,
      vocabularyLevel: 'intermediate',
      learnerGoal: softwareGoal,
      masteredPrerequisites: ['Variables & Mutability'],
      confusionFlags: ['Confuses mutability with ownership transfer'],
    },
    {
      coreConcept: 'Ownership ensures exactly one variable owns a memory resource at a given time.',
      anchorAnalogy: 'Like a library book: multiple people can read (immutable borrow), but only one person can edit/write (mutable borrow).',
      explanation: 'Rust guarantees thread safety and memory safety at compile time by tracking borrow scopes...',
      examples: ['let x = 5; let y = &x;'],
      workedExample: {
        problem: 'Fix code trying to mutably borrow a variable while an immutable reference exists.',
        stepByStepSolution: 'Ensure the immutable reference scope ends before taking a mutable reference.',
        commonMistake: 'Thinking &mut creates a new copy of data.',
        whyMistakeFails: 'Borrowing borrows access to existing data; it does not clone.',
      },
      checkForUnderstanding: {
        question: 'Can you have two mutable references to the same data at the same time in Rust?',
        hint: 'Think about data races.',
        answer: 'No, Rust permits only one mutable reference at a time in a given scope.',
      },
      commonMisconceptions: ['Immutable references prevent reading values (False: they permit unlimited simultaneous reads).'],
    }
  );

  const parsedRich = NodeContentSchema.safeParse(richResult.output);
  assert.ok(parsedRich.success, 'Rich NodeContent payload MUST validate against NodeContentSchema');
  assert.strictEqual(richResult.output.workedExample?.commonMistake, 'Thinking &mut creates a new copy of data.');
  assert.strictEqual(richResult.output.checkForUnderstanding?.question, 'Can you have two mutable references to the same data at the same time in Rust?');
  console.log('✅ Rich Pedagogical Repertoire Validation passed!\n');

  // ----------------------------------------------------
  // Test 3: Caching Guardrail Preservation
  // ----------------------------------------------------
  console.log('--- Test 3: Caching Guardrail Preservation ---');
  const cachedNode: TreeNode = {
    ...complexNode,
    content: richResult.output,
  };

  const cachedResult = await runTeachingAgent({
    learnerId,
    node: cachedNode,
    vocabularyLevel: 'intermediate',
  });

  assert.ok(
    cachedResult.log.reasoning?.includes('Caching Guardrail Enforced'),
    'Cached content must be returned directly without re-invoking LLM'
  );
  assert.deepStrictEqual(cachedResult.output, richResult.output, 'Cached content must match stored content exactly');
  console.log('✅ Caching Guardrail Preservation passed!\n');

  // ----------------------------------------------------
  // Test 4: Multi-Turn Socratic Follow-Up Answer System
  // ----------------------------------------------------
  console.log('--- Test 4: Multi-Turn Socratic Follow-Up Stream ---');
  let streamingOutput = '';
  await streamFollowUpAnswer(
    { title: 'Rust Ownership', description: 'Rules of memory ownership' },
    'intermediate',
    [
      { role: 'user', content: 'What is ownership?' },
      { role: 'assistant', content: 'Ownership is Rust system of memory management.' },
    ],
    'Why can only one owner exist at a time?',
    (chunk: string) => {
      streamingOutput += chunk;
    }
  );

  assert.ok(streamingOutput.length > 0, 'Follow-up answer stream must produce response content');
  console.log('Follow-Up Answer Stream Preview:', streamingOutput.slice(0, 100));
  console.log('✅ Multi-Turn Socratic Follow-Up Stream passed!\n');

  console.log('🎉 ALL SOTA TEACHING AGENT VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTeachingAgentVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
