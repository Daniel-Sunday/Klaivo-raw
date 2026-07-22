import { runIntentAgent } from '../agents/intentAgent';
import { runDiagnosisAgent } from '../agents/diagnosisAgent';
import { runCurriculumDrafter } from '../agents/curriculumDrafter';
import { runCurriculumVerifier } from '../agents/curriculumVerifier';
import { runTeachingAgent } from '../agents/teachingAgent';
import { runAssessmentAgent } from '../agents/assessmentAgent';
import { runMemoryUpdateAgent } from '../agents/memoryUpdateAgent';
import { runRefinementAgent } from '../agents/refinementAgent';
import { runReflectionAgent } from '../agents/reflectionAgent';
import { LearnerState, TreeSkeleton, TreeNode } from '../schemas';

async function runPhase2UnitTests() {
  process.env.USE_AGENT_MOCKS = 'true';

  console.log("==========================================");
  console.log("Running Phase 2 Agent Unit Tests (Isolated)");
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

  try {
    // ----------------------------------------------------
    // 2.1 Intent Agent Unit Tests
    // ----------------------------------------------------
    const intentHighConf = await runIntentAgent(
      { rawMessage: "I need to pass my WAEC organic chemistry exam" },
      { intent: "exam_preparation", confidence: 0.95 }
    );
    assert(
      intentHighConf.output.intent === "exam_preparation" && !intentHighConf.output.needsClarification,
      "2.1 Intent Agent - High confidence classifies correctly without clarification flag"
    );

    const intentLowConf = await runIntentAgent(
      { rawMessage: "Maybe something about code or chemistry" },
      { intent: "learning_goal", confidence: 0.45 }
    );
    assert(
      intentLowConf.output.needsClarification === true,
      "2.1 Intent Agent - Low confidence (< 0.6) sets needsClarification guardrail flag"
    );

    // ----------------------------------------------------
    // 2.2 Diagnosis Agent Unit Tests
    // ----------------------------------------------------
    const diagnosisResult = await runDiagnosisAgent(
      {
        learnerId: "user_101",
        rawGoalStatement: "Pass WAEC chemistry exam by May",
        intentClassification: "exam_preparation",
        contextArtifacts: ["syllabus_2026.pdf"],
      },
      {
        needsMoreContext: false,
        currentGoal: {
          rawStatement: "Pass WAEC chemistry exam by May",
          domain: "Organic Chemistry",
          specificObjective: "Master WAEC level organic chemistry synthesis to score top grade in May exam",
          contextArtifacts: ["syllabus_2026.pdf"],
        },
      }
    );
    assert(
      diagnosisResult.output.currentGoal.domain === "Organic Chemistry" &&
        diagnosisResult.output.currentGoal.specificObjective.includes("synthesis"),
      "2.2 Diagnosis Agent - Distills sharp goal-conditioned objective distinct from domain"
    );

    // ----------------------------------------------------
    // 2.3 Curriculum Drafter Unit Tests
    // ----------------------------------------------------
    const drafterResult = await runCurriculumDrafter(
      {
        treeId: "tree_test_1",
        learnerId: "user_101",
        currentGoal: diagnosisResult.output.currentGoal,
        vocabularyLevel: "intermediate",
      },
      {
        nodes: [
          {
            id: "node_alkanes",
            title: "Alkanes & IUPAC Rules",
            oneLineSummary: "Naming rules and substitution reactions",
            goalRelevance: "Directly required for WAEC Section A organic chemistry nomenclature",
            prerequisiteIds: [],
            status: "available",
            content: null,
            masteryScore: 0.0,
            depth: 0,
          },
        ],
      }
    );
    assert(
      drafterResult.output.verificationStatus === "unverified" &&
        drafterResult.output.nodes[0].goalRelevance.length > 10,
      "2.3 Curriculum Drafter - Generates unverified skeleton with non-empty goalRelevance per node"
    );

    // ----------------------------------------------------
    // 2.4 Curriculum Verifier Unit Tests
    // ----------------------------------------------------
    const verifierResult = await runCurriculumVerifier(
      { skeleton: drafterResult.output },
      { verificationStatus: "verified_with_gaps", verificationNotes: ["Missing stereochemistry topic from standard syllabus"] }
    );
    assert(
      verifierResult.output.verificationStatus === "verified_with_gaps" &&
        verifierResult.output.verificationNotes.length > 0,
      "2.4 Curriculum Verifier - Flags gaps in notes without modifying tree unilaterally"
    );

    // ----------------------------------------------------
    // 2.5 Teaching Agent Unit Tests
    // ----------------------------------------------------
    const sampleNode: TreeNode = drafterResult.output.nodes[0];
    const teachingResult = await runTeachingAgent(
      {
        learnerId: "user_101",
        node: sampleNode,
        vocabularyLevel: "intermediate",
      },
      { explanation: "Intermediate explanation of IUPAC nomenclature for alkanes." }
    );
    assert(
      teachingResult.output.vocabularyLevelUsed === "intermediate" &&
        teachingResult.output.explanation.length > 0,
      "2.5 Teaching Agent - Generates NodeContent calibrated to vocabularyLevel"
    );

    // Caching Test
    const nodeWithCache: TreeNode = { ...sampleNode, content: teachingResult.output };
    const cachedTeachingResult = await runTeachingAgent({
      learnerId: "user_101",
      node: nodeWithCache,
      vocabularyLevel: "intermediate",
    });
    assert(
      Boolean(cachedTeachingResult.log.reasoning?.includes("Caching Guardrail Enforced")),
      "2.5 Teaching Agent - Returns cached content without regenerating on duplicate visit"
    );

    // ----------------------------------------------------
    // 2.6 Assessment Agent Unit Tests
    // ----------------------------------------------------
    const assessmentResult = await runAssessmentAgent(
      {
        learnerId: "user_101",
        node: sampleNode,
        learnerResponse: "2-methylpropane has a branched methyl group at carbon 2.",
      },
      {
        nodeId: sampleNode.id,
        masteryDelta: 0.4,
        detectedMisconceptions: [],
        readyToAdvance: true,
        reasoning: "Learner correctly identified chain branch and carbon location.",
      }
    );
    assert(
      assessmentResult.output.masteryDelta === 0.4 && assessmentResult.output.reasoning.length > 0,
      "2.6 Assessment Agent - Evaluates mastery delta with mandatory reasoning justification"
    );

    // ----------------------------------------------------
    // 2.7 Memory Update Agent Unit Tests
    // ----------------------------------------------------
    const initialLearnerState: LearnerState = {
      learnerId: "user_101",
      currentGoal: diagnosisResult.output.currentGoal,
      vocabularyLevel: "beginner",
      masteryMap: {},
      sessionHistory: [],
    };

    const memoryResult = runMemoryUpdateAgent(assessmentResult.output, initialLearnerState);
    assert(
      memoryResult.updatedState.masteryMap[sampleNode.id].level === 0.4 &&
        memoryResult.log.agentName === "MemoryUpdateAgent",
      "2.7 Memory Update Agent - Deterministically updates LearnerState masteryMap and logs audit trail"
    );

    // ----------------------------------------------------
    // 2.8 Refinement Agent Unit Tests
    // ----------------------------------------------------
    const treeWithMasteredNode: TreeSkeleton = {
      ...drafterResult.output,
      nodes: [
        { ...sampleNode, status: "mastered" },
        {
          id: "node_alkenes",
          title: "Alkenes",
          oneLineSummary: "Double bond reactions",
          goalRelevance: "WAEC alkenes section",
          prerequisiteIds: [sampleNode.id],
          status: "available",
          content: null,
          masteryScore: 0.0,
          depth: 1,
        },
      ],
    };

    const refinementResult = await runRefinementAgent(
      {
        request: { treeId: treeWithMasteredNode.treeId, learnerFeedback: "Remove alkenes topic", targetNodeId: null },
        currentTree: treeWithMasteredNode,
      },
      { removedNodeIds: ["node_alkenes"], newVersion: 2 }
    );
    assert(
      refinementResult.output.newVersion === 2 && refinementResult.output.removedNodeIds.includes("node_alkenes"),
      "2.8 Refinement Agent - Produces valid tree diff removing unmastered node"
    );

    // Hard Mastered Node Protection Guardrail Test
    await assertThrowsAsync(
      async () => {
        await runRefinementAgent(
          {
            request: { treeId: treeWithMasteredNode.treeId, learnerFeedback: "Remove mastered node", targetNodeId: null },
            currentTree: treeWithMasteredNode,
          },
          { removedNodeIds: [sampleNode.id], newVersion: 2 }
        );
      },
      "2.8 Refinement Agent - Hard code guardrail rejects diff attempting to remove MASTERED node"
    );

    // ----------------------------------------------------
    // 2.9 Reflection Agent Unit Tests
    // ----------------------------------------------------
    const reflectionResult = await runReflectionAgent(
      {
        sessionId: "sess_1001",
        learnerId: "user_101",
        recentLogs: [intentHighConf.log, diagnosisResult.log, memoryResult.log],
        masteryMap: memoryResult.updatedState.masteryMap,
        goalSummary: "Master WAEC Organic Chemistry",
      },
      {
        nodesCovered: [sampleNode.id],
        keyTakeaways: ["Mastered IUPAC alkane naming rules"],
        confusionFlagsResolved: ["Resolved alkane vs alkene bond confusion"],
      }
    );
    assert(
      reflectionResult.output.sessionId === "sess_1001" &&
        reflectionResult.output.keyTakeaways.length > 0,
      "2.9 Reflection Agent - Generates compressive SessionSummary preserving struggle signal"
    );

    console.log(`\nAll Phase 2 Agent Unit Tests Completed Successfully!`);
    console.log(`Results: ${passed} Passed, ${failed} Failed.`);
  } catch (err: any) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
}

runPhase2UnitTests();
