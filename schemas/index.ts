import { z } from 'zod';

// ==========================================
// 1.1 LearnerState & SessionSummary Schemas
// ==========================================

export const VocabularyLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type VocabularyLevel = z.infer<typeof VocabularyLevelSchema>;

export const LearnerGoalSchema = z.object({
  rawStatement: z.string().min(1, "rawStatement cannot be empty"),
  domain: z.string().min(1, "domain cannot be empty"),
  specificObjective: z.string().min(1, "specificObjective cannot be empty"),
  contextArtifacts: z.array(z.string()).default([]),
});
export type LearnerGoal = z.infer<typeof LearnerGoalSchema>;

export const MasteryMapEntrySchema = z.object({
  level: z.number().min(0.0).max(1.0),
  lastAssessed: z.string(), // ISO timestamp
  confusionFlags: z.array(z.string()).default([]),
});
export type MasteryMapEntry = z.infer<typeof MasteryMapEntrySchema>;

export const MasteryChangeSchema = z.object({
  nodeId: z.string(),
  delta: z.number(),
});
export type MasteryChange = z.infer<typeof MasteryChangeSchema>;

export const SessionSummarySchema = z.object({
  sessionId: z.string(),
  timestamp: z.string(),
  nodesCovered: z.array(z.string()).default([]),
  masteryChanges: z.array(MasteryChangeSchema).default([]),
  persistentMisconceptions: z.array(z.string()).default([]),
  nextRecommendedFocus: z.string().min(1, "nextRecommendedFocus required"),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export const ChatMessageEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type ChatMessageEntry = z.infer<typeof ChatMessageEntrySchema>;

export const LearnerStateSchema = z.object({
  learnerId: z.string().min(1, "learnerId required"),
  currentGoal: LearnerGoalSchema,
  vocabularyLevel: VocabularyLevelSchema,
  masteryMap: z.record(z.string(), MasteryMapEntrySchema),
  sessionHistory: z.array(SessionSummarySchema).default([]),
  chatHistory: z.array(ChatMessageEntrySchema).optional(),
});
export type LearnerState = z.infer<typeof LearnerStateSchema>;

// ==========================================
// 1.3 NodeContent Schema (lazy node content)
// ==========================================

export const NodeContentSchema = z.object({
  nodeId: z.string().min(1, "nodeId required"),
  explanation: z.string().min(1, "explanation required"),
  examples: z.array(z.string()).default([]),
  generatedAt: z.string(),
  vocabularyLevelUsed: z.string(),
});
export type NodeContent = z.infer<typeof NodeContentSchema>;

// ==========================================
// 1.2 TreeNode & TreeSkeleton Schemas
// ==========================================

export const NodeStatusSchema = z.enum(["locked", "available", "in_progress", "mastered"]);
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const TreeNodeSchema = z.object({
  id: z.string().min(1, "node ID required"),
  title: z.string().min(1, "title required"),
  oneLineSummary: z.string().min(1, "oneLineSummary required"),
  goalRelevance: z.string().min(1, "goalRelevance is REQUIRED per spec non-negotiables"),
  prerequisiteIds: z.array(z.string()).optional().default([]),
  status: NodeStatusSchema.optional().default("locked"),
  content: NodeContentSchema.nullable().optional().default(null),
  masteryScore: z.number().min(0.0).max(1.0).optional().default(0.0),
  depth: z.number().int().min(0).optional().default(0),
});
export type TreeNode = z.infer<typeof TreeNodeSchema>;

export const TreeEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["prerequisite", "related"]).optional(),
});
export type TreeEdge = z.infer<typeof TreeEdgeSchema>;

