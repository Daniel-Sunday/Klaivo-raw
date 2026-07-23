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
  validateRefinementDiff,
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

export type IntakeWorkflowResult =
  | { status: 'needs_clarification'; question: string; intentOutput: IntentAgentOutput }
  | { status: 'light_response'; intent: string; response: string }
  | { status: 'needs_more_context'; question: string; diagnosisOutput: DiagnosisAgentOutput }
  | { status: 'tree_created'; tree: TreeSkeleton; learnerState: LearnerState };

export class KlaivoOrchestrator {
  /**
   * 3.1 & 3.2 Primary Intake Workflow
   * Enforces:
   * Guardrail 1: Intent Confidence Gate (<0.6 halt)
   * Guardrail 2: Short-circuit non-tree intents (quick_answer, problem_solving, research)
   * Guardrail 3: Diagnosis Needs-More-Context Gate (halt before Drafter)
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
        question: 'Could you clarify whether you want a quick answer, a structured learning path, or help solving a specific problem?',
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
        question: diagnosisResult.output.clarifyingQuestion || 'Could you provide more specific details about your end goal?',
        diagnosisOutput: diagnosisResult.output,
      };
    }

    // Update LearnerState currentGoal with validated objective
    learnerState.currentGoal = diagnosisResult.output.currentGoal;

    // Step 3: Curriculum Drafter
    const treeId = `tree_${Date.now()}`;
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

    // Step 4: Curriculum Verifier
    const verifierResult = await runCurriculumVerifier({
      skeleton: drafterResult.output,
    });

    return {
      status: 'tree_created',
      tree: verifierResult.output,
      learnerState,
    };
  }

  /**
   * 3.4 Lazy Loading Node Content Workflow
   * Enforces: Content is generated ONLY on demand when learner opens node, then cached.
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

    // Return cached content if present
    if (node.content) {
      return node.content;
    }

    const confusionFlags = learnerState.masteryMap[nodeId]?.confusionFlags || [];
    const teachingResult = await runTeachingAgent({
      learnerId: learnerState.learnerId,
      node,
      vocabularyLevel: learnerState.vocabularyLevel,
      confusionFlags,
    });

    // Cache content on node
    node.content = teachingResult.output;
    return teachingResult.output;
  }

  /**
   * 3.1 Step 8-9 Node Assessment & Unconditional Prerequisite Unlocking Workflow
   * Enforces:
   * Guardrail: Unconditional Prerequisite Unlocking after ANY state update to masteryMap.
   */
  public async handleNodeAssessmentWorkflow(
    tree: TreeSkeleton,
    nodeId: string,
    learnerResponse: string,
    learnerState: LearnerState
  ): Promise<{ assessmentResult: AssessmentResult; updatedState: LearnerState; tree: TreeSkeleton }> {
    const node = tree.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Orchestration error: Node "${nodeId}" not found in tree "${tree.treeId}".`);
    }

    const priorMastery = learnerState.masteryMap[nodeId] || null;
    const assessmentRes = await runAssessmentAgent({
      learnerId: learnerState.learnerId,
      node,
      learnerResponse,
      priorMastery,
    });

    // Validate assessment result
    const validatedAssessment = validateAssessmentResult(assessmentRes.output, tree);

    // Apply Memory Update
    const { updatedState } = runMemoryUpdateAgent(validatedAssessment, learnerState);

    // Update node mastery score and status
    const currentMastery = updatedState.masteryMap[nodeId]?.level || 0.0;
    node.masteryScore = currentMastery;

    if (currentMastery >= 0.8 || validatedAssessment.readyToAdvance) {
      node.status = 'mastered';
    } else {
      node.status = 'in_progress';
    }

    // UNCONDITIONAL PREREQUISITE UNLOCKING GATE:
    // Check all currently locked nodes and unlock any node whose prerequisites are now all 'mastered'.
    this.unlockPrerequisiteNodes(tree);

    return {
      assessmentResult: validatedAssessment,
      updatedState,
      tree,
    };
  }

  /**
   * 3.3 Refinement Workflow
   * Enforces: Hard code validation preventing removal of mastered nodes.
   */
  public async handleRefinementWorkflow(
    request: RefinementRequest,
    currentTree: TreeSkeleton,
    learnerState: LearnerState,
    mockOutput?: Partial<RefinementDiff>
  ): Promise<TreeSkeleton> {
    const refinementRes = await runRefinementAgent(
      {
        request,
        currentTree,
        masteryMap: learnerState.masteryMap,
      },
      mockOutput
    );

    const diff = refinementRes.output;

    // Validate diff via validateRefinementDiff
    validateRefinementDiff(diff, currentTree);

    // Apply diff
    const removedSet = new Set(diff.removedNodeIds);
    let updatedNodes = currentTree.nodes.filter((n) => !removedSet.has(n.id));

    // Update modified nodes
    for (const modNode of diff.modifiedNodes) {
      const idx = updatedNodes.findIndex((n) => n.id === modNode.id);
      if (idx >= 0) {
        updatedNodes[idx] = modNode;
      }
    }

    // Add new nodes
    updatedNodes.push(...diff.addedNodes);

    currentTree.nodes = updatedNodes;
    currentTree.version = diff.newVersion;

    // Re-evaluate prerequisite unlocking after tree modification
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
    const reflectionRes = await runReflectionAgent({
      sessionId,
      learnerId: learnerState.learnerId,
      recentLogs,
      masteryMap: learnerState.masteryMap,
      goalSummary: learnerState.currentGoal.specificObjective || learnerState.currentGoal.rawStatement,
    });

    learnerState.sessionHistory.push(reflectionRes.output);
    return { summary: reflectionRes.output, learnerState };
  }

  /**
   * Helper: Unconditional Prerequisite Unlocking Engine
   */
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
