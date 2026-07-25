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
  DiagnosisSlotState,
  processSlotUpdate,
  validateAssessmentResult,
} from '../schemas';
import { getModelProvider } from '../providers/modelProvider';
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

export interface AgentProgressEvent {
  agent: 'IntentAgent' | 'DiagnosisAgent' | 'CurriculumDrafter' | 'CurriculumVerifier';
  status: 'started' | 'thought' | 'done' | 'error';
  thought?: string;
  payload?: any;
}

export type IntakeWorkflowResult =
  | { status: 'needs_clarification'; question: string; intentOutput: IntentAgentOutput; slotState?: DiagnosisSlotState }
  | { status: 'light_response'; intent: string; response: string; slotState?: DiagnosisSlotState }
  | { status: 'needs_more_context'; question: string; diagnosisOutput: DiagnosisAgentOutput; slotState: DiagnosisSlotState }
  | { status: 'tree_created'; tree: TreeSkeleton; learnerState: LearnerState; slotState: DiagnosisSlotState; isFallback?: boolean };

export type AssessmentWorkflowResult =
  | { status: 'assessment_success'; assessmentResult: AssessmentResult; updatedState: LearnerState; tree: TreeSkeleton }
  | { status: 'assessment_rejected'; message: string; currentState: LearnerState };

