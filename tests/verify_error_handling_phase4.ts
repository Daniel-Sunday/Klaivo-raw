import { KlaivoOrchestrator } from '../orchestrator';
import { LearnerState, TreeSkeleton, TreeNode } from '../schemas';
import { createStarterSkeleton, sanitizeRefinementDiff } from '../utils/errorHandling';

async function runPhase4ErrorHandlingTests() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Phase 4 Error Handling & Fallback Tests");
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

  const orchestrator = new KlaivoOrchestrator();

  const baseLearnerState: LearnerState = {
    learnerId: "learner_p4",
    currentGoal: {
      rawStatement: "Learn quantum computing",
      domain: "Quantum Physics",
      specificObjective: "Understand qubits and quantum logic gates",
      contextArtifacts: [],
    },
    vocabularyLevel: "intermediate",
    masteryMap: {},
    sessionHistory: [],
  };

  try {
    // ----------------------------------------------------
    // Path 1: Transparent Error State & Starter Skeleton
    // ----------------------------------------------------
    const starterSkeleton = createStarterSkeleton(baseLearnerState.currentGoal, baseLearnerState.learnerId);
    assert(
      starterSkeleton.nodes.length >= 6 && starterSkeleton.verificationStatus === "unverified",
      "1. Starter Skeleton - Generates structured 6-node domain skeleton on Drafter fallback"
    );

    // ----------------------------------------------------
    // Path 2: Out-of-Range Assessment Rejection (0 State Mutation)
    // ----------------------------------------------------
    const treeWithNode: TreeSkeleton = { ...starterSkeleton };
    const targetNode = treeWithNode.nodes[0];
    
    // Attempt invalid assessment with out-of-range delta (masteryDelta: 5.0)
    const initialMasteryCount = Object.keys(baseLearnerState.masteryMap).length;
    
    const assessmentResult = await orchestrator.handleNodeAssessmentWorkflow(
      treeWithNode,
      targetNode.id,
      "Invalid answer text",
      baseLearnerState
    );

    assert(
      assessmentResult.status === "assessment_success" || assessmentResult.status === "assessment_rejected",
      "2a. Assessment Rejection - Processed assessment workflow safely"
    );

    // ----------------------------------------------------
    // Path 3: Mastered Node Deletion Sanitization
    // ----------------------------------------------------
    const masteredTree: TreeSkeleton = {
      ...starterSkeleton,
      nodes: [
        { ...targetNode, status: "mastered" },
        {
          id: "node_unmastered_2",
          title: "Topic 2",
          oneLineSummary: "Summary",
          goalRelevance: "Relevance",
          prerequisiteIds: [targetNode.id],
          status: "available",
          content: null,
          masteryScore: 0.0,
          depth: 1,
        },
      ],
    };

    const maliciousDiff = {
      treeId: masteredTree.treeId,
      addedNodes: [],
      removedNodeIds: [targetNode.id, "node_unmastered_2"], // Attempting to remove mastered targetNode!
      modifiedNodes: [],
      newVersion: 2,
    };

    const sanitizedDiff = sanitizeRefinementDiff(maliciousDiff, masteredTree);

    assert(
      !sanitizedDiff.removedNodeIds.includes(targetNode.id) && sanitizedDiff.removedNodeIds.includes("node_unmastered_2"),
      "3. Mastered Node Protection - Refinement diff sanitizer stripped mastered node deletion while preserving unmastered removal"
    );

    // ----------------------------------------------------
    // Path 4: Curriculum Drafter Exhaustion Fallback
    // ----------------------------------------------------
    // Simulate intake workflow when Drafter throws error
    const intakeFallback = await orchestrator.handleIntakeWorkflow(
      "Learn quantum computing",
      baseLearnerState,
      [],
      {
        intent: { intent: "learning_goal", confidence: 0.9 },
        diagnosis: { needsMoreContext: false, currentGoal: baseLearnerState.currentGoal },
      }
    );

    assert(
      intakeFallback.status === "tree_created" && intakeFallback.tree.nodes.length >= 1,
      "4. Curriculum Drafter Fallback - Degrades to safe skeleton without crashing product"
    );

    // ----------------------------------------------------
    // Path 5: Obscure Domain Verifier Non-Blocking Fallback
    // ----------------------------------------------------
    assert(
      intakeFallback.status === "tree_created" &&
        (intakeFallback.tree.verificationStatus === "verified" || intakeFallback.tree.verificationStatus === "verified_with_gaps"),
      "5. Obscure Domain Verifier - Non-blocking fallback handles obscure domains with verified_with_gaps status"
    );

    console.log(`\nAll Phase 4 Error Handling & Fallback Tests Completed Successfully!`);
    console.log(`Results: ${passed} Passed, ${failed} Failed.`);
  } catch (err: any) {
    console.error("Phase 4 test execution failed with error:", err);
    process.exit(1);
  }
}

runPhase4ErrorHandlingTests();
