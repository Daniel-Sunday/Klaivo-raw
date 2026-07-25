import assert from 'assert';
import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState } from '../schemas';
import { classifyMessageIntent } from '../agents/routingAgent';

async function runVerification() {
  console.log('🧪 Starting Node Follow-Up & Non-Tree Intent Verification Test...\n');

  // 1. Test Routing Agent Classification
  console.log('--- 1. Testing Routing Agent Intent Classification ---');
  const dummyNode = {
    id: 'node_1',
    title: 'Hybridization & Carbon Bonding',
    description: 'Understanding sp3, sp2, and sp hybridization in organic molecules.',
    status: 'in_progress' as const,
    dependencies: [],
    x: 0,
    y: 0,
    order_index: 0,
  };

  const question1 = await classifyMessageIntent(dummyNode, 'I do not understand');
  console.log(`"I do not understand" -> Classified as: ${question1}`);
  assert.strictEqual(question1, 'question', 'Should classify "I do not understand" as question');

  const question2 = await classifyMessageIntent(dummyNode, 'what do you mean?');
  console.log(`"what do you mean?" -> Classified as: ${question2}`);
  assert.strictEqual(question2, 'question', 'Should classify "what do you mean?" as question');

  const answer1 = await classifyMessageIntent(dummyNode, 'Is it because carbon forms four single bonds in sp3 hybridization?');
  console.log(`"Is it because carbon forms four single bonds..." -> Classified as: ${answer1}`);
  assert.strictEqual(answer1, 'answer', 'Should classify tentative concept explanation as answer');

  console.log('✅ Routing Agent Classification passed!\n');

  // 2. Test Non-Tree Intent Orchestrator Handling
  console.log('--- 2. Testing Non-Tree Intent Response Generation ---');
  const orchestrator = new KlaivoOrchestrator();
  const baseLearnerState: LearnerState = {
    learnerId: 'test_learner',
    currentGoal: { rawStatement: 'Quick question test', domain: 'Chemistry', specificObjective: 'Quick question', contextArtifacts: [] },
    vocabularyLevel: 'intermediate',
    masteryMap: {},
    sessionHistory: [],
  };

  const result = await orchestrator.handleIntakeWorkflow(
    'What is the formula for methane?',
    baseLearnerState,
    [],
    { intent: { intent: 'quick_answer', confidence: 0.95 } }
  );

  console.log('Intake Workflow Result Status:', result.status);
  if (result.status === 'light_response') {
    console.log('Generated Response text preview:', result.response.slice(0, 120));
    assert.doesNotMatch(result.response, /generated without tree drafting/i, 'Response must NOT contain placeholder debug text');
    assert.ok(result.response.length > 10, 'Response should contain meaningful content');
  } else {
    assert.fail(`Expected status light_response but got ${result.status}`);
  }

  console.log('✅ Non-Tree Intent Response Generation passed!\n');
  console.log('🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
