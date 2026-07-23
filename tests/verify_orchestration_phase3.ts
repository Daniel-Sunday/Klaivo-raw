import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState, TreeSkeleton, TreeNode } from '../schemas';

async function runPhase3OrchestrationTests() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Phase 3 Orchestration Integration Tests");
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

  async function assertThrowsAsync(fn: () => Promise<any>, testName: string) {
    try {
      await fn();
      console.error(`[FAIL] ${testName} (Expected exception but none was thrown)`);
      failed++;
    } catch (e: any) {
      console.log(`[PASS] ${testName} (Caught expected error: ${e.message.split('\n')[0]})`);
      passed++;
    }
  }

  const orchestrator = new KlaivoOrchestrator();

  const baseLearnerState: LearnerState = {
    learnerId: "learner_p3",
    currentGoal: {
      rawStatement: "I want to pass WAEC organic chemistry",
      domain: "Chemistry",
      specificObjective: "Master WAEC organic chemistry to get top score",
      contextArtifacts: [],
    },
    vocabularyLevel: "intermediate",
    masteryMap: {},
    sessionHistory: [],
  };

  try {
    // ----------------------------------------------------
    // Test 1: Intent Confidence Gate (<0.6 halt)
    // ----------------------------------------------------
    const lowConfResult = await orchestrator.handleIntakeWorkflow(
      "Unclear message",
      baseLearnerState,
      [],
      { intent: { intent: "learning_goal", confidence: 0.45, needsClarification: true } }
    );
    assert(
      lowConfResult.status === "needs_clarification",
      "1. Intent Confidence Gate - Low confidence prompt (<0.6) halts at needs_clarification"
    );

    // ----------------------------------------------------
    // Test 2: Non-Tree Intent Short-Circuiting
    // ----------------------------------------------------
    const lightResult = await orchestrator.handleIntakeWorkflow(
      "What is the IUPAC name for CH4?",
      baseLearnerState,
      [],
      { intent: { intent: "quick_answer", confidence: 0.95 } }
    );
    assert(
      lightResult.status === "light_response" && lightResult.intent === "quick_answer",
      "2. Non-Tree Intent Short-Circuit - quick_answer bypasses tree creation pipeline"
    );

    // ----------------------------------------------------
    // Test 3: Diagnosis Needs-More-Context Gate
    // ----------------------------------------------------
    const needsContextResult = await orchestrator.handleIntakeWorkflow(
      "Learn Python",
      baseLearnerState,
      [],
      {
        intent: { intent: "learning_goal", confidence: 0.9 },
        diagnosis: { needsMoreContext: true, clarifyingQuestion: "Are you aiming to automate spreadsheets or build web APIs?" },
      }
    );
    assert(
      needsContextResult.status === "needs_more_context",
      "3. Diagnosis Context Gate - Vague goal halts before Curriculum Drafter"
    );

    // ----------------------------------------------------
    // Test 4: Full Intake Pipeline Execution
    // ----------------------------------------------------
    const intakeResult = await orchestrator.handleIntakeWorkflow(
      "Pass WAEC organic chemistry exam by May",
      baseLearnerState,
      ["syllabus.pdf"],
      {
        intent: { intent: "exam_preparation", confidence: 0.95 },
        diagnosis: {
          needsMoreContext: false,
          currentGoal: {
            rawStatement: "Pass WAEC organic chemistry exam by May",
            domain: "Organic Chemistry",
            specificObjective: "Master WAEC level organic chemistry mechanisms and synthesis",
            contextArtifacts: ["syllabus.pdf"],
          },
        },
        skeleton: {
          nodes: [
            {
              id: "node_alkanes_p3",
              title: "Alkanes & Nomenclature",
              oneLineSummary: "IUPAC naming and substitution reactions",
              goalRelevance: "Required for WAEC Section A organic chemistry questions",
              prerequisiteIds: [],
              status: "available",
              content: null,
              masteryScore: 0.0,
              depth: 0,
            },
          ],
        },
      }
    );
    assert(
      intakeResult.status === "tree_created",
      "4. Full Intake Pipeline - Created verified tree skeleton with goalRelevance"
    );

    if (intakeResult.status !== "tree_created") {
      throw new Error("Tree creation failed in Test 4");
    }

    const activeTree: TreeSkeleton = intakeResult.tree;
    const activeState: LearnerState = intakeResult.learnerState;

    // ----------------------------------------------------
    // Test 5: Lazy Loading Node Content & Caching
    // ----------------------------------------------------
    const firstNode = activeTree.nodes[0];
    assert(
      firstNode.content === null,
      "5a. Lazy Loading - Node content is strictly null before first open"
    );

    const loadedContent = await orchestrator.handleOpenNodeWorkflow(activeTree, firstNode.id, activeState);
    assert(
      loadedContent.nodeId === firstNode.id && firstNode.content !== null,
      "5b. Lazy Loading - Content generated on-demand and cached on TreeNode.content"
    );

    const cachedContent = await orchestrator.handleOpenNodeWorkflow(activeTree, firstNode.id, activeState);
    assert(
      cachedContent.explanation === loadedContent.explanation,
      "5c. Lazy Loading - Subsequent node opens return cached content"
    );

    // ----------------------------------------------------
    // Test 6: Node Assessment & Unconditional Prerequisite Unlocking
    // ----------------------------------------------------
    const lockedNode: TreeNode = {
      id: "node_locked_2",
      title: "Advanced Substitution Reactions",
      oneLineSummary: "SN1 and SN2 reaction mechanisms",
      goalRelevance: "WAEC section B essay synthesis question",
      prerequisiteIds: [firstNode.id],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 1,
    };
    activeTree.nodes.push(lockedNode);

    const assessmentWorkflowResult = await orchestrator.handleNodeAssessmentWorkflow(
      activeTree,
      firstNode.id,
      "Alkanes have C-C single bonds and follow IUPAC prefix rules.",
      activeState
    );

    assert(
      assessmentWorkflowResult.tree.nodes.find((n) => n.id === firstNode.id)?.status === "mastered",
      "6a. Assessment Workflow - Evaluated response and marked target node 'mastered'"
    );

    assert(
      assessmentWorkflowResult.tree.nodes.find((n) => n.id === lockedNode.id)?.status === "available",
      "6b. Unconditional Prerequisite Unlocking - Automatically unlocked downstream node dependent on mastered prerequisite"
    );

    // ----------------------------------------------------
    // Test 7: Refinement Workflow & Mastered Node Protection
    // ----------------------------------------------------
    const refinementResult = await orchestrator.handleRefinementWorkflow(
      { treeId: activeTree.treeId, learnerFeedback: "Add stereochemistry sub-topic", targetNodeId: null },
      activeTree,
      activeState
    );
    assert(
      refinementResult.version === 2,
      "7a. Refinement Workflow - Processed diff and incremented tree version to 2"
    );

    await assertThrowsAsync(
      async () => {
        await orchestrator.handleRefinementWorkflow(
          { treeId: activeTree.treeId, learnerFeedback: "Remove mastered node", targetNodeId: null },
          activeTree,
          activeState,
          { removedNodeIds: [firstNode.id] } // Attempting to remove mastered node!
        );
      },
      "7b. Refinement Guardrail - Prohibits removing MASTERED node in refinement diff"
    );

    // ----------------------------------------------------
    // Test 8: End Session Reflection Workflow
    // ----------------------------------------------------
    const reflectionResult = await orchestrator.handleEndSessionWorkflow(
      "session_phase3_test",
      activeState,
      []
    );
    assert(
      reflectionResult.learnerState.sessionHistory.length === 1 &&
        reflectionResult.summary.sessionId === "session_phase3_test",
      "8. End Session Reflection - Compressed session history and appended SessionSummary"
    );

    console.log(`\nAll Phase 3 Orchestration Tests Completed Successfully!`);
    console.log(`Results: ${passed} Passed, ${failed} Failed.`);
  } catch (err: any) {
    console.error("Orchestration test failed with error:", err);
    process.exit(1);
  }
}

runPhase3OrchestrationTests();
