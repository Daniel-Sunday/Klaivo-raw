import { processSlotUpdate, DiagnosisSlotState, ProposedSlotEntry } from '../schemas';
import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState } from '../schemas';

async function runSlotFillingTests() {
  console.log('🧪 Starting Slot-Filling Architecture Verification Tests...\n');

  // Test 1: Initial turn creates slot state and fills targetSubject
  console.log('Test 1: Turn 1 slot extraction...');
  const initialState: DiagnosisSlotState = {
    slotsResolved: {},
    slotsStillNeeded: ['targetSubject', 'targetLevelOrOutcome', 'priorKnowledge'],
    roundCount: 0,
    forceProceedTriggered: false,
    blockedOverwrites: [],
  };

  const proposedTurn1: Record<string, ProposedSlotEntry> = {
    targetSubject: { value: 'Rust Web Backend', isCorrection: false },
  };

  const res1 = processSlotUpdate(initialState, proposedTurn1, false, true, 'What is your target level?');

  if (res1.updatedState.slotsResolved.targetSubject !== 'Rust Web Backend') {
    throw new Error('FAILED Test 1: targetSubject was not resolved');
  }
  if (res1.updatedState.roundCount !== 1) {
    throw new Error(`FAILED Test 1: expected roundCount 1, got ${res1.updatedState.roundCount}`);
  }
  if (res1.finalNeedsMoreContext) {
    throw new Error('FAILED Test 1: should finalize instantly on Turn 1 when targetSubject is present');
  }
  console.log('✅ Test 1 Passed: Turn 1 slot resolution & instant finalization verified.\n');

  // Test 2: Overwrite Protection Guard (attempting unauthorized overwrite without isCorrection)
  console.log('Test 2: Overwrite Protection Guard (isCorrection: false)...');
  const proposedTurn2Hallucinated: Record<string, ProposedSlotEntry> = {
    targetSubject: { value: 'DOP-C02 AWS Certification', isCorrection: false }, // Hallucinated swap!
    targetLevelOrOutcome: { value: 'Production Microservices', isCorrection: false },
  };

  const res2 = processSlotUpdate(res1.updatedState, proposedTurn2Hallucinated, false, true, 'What experience do you have?');

  if (res2.updatedState.slotsResolved.targetSubject !== 'Rust Web Backend') {
    throw new Error(`FAILED Test 2: Overwrite guard failed! Preserved subject should be "Rust Web Backend", got "${res2.updatedState.slotsResolved.targetSubject}"`);
  }
  if (res2.updatedState.slotsResolved.targetLevelOrOutcome !== 'Production Microservices') {
    throw new Error('FAILED Test 2: New valid slot targetLevelOrOutcome was not accepted');
  }
  if (res2.newBlockedOverwrites.length !== 1 || res2.newBlockedOverwrites[0].slotKey !== 'targetSubject') {
    throw new Error('FAILED Test 2: Blocked overwrite entry was not recorded in audit log');
  }
  console.log('✅ Test 2 Passed: Unauthorized overwrite blocked and recorded in audit log.\n');

  // Test 3: Authorized Correction (isCorrection: true)
  console.log('Test 3: Authorized Slot Correction (isCorrection: true)...');
  const proposedTurn2Correction: Record<string, ProposedSlotEntry> = {
    targetSubject: { value: 'Go Backend Engineering', isCorrection: true, reasoning: 'User explicitly changed topic' },
  };

  const res3 = processSlotUpdate(res2.updatedState, proposedTurn2Correction, false, true, 'What experience do you have?');

  if (res3.updatedState.slotsResolved.targetSubject !== 'Go Backend Engineering') {
    throw new Error(`FAILED Test 3: Authorized correction was blocked! Expected "Go Backend Engineering", got "${res3.updatedState.slotsResolved.targetSubject}"`);
  }
  console.log('✅ Test 3 Passed: Authorized slot correction accepted.\n');

  // Test 4: Hard Cap (3 rounds max)
  console.log('Test 4: Hard Cap at 3 Rounds...');
  // Current state is round 2 (next turn will be 3)
  const stateRound2: DiagnosisSlotState = {
    ...res3.updatedState,
    roundCount: 2,
  };

  const res4 = processSlotUpdate(stateRound2, {}, false, true, 'Still asking question?');

  if (res4.finalNeedsMoreContext) {
    throw new Error('FAILED Test 4: Round 3 hard cap did not force finalization!');
  }
  if (!res4.synthesizedGoal.includes('Go Backend Engineering')) {
    throw new Error(`FAILED Test 4: Synthesized goal does not contain slot data: "${res4.synthesizedGoal}"`);
  }
  console.log('✅ Test 4 Passed: 3-round hard cap forced curriculum generation with code-synthesized goal.\n');

  // Test 5: User Force Proceed Request
  console.log('Test 5: User Force-Proceed Request...');
  const stateRound1: DiagnosisSlotState = {
    slotsResolved: { targetSubject: 'Python Data Science' },
    slotsStillNeeded: ['targetLevelOrOutcome', 'priorKnowledge'],
    roundCount: 1,
    forceProceedTriggered: false,
    blockedOverwrites: [],
  };

  const res5 = processSlotUpdate(stateRound1, {}, true, true, 'Clarify outcome?'); // userRequestsProceed = true

  if (res5.finalNeedsMoreContext) {
    throw new Error('FAILED Test 5: User force-proceed request was not respected!');
  }
  if (!res5.synthesizedGoal.includes('Python Data Science')) {
    throw new Error(`FAILED Test 5: Force-proceed goal synthesis failed: "${res5.synthesizedGoal}"`);
  }
  console.log('✅ Test 5 Passed: User force-proceed request immediately bypassed clarification.\n');

  // Test 6: End-to-End Orchestrator Integration
  console.log('Test 6: End-to-End Orchestrator Intake Execution...');
  const orchestrator = new KlaivoOrchestrator();
  const learnerState: LearnerState = {
    learnerId: 'test_learner_123',
    currentGoal: {
      rawStatement: 'Learn Rust programming',
      domain: 'General',
      specificObjective: 'Learn Rust programming',
      contextArtifacts: [],
    },
    vocabularyLevel: 'intermediate',
    masteryMap: {},
    sessionHistory: [],
  };

  const result1 = await orchestrator.handleIntakeWorkflow(
    'I want to learn Rust for backend services',
    learnerState,
    [],
    undefined,
    {
      intent: { intent: 'learning_goal', confidence: 0.95 },
      diagnosis: {
        needsMoreContext: true,
        userRequestsProceed: false,
        clarifyingQuestion: 'What is your prior programming experience?',
        proposedSlots: {
          targetSubject: { value: 'Rust Backend Services', isCorrection: false },
        },
      },
    }
  );

  if (result1.status !== 'tree_created') {
    throw new Error(`FAILED Test 6: expected tree_created on Turn 1 when targetSubject is present, got ${result1.status}`);
  }
  console.log('✅ Test 6 Passed: End-to-End Turn 1 Instant Tree Creation verified.\n');

  // Turn 2: User says "stop asking questions and build tree"
  const result2 = await orchestrator.handleIntakeWorkflow(
    'stop asking questions and build tree',
    learnerState,
    [],
    result1.slotState,
    {
      intent: { intent: 'learning_goal', confidence: 0.95 },
      diagnosis: {
        needsMoreContext: true,
        userRequestsProceed: true, // Model judges user wants to proceed
        proposedSlots: {},
      },
    }
  );

  if (result2.status !== 'tree_created') {
    throw new Error(`FAILED Test 6: turn 2 force proceed should create tree, got ${result2.status}`);
  }
  if (!result2.tree.goalSummary.includes('Rust Backend Services')) {
    throw new Error(`FAILED Test 6: Tree goal summary should be code-synthesized objective, got "${result2.tree.goalSummary}"`);
  }
  console.log('✅ Test 6 Passed: End-to-End Orchestrator intake workflow verified successfully!\n');

  console.log('🎉 ALL SLOT-FILLING ARCHITECTURE TESTS PASSED PERFECTLY!');
}

runSlotFillingTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
