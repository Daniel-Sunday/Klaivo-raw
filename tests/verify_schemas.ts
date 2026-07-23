import {
  LearnerStateSchema,
  TreeSkeletonSchema,
  TreeNodeSchema,
  NodeContentSchema,
  AssessmentResultSchema,
  validateAssessmentResult,
  RefinementDiffSchema,
  validateRefinementDiff,
  AgentLogSchema,
  LearnerState,
  TreeSkeleton,
} from '../schemas';

function runTests() {
  console.log("==========================================");
  console.log("Running Phase 1 Schema Verification Tests");
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

  function assertThrows(fn: () => void, testName: string) {
    try {
      fn();
      console.error(`[FAIL] ${testName} (Expected exception but none was thrown)`);
      failed++;
    } catch (e: any) {
      console.log(`[PASS] ${testName} (Caught expected error: ${e.message.split('\n')[0]})`);
      passed++;
    }
  }

  // 1. LearnerState validation
  const validLearnerState: LearnerState = {
    learnerId: "user_123",
    currentGoal: {
      rawStatement: "I want to pass organic chemistry WAEC exam",
      domain: "chemistry",
      specificObjective: "Master WAEC level organic chemistry mechanisms and synthesis",
      contextArtifacts: ["syllabus_2026.pdf"],
    },
    vocabularyLevel: "intermediate",
    masteryMap: {
      "node_alkanes": {
        level: 0.8,
        lastAssessed: new Date().toISOString(),
        confusionFlags: [],
      },
    },
    sessionHistory: [
      {
        sessionId: "sess_1",
        timestamp: new Date().toISOString(),
        nodesCovered: ["node_alkanes"],
        masteryChanges: [{ nodeId: "node_alkanes", delta: 0.8 }],
        persistentMisconceptions: [],
        nextRecommendedFocus: "Alkenes and unsaturated hydrocarbons",
      },
    ],
  };

  assert(
    LearnerStateSchema.safeParse(validLearnerState).success,
    "1. Valid LearnerState parses successfully"
  );

  assertThrows(
    () => LearnerStateSchema.parse({ ...validLearnerState, vocabularyLevel: "expert" }),
    "2. Invalid vocabularyLevel 'expert' rejected"
  );

  // 2. TreeNode & TreeSkeleton validation
  const validTree: TreeSkeleton = {
    treeId: "tree_999",
    learnerId: "user_123",
    goalSummary: "WAEC Organic Chemistry Mastery",
    nodes: [
      {
        id: "node_1",
        title: "IUPAC Nomenclature",
        oneLineSummary: "Learn rules for naming organic compounds",
        goalRelevance: "Essential foundation for WAEC organic chemistry section A & B",
        prerequisiteIds: [],
        status: "mastered",
        content: null,
        masteryScore: 0.95,
        depth: 0,
      },
      {
        id: "node_2",
        title: "Alkanes & Alkenes",
        oneLineSummary: "Reactions and properties of saturated and unsaturated hydrocarbons",
        goalRelevance: "Covers 25% of WAEC organic chemistry questions",
        prerequisiteIds: ["node_1"],
        status: "available",
        content: null,
        masteryScore: 0.0,
        depth: 1,
      },
    ],
    edges: [{ from: "node_1", to: "node_2" }],
    verificationStatus: "verified",
    verificationNotes: ["Tree verified by Curriculum Verifier"],
    version: 1,
  };

  assert(
    TreeSkeletonSchema.safeParse(validTree).success,
    "3. Valid TreeSkeleton parses successfully"
  );

  assertThrows(
    () =>
      TreeNodeSchema.parse({
        id: "node_invalid",
        title: "Test",
        oneLineSummary: "Summary",
        goalRelevance: "", // Empty goalRelevance!
        prerequisiteIds: [],
        status: "available",
        content: null,
        masteryScore: 0.0,
        depth: 0,
      }),
    "4. TreeNode with empty goalRelevance fails validation (Enforces Non-Negotiable #4)"
  );

  // 3. NodeContent validation
  assert(
    NodeContentSchema.safeParse({
      nodeId: "node_2",
      explanation: "Alkanes are saturated hydrocarbons with single bonds.",
      examples: ["Methane (CH4)", "Ethane (C2H6)"],
      generatedAt: new Date().toISOString(),
      vocabularyLevelUsed: "intermediate",
    }).success,
    "5. Valid NodeContent parses successfully"
  );

  // 4. AssessmentResult & Validation Helper
  const validAssessment = {
    nodeId: "node_1",
    masteryDelta: 0.25,
    detectedMisconceptions: [],
    readyToAdvance: true,
    reasoning: "Learner accurately named all sample compounds with zero errors.",
  };

  assert(
    validateAssessmentResult(validAssessment, validTree).nodeId === "node_1",
    "6. validateAssessmentResult succeeds with valid data & existing nodeId"
  );

  assertThrows(
    () => validateAssessmentResult({ ...validAssessment, masteryDelta: 1.5 }),
    "7. AssessmentResult with masteryDelta out of bounds (> 1.0) rejected"
  );

  assertThrows(
    () => validateAssessmentResult({ ...validAssessment, nodeId: "non_existent_node" }, validTree),
    "8. AssessmentResult with non-existent nodeId rejected against current tree"
  );

  // 5. RefinementDiff & Validation Helper
  const validDiff = {
    treeId: "tree_999",
    addedNodes: [
      {
        id: "node_3",
        title: "Alkynes",
        oneLineSummary: "Triple-bonded hydrocarbons",
        goalRelevance: "Required for complete WAEC hydrocarbon section",
        prerequisiteIds: ["node_2"],
        status: "locked" as const,
        content: null,
        masteryScore: 0,
        depth: 2,
      },
    ],
    removedNodeIds: ["node_2"], // node_2 is 'available', so removable
    modifiedNodes: [],
    newVersion: 2,
  };

  assert(
    validateRefinementDiff(validDiff, validTree).newVersion === 2,
    "9. validateRefinementDiff succeeds when removing available/unmastered node"
  );

  assertThrows(
    () =>
      validateRefinementDiff(
        {
          ...validDiff,
          removedNodeIds: ["node_1"], // node_1 is MASTERED!
        },
        validTree
      ),
    "10. RefinementDiff attempting to remove MASTERED node 'node_1' rejected (Enforces Non-Negotiable #5)"
  );

  // 6. AgentLog audit trail validation
  assert(
    AgentLogSchema.safeParse({
      logId: "log_001",
      agentName: "IntentAgent",
      learnerId: "user_123",
      timestamp: new Date().toISOString(),
      input: { query: "Help me pass WAEC chemistry" },
      output: { domain: "chemistry", specificObjective: "Pass WAEC chemistry" },
      reasoning: "Learner explicitly mentioned WAEC exam and chemistry domain.",
      validationPassed: true,
      retryCount: 0,
    }).success,
    "11. AgentLog audit trail parses successfully"
  );

  console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