export const VerificationStatusSchema = z.enum(["unverified", "verified", "verified_with_gaps"]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const TreeSkeletonSchema = z.object({
  treeId: z.string().min(1, "treeId required"),
  learnerId: z.string().min(1, "learnerId required"),
  goalSummary: z.string().min(1, "goalSummary required"),
  nodes: z.array(TreeNodeSchema),
  edges: z.array(TreeEdgeSchema),
  verificationStatus: VerificationStatusSchema.default("unverified"),
  verificationNotes: z.array(z.string()).default([]),
  version: z.number().int().positive().default(1),
});
export type TreeSkeleton = z.infer<typeof TreeSkeletonSchema>;

// ==========================================
// 1.4 AssessmentResult Schema & Validation
// ==========================================

export const AssessmentResultSchema = z.object({
  nodeId: z.string().min(1, "nodeId required"),
  masteryDelta: z.number().min(-1.0).max(1.0, "masteryDelta must be between -1.0 and 1.0"),
  detectedMisconceptions: z.array(z.string()).default([]),
  readyToAdvance: z.boolean(),
  reasoning: z.string().min(1, "reasoning required for audit trail"),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

export function validateAssessmentResult(data: unknown, currentTree?: TreeSkeleton): AssessmentResult {
  const result = AssessmentResultSchema.parse(data);

  if (currentTree) {
    const exists = currentTree.nodes.some((node) => node.id === result.nodeId);
    if (!exists) {
      throw new Error(`AssessmentResult validation failed: nodeId "${result.nodeId}" does not exist in current tree "${currentTree.treeId}"`);
    }
  }

  return result;
}

// ==========================================
// 1.5 RefinementRequest & RefinementDiff
// ==========================================

export const RefinementRequestSchema = z.object({
  treeId: z.string().min(1, "treeId required"),
  learnerFeedback: z.string().min(1, "learnerFeedback required"),
  targetNodeId: z.string().nullable().default(null),
});
export type RefinementRequest = z.infer<typeof RefinementRequestSchema>;

export const RefinementDiffSchema = z.object({
  treeId: z.string().min(1, "treeId required"),
  addedNodes: z.array(TreeNodeSchema).default([]),
  removedNodeIds: z.array(z.string()).default([]),
  modifiedNodes: z.array(TreeNodeSchema).default([]),
  newVersion: z.number().int().positive(),
});
export type RefinementDiff = z.infer<typeof RefinementDiffSchema>;

export function validateRefinementDiff(diffData: unknown, currentTree: TreeSkeleton): RefinementDiff {
  const diff = RefinementDiffSchema.parse(diffData);

  const masteredNodeIds = new Set(
    currentTree.nodes
      .filter((n) => n.status === "mastered")
      .map((n) => n.id)
  );

  const illegalRemovals = diff.removedNodeIds.filter((id) => masteredNodeIds.has(id));
  if (illegalRemovals.length > 0) {
    throw new Error(
      `RefinementDiff validation failed: Cannot remove mastered node(s) [${illegalRemovals.join(", ")}]. Mastered nodes must be preserved.`
    );
  }

  return diff;
}

// ==========================================
// 1.6 AgentLog Schema (Audit Trail)
// ==========================================

export const AgentLogSchema = z.object({
  logId: z.string().min(1, "logId required"),
  agentName: z.string().min(1, "agentName required"),
  learnerId: z.string().min(1, "learnerId required"),
  timestamp: z.string(),
  input: z.unknown(),
  output: z.unknown(),
  reasoning: z.string().nullable().default(null),
  validationPassed: z.boolean(),
  retryCount: z.number().int().min(0).default(0),
});
export type AgentLog = z.infer<typeof AgentLogSchema>;

// ==========================================
// 1.7 Intake Diagnosis Slot-Filling Schemas
// ==========================================

export const IntakeSlotKeySchema = z.enum([
  'targetSubject',
  'targetLevelOrOutcome',
  'priorKnowledge',
  'practicalFocus',
]);
export type IntakeSlotKey = z.infer<typeof IntakeSlotKeySchema>;

export const ProposedSlotEntrySchema = z.object({
  value: z.string().min(1, "slot value cannot be empty"),
  isCorrection: z.boolean().default(false),
  reasoning: z.string().optional(),
});
export type ProposedSlotEntry = z.infer<typeof ProposedSlotEntrySchema>;

export const BlockedOverwriteEntrySchema = z.object({
  slotKey: z.string(),
  attemptedValue: z.string(),
  existingValue: z.string(),
  timestamp: z.string(),
});
export type BlockedOverwriteEntry = z.infer<typeof BlockedOverwriteEntrySchema>;

export const DiagnosisSlotStateSchema = z.object({
  slotsResolved: z.record(z.string(), z.string()).default({}),
  slotsStillNeeded: z.array(z.string()).default([
    'targetSubject',
    'targetLevelOrOutcome',
    'priorKnowledge',
  ]),
  roundCount: z.number().int().min(0).default(0),
  forceProceedTriggered: z.boolean().default(false),
  blockedOverwrites: z.array(BlockedOverwriteEntrySchema).default([]),
  // Set once, on the turn where Intent Agent successfully classifies the session.
  // Follow-up turns reuse this instead of re-running Intent Agent on an isolated
  // fragment of text, which produced false low-confidence "needs_clarification" loops.
  lockedIntent: z.string().optional(),
});
export type DiagnosisSlotState = z.infer<typeof DiagnosisSlotStateSchema>;

export const DiagnosisAgentOutputSchema = z.object({
  needsMoreContext: z.boolean(),
  userRequestsProceed: z.boolean().default(false),
  clarifyingQuestion: z.string().nullable().optional(),
  proposedSlots: z.record(z.string(), ProposedSlotEntrySchema).default({}),
  unfilledSlotKeys: z.array(z.string()).default([]),
  reasoning: z.string().min(1, "reasoning required"),
  currentGoal: LearnerGoalSchema.default({
    rawStatement: "Learning Session",
    domain: "General",
    specificObjective: "Master core concepts",
    contextArtifacts: [],
  }),
  intent: z.string().optional(),
});
export type DiagnosisAgentOutput = z.infer<typeof DiagnosisAgentOutputSchema>;

export interface SlotUpdateResult {
  updatedState: DiagnosisSlotState;
  finalNeedsMoreContext: boolean;
  finalClarifyingQuestion?: string;
  synthesizedGoal: string;
  newBlockedOverwrites: BlockedOverwriteEntry[];
}

export function processSlotUpdate(
  currentState: DiagnosisSlotState,
  proposedSlots: Record<string, ProposedSlotEntry>,
  userRequestsProceed: boolean,
  modelNeedsMoreContext: boolean,
  modelClarifyingQuestion?: string | null
): SlotUpdateResult {
  const newRoundCount = currentState.roundCount + 1;
  const newBlockedOverwrites: BlockedOverwriteEntry[] = [];
  const updatedSlotsResolved = { ...currentState.slotsResolved };

  const isForceProceed = currentState.forceProceedTriggered || userRequestsProceed;

  // 1. Overwrite protection logic
  for (const [key, proposedEntry] of Object.entries(proposedSlots || {})) {
    const existingValue = updatedSlotsResolved[key];

    if (existingValue && existingValue !== proposedEntry.value) {
      if (!proposedEntry.isCorrection) {
        const blockedEntry: BlockedOverwriteEntry = {
          slotKey: key,
          attemptedValue: proposedEntry.value,
          existingValue,
          timestamp: new Date().toISOString(),
        };
        newBlockedOverwrites.push(blockedEntry);
        console.warn(
          `[SlotGuard] Blocked unauthorized overwrite for slot "${key}". Preserved: "${existingValue}", Rejected: "${proposedEntry.value}"`
        );
        continue;
      }
    }

    if (proposedEntry.value && proposedEntry.value.trim().length > 0) {
      updatedSlotsResolved[key] = proposedEntry.value.trim();
    }
  }

  const hasSubject = Boolean(updatedSlotsResolved.targetSubject && updatedSlotsResolved.targetSubject.trim().length > 0);
  const remainingNeeded = ['targetSubject', 'targetLevelOrOutcome'].filter((k) => !updatedSlotsResolved[k]);

  // 2. Instant Tree Generation Policy & 1-Round Hard Cap
  const maxRoundsReached = newRoundCount >= 1;
  const shouldFinalize = hasSubject || maxRoundsReached || isForceProceed || !modelNeedsMoreContext;

  const finalNeedsMoreContext = !shouldFinalize;
  const finalClarifyingQuestion = finalNeedsMoreContext
    ? modelClarifyingQuestion || `What specific topic or objective would you like to master?`
    : undefined;

  // 3. Build objective strictly from validated slots
  const subject = updatedSlotsResolved.targetSubject || 'Target Subject';
  const outcome = updatedSlotsResolved.targetLevelOrOutcome ? ` for ${updatedSlotsResolved.targetLevelOrOutcome}` : '';
  const prior = updatedSlotsResolved.priorKnowledge ? ` (Learner baseline: ${updatedSlotsResolved.priorKnowledge})` : '';
  const focus = updatedSlotsResolved.practicalFocus ? ` Focus: ${updatedSlotsResolved.practicalFocus}.` : '';
  const synthesizedGoal = `Master ${subject}${outcome}.${focus}${prior}`.trim();

  const accumulatedBlockedOverwrites = [
    ...currentState.blockedOverwrites,
    ...newBlockedOverwrites,
  ];

  return {
    updatedState: {
      slotsResolved: updatedSlotsResolved,
      slotsStillNeeded: finalNeedsMoreContext ? remainingNeeded : [],
      roundCount: newRoundCount,
      forceProceedTriggered: isForceProceed,
      blockedOverwrites: accumulatedBlockedOverwrites,
    },
    finalNeedsMoreContext,
    finalClarifyingQuestion,
    synthesizedGoal,
    newBlockedOverwrites,
  };
}

