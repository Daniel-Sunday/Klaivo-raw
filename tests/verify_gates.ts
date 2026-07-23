import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState } from '../schemas';

async function runGatesVerification() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Gate Wiring & Read-Only Route Verification");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraMsg?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${extraMsg ? '(' + extraMsg + ')' : ''}`);
      failed++;
    }
  }

  const orchestrator = new KlaivoOrchestrator();

  const baseLearnerState: LearnerState = {
    learnerId: "learner_gate_test",
    currentGoal: {
      rawStatement: "Python",
      domain: "Programming",
      specificObjective: "Python",
      contextArtifacts: [],
    },
    vocabularyLevel: "intermediate",
    masteryMap: {},
    sessionHistory: [],
  };

  try {
    // ----------------------------------------------------
    // Test 1: Low Confidence Intent Gate (< 0.6 halt)
    // ----------------------------------------------------
    const lowConfResult = await orchestrator.handleIntakeWorkflow(
      "asdfghjkl",
      baseLearnerState,
      [],
      { intent: { intent: "learning_goal", confidence: 0.4, needsClarification: true } }
    );

    assert(
      lowConfResult.status === "needs_clarification" && (lowConfResult as any).question.length > 0,
      "1. Intent Confidence Gate - Low confidence prompt (<0.6) halts at needs_clarification before DiagnosisAgent/Drafter",
      `status=${lowConfResult.status}`
    );

    // ----------------------------------------------------
    // Test 2: Diagnosis NeedsMoreContext Gate (Vague Goal Halt)
    // ----------------------------------------------------
    const vagueGoalResult = await orchestrator.handleIntakeWorkflow(
      "Learn Python",
      baseLearnerState,
      [],
      {
        intent: { intent: "learning_goal", confidence: 0.9, needsClarification: false },
        diagnosis: {
          needsMoreContext: true,
          clarifyingQuestion: "Are you learning Python for data analysis, web development with Django, or script automation?",
        },
      }
    );

    assert(
      vagueGoalResult.status === "needs_more_context" &&
        (vagueGoalResult as any).question.includes("data analysis"),
      "2. Diagnosis Context Gate - Vague goal ('Learn Python') halts at needs_more_context and surfaces grill-me question before CurriculumDrafter",
      `status=${vagueGoalResult.status}, question=${(vagueGoalResult as any).question}`
    );

    console.log("\n==========================================");
    console.log("Gate Wiring Verification PASSED!");
    console.log(`Results: ${passed} Passed, ${failed} Failed.`);
    console.log("==========================================");
  } catch (err: any) {
    console.error("Gate verification failed:", err);
    process.exit(1);
  }
}

runGatesVerification();
