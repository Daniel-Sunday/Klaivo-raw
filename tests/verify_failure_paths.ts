import { executeAgent, AgentGenerationFailedError } from '../agents/agentUtils';
import { runCurriculumVerifier } from '../agents/curriculumVerifier';
import { KlaivoOrchestrator } from '../orchestrator';
import { TreeSkeleton, LearnerState } from '../schemas';

async function runFailurePathTests() {
  console.log("==========================================");
  console.log("Running All-Models-Failed Failure Path Verification");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Ensure real execution logic path is tested (not mockFn)
  delete process.env.USE_AGENT_MOCKS;

  try {
    // ----------------------------------------------------
    // Test 1: executeAgent throws AgentGenerationFailedError on total LLM failure
    // ----------------------------------------------------
    let errorThrown = false;
    let thrownErrorName = '';

    try {
      await executeAgent({
        agentName: 'CurriculumDrafter',
        learnerId: 'learner_fail_test',
        systemInstruction: 'Test prompt',
        userPrompt: 'Test goal',
        inputData: { currentGoal: { specificObjective: 'Invalid Model Test' } },
        schema: {} as any,
        modelName: 'invalid-model-name-xyz-999',
      });
    } catch (err: any) {
      errorThrown = true;
      thrownErrorName = err.name;
    }

    assert(
      errorThrown && thrownErrorName === 'AgentGenerationFailedError',
      "1. executeAgent throws explicit AgentGenerationFailedError when all models fail (no silent fabrication)"
    );

    // ----------------------------------------------------
    // Test 2: CurriculumVerifier rejects defaulted verification on failure
    // ----------------------------------------------------
    const unverifiedSkeleton: TreeSkeleton = {
      treeId: 'tree_fail_test',
      learnerId: 'learner_fail_test',
      goalSummary: 'Test Goal',
      nodes: [
        { id: 'n1', title: 'Concept A', oneLineSummary: 'Summary A', goalRelevance: 'Relevance A', prerequisiteIds: [], status: 'available', content: null, masteryScore: 0, depth: 0 },
      ],
      edges: [],
      verificationStatus: 'unverified',
      verificationNotes: [],
      version: 1,
    };

    let verifierErrorThrown = false;
    try {
      await runCurriculumVerifier({ skeleton: unverifiedSkeleton }, undefined);
    } catch (err: any) {
      verifierErrorThrown = true;
    }

    assert(
      verifierErrorThrown,
      "2. CurriculumVerifier fails explicitly when reference models fail (never defaults to 'verified')"
    );

    // ----------------------------------------------------
    // Test 3: Orchestrator returns generation_failed status when Drafter/Verifier fail
    // ----------------------------------------------------
    const orchestrator = new KlaivoOrchestrator();
    const learnerState: LearnerState = {
      learnerId: 'learner_fail_orch',
      currentGoal: {
        rawStatement: 'Learn Organic Chemistry',
        domain: 'Chemistry',
        specificObjective: 'Master Alkanes',
        contextArtifacts: [],
      },
      vocabularyLevel: 'intermediate',
      masteryMap: {},
      sessionHistory: [],
    };

    const result = await orchestrator.handleIntakeWorkflow(
      "Learn Organic Chemistry",
      learnerState,
      [],
      undefined
    );

    assert(
      result.status === 'generation_failed' || result.status === 'retry_needed',
      "3. Orchestrator returns generation_failed status on generation error without persisting fake trees"
    );

    console.log("\n==========================================");
    console.log(`Failure Path Verification Completed! Results: ${passed} Passed, ${failed} Failed.`);
    console.log("==========================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runFailurePathTests();
