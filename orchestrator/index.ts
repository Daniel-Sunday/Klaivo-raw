import {
  LearnerState,
  TreeSkeleton,
  TreeNode,
  NodeContent,
  AssessmentResult,
  RefinementRequest,
  RefinementDiff,
  SessionSummary,
  AgentLog,
  validateAssessmentResult,
} from '../schemas';
import { runIntentAgent, IntentAgentOutput } from '../agents/intentAgent';
import { runDiagnosisAgent, DiagnosisAgentOutput } from '../agents/diagnosisAgent';
import { runCurriculumDrafter } from '../agents/curriculumDrafter';
import { runCurriculumVerifier } from '../agents/curriculumVerifier';
import { runTeachingAgent } from '../agents/teachingAgent';
import { runAssessmentAgent } from '../agents/assessmentAgent';
import { runMemoryUpdateAgent } from '../agents/memoryUpdateAgent';
import { runRefinementAgent } from '../agents/refinementAgent';
import { runReflectionAgent } from '../agents/reflectionAgent';
import { createStarterSkeleton, sanitizeRefinementDiff, sanitizeUserErrorMessage } from '../utils/errorHandling';

export type IntakeWorkflowResult =
  | { status: 'needs_clarification'; question: string; intentOutput: IntentAgentOutput }
  | { status: 'light_response'; intent: string; response: string }
  | { status: 'needs_more_context'; question: string; diagnosisOutput: DiagnosisAgentOutput }
  | { status: 'tree_created'; tree: TreeSkeleton; learnerState: LearnerState; isFallback?: boolean };

export type AssessmentWorkflowResult =
  | { status: 'assessment_success'; assessmentResult: AssessmentResult; updatedState: LearnerState; tree: TreeSkeleton }
  | { status: 'assessment_rejected'; message: string; currentState: LearnerState };

export class KlaivoOrchestrator {
  /**
   * 3.1 & 3.2 Primary Intake Workflow with Phase 4 Error Fallbacks
   * Enforces:
   * Guardrail 1: Intent Confidence Gate (<0.6 halt)
   * Guardrail 2: Short-circuit non-tree intents (quick_answer, problem_solving, research)
   * Guardrail 3: Diagnosis Needs-More-Context Gate (halt before Drafter)
   * Fallback: Curriculum Drafter exhaustion -> Minimal starter skeleton (3-5 nodes)
   */
  public async handleIntakeWorkflow(
    userMessage: string,
    learnerState: LearnerState,
    contextArtifacts: string[] = [],
    mockOverrides?: {
      intent?: Partial<IntentAgentOutput>;
      diagnosis?: Partial<DiagnosisAgentOutput>;
      skeleton?: Partial<TreeSkeleton>;
    }
  ): Promise<IntakeWorkflowResult> {
    // Step 1: Intent Agent
    const intentResult = await runIntentAgent(
      { rawMessage: userMessage, learnerState },
      mockOverrides?.intent
    );

    // Guardrail 1: Intent Confidence Gate
    if (intentResult.output.confidence < 0.6 || intentResult.output.needsClarification) {
      return {
        status: 'needs_clarification',
        question: sanitizeUserErrorMessage('IntentAgent', 'Low confidence'),
        intentOutput: intentResult.output,
      };
    }

    const { intent } = intentResult.output;

    // Guardrail 2: Short-Circuit Non-Tree Intents
    if (intent === 'quick_answer' || intent === 'problem_solving' || intent === 'research') {
      return {
        status: 'light_response',
        intent,
        response: `Direct ${intent} response generated without tree drafting.`,
      };
    }

    // Step 2: Diagnosis Agent
    const diagnosisResult = await runDiagnosisAgent(
      {
        learnerId: learnerState.learnerId,
        rawGoalStatement: userMessage,
        contextArtifacts,
        intentClassification: intent,
      },
      mockOverrides?.diagnosis
    );

    // Guardrail 3: Diagnosis Needs-More-Context Gate
    if (diagnosisResult.output.needsMoreContext) {
      return {
        status: 'needs_more_context',
        question: diagnosisResult.output.clarifyingQuestion || sanitizeUserErrorMessage('DiagnosisAgent', 'Vague goal'),
        diagnosisOutput: diagnosisResult.output,
      };
    }

    // Update LearnerState currentGoal with validated objective
    learnerState.currentGoal = diagnosisResult.output.currentGoal;

    // Step 3: Curriculum Drafter with Phase 4 Fallback
    const treeId = `tree_${Date.now()}`;
    let skeleton: TreeSkeleton;
    let isFallback = false;

    try {
      const drafterResult = await runCurriculumDrafter(
        {
          treeId,
          learnerId: learnerState.learnerId,
          currentGoal: learnerState.currentGoal,
          vocabularyLevel: learnerState.vocabularyLevel,
          masteryMap: learnerState.masteryMap,
        },
        mockOverrides?.skeleton
      );
      skeleton = drafterResult.output;
    } catch (drafterErr: any) {
      skeleton = createStarterSkeleton(learnerState.currentGoal, learnerState.learnerId);
      isFallback = true;
    }

    // Step 4: Curriculum Verifier (Non-blocking fallback)
    try {
      const verifierResult = await runCurriculumVerifier({ skeleton });
      skeleton = verifierResult.output;
    } catch (verifierErr: any) {
      skeleton.verificationStatus = 'verified_with_gaps';
      skeleton.verificationNotes.push('Verification skipped due to reference search unavailability.');
    }

    return {
      status: 'tree_created',
      tree: skeleton,
      learnerState,
      isFallback,
    };
  }

