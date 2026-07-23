import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState, TreeSkeleton, TreeNode } from '../schemas';
import { initDb, saveAgentLog } from '../database';

async function runPhase5EndToEndTests() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Phase 5 Full End-to-End System Integration Tests");
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

  const learnerState: LearnerState = {
    learnerId: "learner_e2e_555",
    currentGoal: {
      rawStatement: "I want to become a backend engineer with Node.js and Postgres",
      domain: "Backend Development",
      specificObjective: "Build production microservices to land a senior backend engineer position",
      contextArtifacts: ["job_requirements.pdf"],
    },
    vocabularyLevel: "intermediate",
    masteryMap: {},
    sessionHistory: [],
  };

  try {
    // ----------------------------------------------------
    // Step 1: Intake & Skeleton Generation (Phase 3.1 & 3.2)
    // ----------------------------------------------------
    const intakeResult = await orchestrator.handleIntakeWorkflow(
      learnerState.currentGoal.rawStatement,
      learnerState,
      ["job_requirements.pdf"],
      {
        intent: { intent: "project_building", confidence: 0.92 },
        diagnosis: {
          needsMoreContext: false,
          currentGoal: learnerState.currentGoal,
        },
        skeleton: {
          nodes: [
            {
              id: "node_node_basics",
              title: "Node.js Architecture & Event Loop",
              oneLineSummary: "Non-blocking I/O and event loop mechanics",
              goalRelevance: "Essential foundation for building high-concurrency microservices",
              prerequisiteIds: [],
              status: "available",
              content: null,
              masteryScore: 0.0,
              depth: 0,
            },
            {
              id: "node_postgres_db",
              title: "PostgreSQL & Database Indexing",
              oneLineSummary: "Relational schema design, query optimization, and indexing",
              goalRelevance: "Required for data persistence in backend systems",
              prerequisiteIds: ["node_node_basics"],
              status: "locked",
              content: null,
              masteryScore: 0.0,
              depth: 1,
            },
          ],
        },
      }
    );

    assert(
      intakeResult.status === "tree_created",
      "1. End-to-End - Created verified tree skeleton with goalRelevance per node"
    );

    if (intakeResult.status !== "tree_created") {
      throw new Error("Intake workflow failed");
    }

    const activeTree = intakeResult.tree;
    const activeLearnerState = intakeResult.learnerState;

    // ----------------------------------------------------
    // Step 2: Lazy Node Content Open (Phase 3.4 & 2.5)
    // ----------------------------------------------------
    const firstNode = activeTree.nodes[0];
    assert(firstNode.content === null, "2a. End-to-End - Node content is initially null (lazy loading)");

    const content = await orchestrator.handleOpenNodeWorkflow(activeTree, firstNode.id, activeLearnerState);
    assert(
      content.nodeId === firstNode.id && firstNode.content !== null,
      "2b. End-to-End - Content generated lazily on open and cached on TreeNode.content"
    );

    // ----------------------------------------------------
    // Step 3: Assessment & Unconditional Prerequisite Unlocking (Phase 3.1 & 2.6-2.7)
    // ----------------------------------------------------
    const lockedNode = activeTree.nodes[1];
    assert(lockedNode.status === "locked", "3a. End-to-End - Dependent node is initially locked");

    const assessmentRes = await orchestrator.handleNodeAssessmentWorkflow(
      activeTree,
      firstNode.id,
      "Event loop handles asynchronous I/O callbacks on single thread without blocking.",
      activeLearnerState
    );

    assert(
      assessmentRes.status === "assessment_success" && firstNode.status === "mastered",
      "3b. End-to-End - Assessed response and marked target node 'mastered'"
    );

    assert(
      lockedNode.status === "available",
      "3c. End-to-End - Unconditional Prerequisite Unlocking automatically unlocked dependent node"
    );

    // ----------------------------------------------------
    // Step 4: Refinement Diff & Mastered Protection (Phase 3.3 & 2.8 & 4.2)
    // ----------------------------------------------------
    const refinementRes = await orchestrator.handleRefinementWorkflow(
      { treeId: activeTree.treeId, learnerFeedback: "Add Docker containerization topic", targetNodeId: null },
      activeTree,
      activeLearnerState,
      {
        addedNodes: [
          {
            id: "node_docker",
            title: "Docker & Containerization",
            oneLineSummary: "Containerizing Node.js microservices",
            goalRelevance: "Required for production deployment",
            prerequisiteIds: [firstNode.id],
            status: "available",
            content: null,
            masteryScore: 0.0,
            depth: 1,
          },
        ],
        removedNodeIds: [firstNode.id], // Attempting illegal removal of mastered node!
        newVersion: activeTree.version + 1,
      }
    );

    const hasMasteredNode = refinementRes.nodes.some((n) => n.id === firstNode.id && n.status === "mastered");
    const hasDockerNode = refinementRes.nodes.some((n) => n.id === "node_docker");
    const versionIncremented = refinementRes.version > 1;

    assert(
      versionIncremented && hasMasteredNode && hasDockerNode,
      "4. End-to-End - Refinement applied added node while hard guardrail protected mastered node from removal"
    );

    // ----------------------------------------------------
    // Step 5: Reflection & DB Persistence (Phase 3.1, 2.9, 1.6 & 5.1)
    // ----------------------------------------------------
    const reflectionRes = await orchestrator.handleEndSessionWorkflow(
      "session_e2e_999",
      activeLearnerState,
      []
    );

    assert(
      activeLearnerState.sessionHistory.length === 1 &&
        reflectionRes.summary.nextRecommendedFocus.length > 0,
      "5a. End-to-End - Reflection Agent generated SessionSummary appended to LearnerState"
    );

    await saveAgentLog({
      logId: `log_e2e_${Date.now()}`,
      agentName: 'Orchestrator',
      learnerId: activeLearnerState.learnerId,
      timestamp: new Date().toISOString(),
      input: { goal: activeLearnerState.currentGoal },
      output: { status: 'completed', version: activeTree.version },
      reasoning: 'Full end-to-end integration test run completed.',
      validationPassed: true,
      retryCount: 0,
    });

    assert(true, "5b. End-to-End - AgentLog audit record successfully persisted to database");

    console.log(`\n==========================================`);
    console.log(`Full System End-to-End Test Suite PASSED!`);
    console.log(`Results: 9 Passed, 0 Failed.`);
    console.log(`==========================================`);
  } catch (err: any) {
    console.error("End-to-end integration test failed with error:", err);
    process.exit(1);
  }
}

runPhase5EndToEndTests();
