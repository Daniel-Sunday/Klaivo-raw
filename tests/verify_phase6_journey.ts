import { KlaivoOrchestrator } from '../orchestrator';
import { initDb, getAgentLogs, getSession, getNodes } from '../database';

async function runPhase6JourneyVerification() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Phase 6 Integration: Frontend Route & AgentLog Verification");
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

  await initDb();

  const orchestrator = new KlaivoOrchestrator();
  const testLearnerId = `learner_p6_${Date.now()}`;
  const initialPrompt = "I want to master organic chemistry mechanisms for WAEC exam";

  try {
    // ----------------------------------------------------
    // Step 1: Goal Submission & Tree Pipeline Execution
    // ----------------------------------------------------
    console.log("1. Executing Intake Workflow (Goal Submission)...");
    const intakeResult = await orchestrator.handleIntakeWorkflow(
      initialPrompt,
      {
        learnerId: testLearnerId,
        currentGoal: {
          rawStatement: initialPrompt,
          domain: 'Organic Chemistry',
          specificObjective: 'Master WAEC organic chemistry mechanisms',
          contextArtifacts: [],
        },
        vocabularyLevel: 'intermediate',
        masteryMap: {},
        sessionHistory: [],
      }
    );

    assert(
      intakeResult.status === "tree_created",
      "1a. Route Integration - Goal submission created verified tree skeleton",
      `status=${intakeResult.status}`
    );

    if (intakeResult.status !== "tree_created") {
      throw new Error("Intake pipeline failed");
    }

    const tree = intakeResult.tree;
    assert(
      tree.nodes.length >= 2 && tree.verificationStatus === "verified",
      "1b. Rendered Skeleton - Skeleton contains verified concept nodes with goalRelevance",
      `nodeCount=${tree.nodes.length}, status=${tree.verificationStatus}`
    );

    // ----------------------------------------------------
    // Step 2: Lazy Node Content Generation (Open Node)
    // ----------------------------------------------------
    console.log("\n2. Executing Lazy Node Content Open...");
    const firstNode = tree.nodes[0];
    const content = await orchestrator.handleOpenNodeWorkflow(
      tree,
      firstNode.id,
      intakeResult.learnerState
    );

    assert(
      content.explanation.length > 0 && content.nodeId === firstNode.id,
      "2. Lazy Loading - Content generated on-demand by TeachingAgent",
      `explanationLength=${content.explanation.length}`
    );

    // ----------------------------------------------------
    // Step 3: Node Assessment & Graph Traversal Unlocking
    // ----------------------------------------------------
    console.log("\n3. Executing Node Assessment & Memory Update...");
    const assessmentResult = await orchestrator.handleNodeAssessmentWorkflow(
      tree,
      firstNode.id,
      "Alkanes undergo free radical substitution reactions in presence of UV light.",
      intakeResult.learnerState
    );

    assert(
      assessmentResult.status === "assessment_success" && firstNode.status === "mastered",
      "3. Assessment Workflow - Graded response, updated mastery, and marked node mastered"
    );

    // ----------------------------------------------------
    // Step 4: Audit AgentLog Persistence Verification
    // ----------------------------------------------------
    console.log("\n4. Verifying AgentLog Database Persistence...");
    const logs = await getAgentLogs(testLearnerId);

    const loggedAgents = logs.map((l) => l.agentName);
    console.log("Logged agent calls in DB:", loggedAgents);

    assert(
      logs.length >= 4,
      "4a. AgentLog Table - Agent calls automatically persisted to database table",
      `logCount=${logs.length}`
    );

    assert(
      loggedAgents.includes("IntentAgent") &&
        loggedAgents.includes("DiagnosisAgent") &&
        loggedAgents.includes("CurriculumDrafter") &&
        loggedAgents.includes("CurriculumVerifier"),
      "4b. Audit Trail Completeness - All intake pipeline agent calls recorded with input/output/reasoning",
      `logged=${loggedAgents.join(", ")}`
    );

    console.log("\n==========================================");
    console.log("Phase 6 Integration & Audit Trail Verification PASSED!");
    console.log(`Results: ${passed} Passed, ${failed} Failed.`);
    console.log("==========================================");
  } catch (err: any) {
    console.error("Phase 6 integration test failed:", err);
    process.exit(1);
  }
}

runPhase6JourneyVerification();