  /**
   * 3.4 Lazy Loading Node Content Workflow
   */
  public async handleOpenNodeWorkflow(
    tree: TreeSkeleton,
    nodeId: string,
    learnerState: LearnerState
  ): Promise<NodeContent> {
    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Orchestration error: Node "${nodeId}" not found in tree "${tree.treeId}".`);
    }

    if (node.content) {
      return node.content;
    }

    const confusionFlags = learnerState.masteryMap[nodeId]?.confusionFlags || [];
    try {
      const teachingResult = await runTeachingAgent({
        learnerId: learnerState.learnerId,
        node,
        vocabularyLevel: learnerState.vocabularyLevel,
        confusionFlags,
      });

      node.content = teachingResult.output;
      return teachingResult.output;
    } catch (teachingErr: any) {
      const fallbackContent: NodeContent = {
        nodeId,
        explanation: `Core overview for ${node.title}: ${node.oneLineSummary}`,
        examples: [`Key practical focus for ${node.title}`],
        generatedAt: new Date().toISOString(),
        vocabularyLevelUsed: learnerState.vocabularyLevel,
      };
      node.content = fallbackContent;
      return fallbackContent;
    }
  }

  /**
   * 3.1 & 4.2 Assessment Workflow with Rejection Guardrail
   */
  public async handleNodeAssessmentWorkflow(
    tree: TreeSkeleton,
    nodeId: string,
    learnerResponse: string,
    learnerState: LearnerState
  ): Promise<AssessmentWorkflowResult> {
    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Orchestration error: Node "${nodeId}" not found in tree "${tree.treeId}".`);
    }

    const priorMastery = learnerState.masteryMap[nodeId] || null;

    try {
      const assessmentRes = await runAssessmentAgent({
        learnerId: learnerState.learnerId,
        node,
        learnerResponse,
        priorMastery,
      });

      const validatedAssessment = validateAssessmentResult(assessmentRes.output, tree);
      const { updatedState } = runMemoryUpdateAgent(validatedAssessment, learnerState);

      const currentMastery = updatedState.masteryMap[nodeId]?.level || 0.0;
      node.masteryScore = currentMastery;

      if (currentMastery >= 0.8 || validatedAssessment.readyToAdvance) {
        node.status = 'mastered';
      } else {
        node.status = 'in_progress';
      }

      this.unlockPrerequisiteNodes(tree);

      return {
        status: 'assessment_success',
        assessmentResult: validatedAssessment,
        updatedState,
        tree,
      };
    } catch (err: any) {
      return {
        status: 'assessment_rejected',
        message: sanitizeUserErrorMessage('AssessmentAgent', err.message),
        currentState: learnerState,
      };
    }
  }

  /**
   * 3.3 & 4.2 Refinement Workflow with Mastered Node Sanitization Fallback
   */
  public async handleRefinementWorkflow(
    request: RefinementRequest,
    currentTree: TreeSkeleton,
    learnerState: LearnerState,
    mockOutput?: Partial<RefinementDiff>
  ): Promise<TreeSkeleton> {
    let diff: RefinementDiff;

    try {
      const refinementRes = await runRefinementAgent(
        {
          request,
          currentTree,
          masteryMap: learnerState.masteryMap,
        },
        mockOutput
      );
      diff = refinementRes.output;
    } catch (err: any) {
      diff = mockOutput
        ? ({
            treeId: currentTree.treeId,
            addedNodes: mockOutput.addedNodes || [],
            removedNodeIds: mockOutput.removedNodeIds || [],
            modifiedNodes: mockOutput.modifiedNodes || [],
            newVersion: (mockOutput.newVersion || currentTree.version) + 1,
          } as RefinementDiff)
        : {
            treeId: currentTree.treeId,
            addedNodes: [],
            removedNodeIds: [],
            modifiedNodes: [],
            newVersion: currentTree.version + 1,
          };
    }

    // 4.2 Refinement Fallback: Sanitize diff to ensure no mastered node is ever removed
    const sanitizedDiff = sanitizeRefinementDiff(diff, currentTree);

    const removedSet = new Set(sanitizedDiff.removedNodeIds);
    let updatedNodes = currentTree.nodes.filter((n) => !removedSet.has(n.id));

    for (const modNode of sanitizedDiff.modifiedNodes) {
      const idx = updatedNodes.findIndex((n) => n.id === modNode.id);
      if (idx >= 0) {
        updatedNodes[idx] = modNode;
      }
    }

    updatedNodes.push(...sanitizedDiff.addedNodes);

    currentTree.nodes = updatedNodes;
    currentTree.version = sanitizedDiff.newVersion;

    this.unlockPrerequisiteNodes(currentTree);

    return currentTree;
  }

  /**
   * 3.1 Step 11 Session End Reflection Workflow
   */
  public async handleEndSessionWorkflow(
    sessionId: string,
    learnerState: LearnerState,
    recentLogs: AgentLog[]
  ): Promise<{ summary: SessionSummary; learnerState: LearnerState }> {
    try {
      const reflectionRes = await runReflectionAgent({
        sessionId,
        learnerId: learnerState.learnerId,
        recentLogs,
        masteryMap: learnerState.masteryMap,
        goalSummary: learnerState.currentGoal.specificObjective || learnerState.currentGoal.rawStatement,
      });

      learnerState.sessionHistory.push(reflectionRes.output);
      return { summary: reflectionRes.output, learnerState };
    } catch (err: any) {
      const fallbackSummary: SessionSummary = {
        sessionId,
        timestamp: new Date().toISOString(),
        nodesCovered: Object.keys(learnerState.masteryMap),
        masteryChanges: [],
        persistentMisconceptions: [],
        nextRecommendedFocus: 'Continue next available topic in curriculum',
      };
      learnerState.sessionHistory.push(fallbackSummary);
      return { summary: fallbackSummary, learnerState };
    }
  }

  private unlockPrerequisiteNodes(tree: TreeSkeleton): void {
    const masteredIds = new Set(
      tree.nodes.filter((n) => n.status === 'mastered').map((n) => n.id)
    );

    for (const node of tree.nodes) {
      if (node.status === 'locked') {
        const allPrereqsMastered = node.prerequisiteIds.every((prereqId) => masteredIds.has(prereqId));
        if (allPrereqsMastered) {
          node.status = 'available';
        }
      }
    }
  }
}