async function runStageWithTimeoutAndRetry<T>(
  stageName: string,
  fn: () => Promise<T>,
  timeoutMs: number = 15000,
  onProgress?: (event: AgentProgressEvent) => void
): Promise<T> {
  const executeAttempt = () => {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${stageName} timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      fn()
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  try {
    return await executeAttempt();
  } catch (firstErr: any) {
    console.warn(`[Orchestrator] ${stageName} failed on first attempt: ${firstErr?.message || firstErr}. Retrying once...`);
    if (onProgress) {
      onProgress({
        agent: stageName as any,
        status: 'error',
        thought: `${stageName} delayed — retrying stage...`,
      });
    }
    return await executeAttempt();
  }
}

export class KlaivoOrchestrator {
  /**
   * 3.1 & 3.2 Primary Intake Workflow with Phase 4 Error Fallbacks & Explicit Slot-Filling
   * Enforces:
   * Guardrail 1: Intent Confidence Gate (<0.6 halt)
   * Guardrail 2: Short-circuit non-tree intents (quick_answer, problem_solving, research)
   * Guardrail 3: Slot-filling validation, Overwrite Protection, and 3-Round Hard Cap
   * Fallback: Curriculum Drafter exhaustion -> Minimal starter skeleton (3-5 nodes)
   */
  public async handleIntakeWorkflow(
    userMessage: string,
    learnerState: LearnerState,
    contextArtifacts: string[] = [],
    slotStateOrMock?: DiagnosisSlotState | {
      intent?: Partial<IntentAgentOutput>;
      diagnosis?: Partial<DiagnosisAgentOutput>;
      skeleton?: Partial<TreeSkeleton>;
    },
    mockOverridesParam?: {
      intent?: Partial<IntentAgentOutput>;
      diagnosis?: Partial<DiagnosisAgentOutput>;
      skeleton?: Partial<TreeSkeleton>;
    },
    onProgress?: (event: AgentProgressEvent) => void
  ): Promise<IntakeWorkflowResult> {
    let slotState: DiagnosisSlotState | undefined = undefined;
    let mockOverrides = mockOverridesParam;

    if (slotStateOrMock) {
      if ('slotsResolved' in slotStateOrMock || 'roundCount' in slotStateOrMock) {
        slotState = slotStateOrMock as DiagnosisSlotState;
      } else {
        mockOverrides = slotStateOrMock as any;
      }
    }

    const currentSlotState: DiagnosisSlotState = slotState || {
      slotsResolved: {},
      slotsStillNeeded: ['targetSubject', 'targetLevelOrOutcome', 'priorKnowledge'],
      roundCount: 0,
      forceProceedTriggered: false,
      blockedOverwrites: [],
    };

    // HARD GATE: Block tree drafting if tree is already created for session
    if (currentSlotState.treeAlreadyCreated) {
      console.log('[Orchestrator] Hard Gate: Tree already created for this session — blocking DiagnosisAgent & CurriculumDrafter.');
      let explanationText: string;
      try {
        const provider = getModelProvider();
        explanationText = await provider.generateText(
          `User Message: "${userMessage}"`,
          `You are Klaivo's AI tutor. Answer the user's question directly without drafting a new curriculum tree.`
        );
      } catch (err) {
        explanationText = "Sorry, I couldn't generate a response — try asking again.";
      }
      return {
        status: 'light_response',
        intent: 'quick_answer',
        response: explanationText,
        slotState: currentSlotState,
      };
    }

    // Step 1: Intent Agent
    let intent: string;

    if (currentSlotState.lockedIntent) {
      intent = currentSlotState.lockedIntent;
      console.log(`[Orchestrator] Using locked intent: ${intent} (skipping re-classification)`);
    } else {
      if (onProgress) {
        onProgress({ agent: 'IntentAgent', status: 'started', thought: 'Classifying learning intent...' });
      }

      const intentResult = await runStageWithTimeoutAndRetry(
        'IntentAgent',
        () => runIntentAgent({ rawMessage: userMessage, learnerState }, mockOverrides?.intent),
        15000,
        onProgress
      );

      console.log(
        `[Orchestrator] Fresh intent classification: ${intentResult.output.intent} ` +
        `(confidence: ${intentResult.output.confidence})`
      );

      if (onProgress) {
        onProgress({ agent: 'IntentAgent', status: 'done', thought: `Intent classified: ${intentResult.output.intent}` });
      }

      // Guardrail 1: Intent Confidence Gate (first turn only)
      if (intentResult.output.confidence < 0.6 || intentResult.output.needsClarification) {
        console.log('[Orchestrator] Confidence gate tripped — returning needs_clarification');
        return {
          status: 'needs_clarification',
          question: sanitizeUserErrorMessage('IntentAgent', 'Low confidence'),
          intentOutput: intentResult.output,
          slotState: currentSlotState,
        };
      }

      intent = intentResult.output.intent;

      // Guardrail 2: Short-Circuit Non-Tree Intents (first turn only)
      if (intent === 'quick_answer' || intent === 'problem_solving' || intent === 'research') {
        let lightResponseText: string;
        try {
          const provider = getModelProvider();
          const systemInstruction = `You are Klaivo's AI tutor assisting a learner with a direct request (Intent: ${intent}).
Provide a direct, thorough, clear, and helpful explanation answering their question or solving their problem directly without building a curriculum tree.
Use Markdown formatting for structure.`;
          const userPrompt = `Learner message: "${userMessage}"
Learner vocabulary level: ${learnerState.vocabularyLevel || 'intermediate'}`;
          lightResponseText = await provider.generateText(userPrompt, systemInstruction);
        } catch (err: any) {
          console.error(`[Orchestrator] Direct ${intent} response LLM generation failed:`, err);
          lightResponseText = "Sorry, I couldn't generate a response — try asking again.";
        }

        return {
          status: 'light_response',
          intent,
          response: lightResponseText,
          slotState: currentSlotState,
        };
      }

      // Lock it in so subsequent turns skip re-classification entirely.
      currentSlotState.lockedIntent = intent;
      console.log(`[Orchestrator] Locking intent for session: ${intent}`);
    }

    const conversationHistory = learnerState.chatHistory && learnerState.chatHistory.length > 0
      ? learnerState.chatHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      : [userMessage];

    // Step 2: Diagnosis Agent with explicit Slot State Context & Full Conversation Memory
    if (onProgress) {
      onProgress({ agent: 'DiagnosisAgent', status: 'started', thought: 'Analyzing learner context & goals...' });
    }

    const diagnosisResult = await runStageWithTimeoutAndRetry(
      'DiagnosisAgent',
      () => runDiagnosisAgent(
        {
          learnerId: learnerState.learnerId,
          rawGoalStatement: userMessage,
          conversationHistory,
          currentSlotState,
          contextArtifacts,
          intentClassification: intent,
        },
        mockOverrides?.diagnosis
      ),
      15000,
      onProgress
    );

    if (onProgress) {
      onProgress({ agent: 'DiagnosisAgent', status: 'done', thought: 'Synthesized learning goal objective.' });
    }

    // Step 2b: Code-side Slot Filling Validation, Overwrite Protection, & Hard Cap
    const slotUpdate = processSlotUpdate(
      currentSlotState,
      diagnosisResult.output.proposedSlots || {},
      diagnosisResult.output.userRequestsProceed || false,
      diagnosisResult.output.needsMoreContext ?? false,
      diagnosisResult.output.clarifyingQuestion
    );

    // Guardrail 3: Diagnosis Needs-More-Context Gate (unless 3 rounds or force proceed met)
    if (slotUpdate.finalNeedsMoreContext) {
      return {
        status: 'needs_more_context',
        question: slotUpdate.finalClarifyingQuestion || sanitizeUserErrorMessage('DiagnosisAgent', 'Vague goal'),
        diagnosisOutput: diagnosisResult.output,
        slotState: slotUpdate.updatedState,
      };
    }

    // Update LearnerState currentGoal with CODE-SYNTHESIZED objective from validated slots
    learnerState.currentGoal = {
      rawStatement: learnerState.currentGoal.rawStatement || userMessage,
      domain: slotUpdate.updatedState.slotsResolved.targetSubject || 'General',
      specificObjective: slotUpdate.synthesizedGoal,
      contextArtifacts,
    };

    // Step 3: Curriculum Drafter with Phase 4 Fallback
    const treeId = `tree_${Date.now()}`;
    let skeleton: TreeSkeleton;
    let isFallback = false;

    if (onProgress) {
      onProgress({ agent: 'CurriculumDrafter', status: 'started', thought: 'Drafting prerequisite concept nodes...' });
    }

    try {
      const drafterResult = await runStageWithTimeoutAndRetry(
        'CurriculumDrafter',
        () => runCurriculumDrafter(
          {
            treeId,
            learnerId: learnerState.learnerId,
            currentGoal: learnerState.currentGoal,
            vocabularyLevel: learnerState.vocabularyLevel,
            masteryMap: learnerState.masteryMap,
          },
          mockOverrides?.skeleton
        ),
        15000,
        onProgress
      );
      skeleton = drafterResult.output;
      if (onProgress) {
        onProgress({ agent: 'CurriculumDrafter', status: 'done', thought: 'Draft curriculum generated.', payload: { skeleton } });
      }
    } catch (drafterErr: any) {
      skeleton = createStarterSkeleton(learnerState.currentGoal, learnerState.learnerId);
      isFallback = true;
      if (onProgress) {
        onProgress({ agent: 'CurriculumDrafter', status: 'error', thought: 'Drafting timeout — generated minimal starter skeleton.', payload: { skeleton } });
      }
    }

    // Step 4: Curriculum Verifier (Non-blocking fallback)
    if (onProgress) {
      onProgress({ agent: 'CurriculumVerifier', status: 'started', thought: 'Verifying curriculum against domain rubrics...' });
    }

    try {
      const verifierResult = await runStageWithTimeoutAndRetry(
        'CurriculumVerifier',
        () => runCurriculumVerifier({ skeleton }),
        15000,
        onProgress
      );
      skeleton = verifierResult.output;
      if (onProgress) {
        onProgress({ agent: 'CurriculumVerifier', status: 'done', thought: 'Verified curriculum against domain rubrics.', payload: { skeleton } });
      }
    } catch (verifierErr: any) {
      skeleton.verificationStatus = 'verified_with_gaps';
      skeleton.verificationNotes.push('Verification skipped due to reference search unavailability.');
      if (onProgress) {
        onProgress({ agent: 'CurriculumVerifier', status: 'error', thought: 'Verifier timeout — showing best draft with unverified markers.', payload: { skeleton } });
      }
    }

    slotUpdate.updatedState.treeAlreadyCreated = true;

    return {
      status: 'tree_created',
      tree: skeleton,
      learnerState,
      slotState: slotUpdate.updatedState,
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
