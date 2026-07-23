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

export const LearnerStateSchema = z.object({
  learnerId: z.string().min(1, "learnerId required"),
  currentGoal: LearnerGoalSchema,
  vocabularyLevel: VocabularyLevelSchema,
  masteryMap: z.record(z.string(), MasteryMapEntrySchema),
  sessionHistory: z.array(SessionSummarySchema).default([]),
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
  prerequisiteIds: z.array(z.string()).default([]),
  status: NodeStatusSchema,
  content: NodeContentSchema.nullable().default(null),
  masteryScore: z.number().min(0.0).max(1.0).default(0.0),
  depth: z.number().int().min(0).default(0),
});
export type TreeNode = z.infer<typeof TreeNodeSchema>;

export const TreeEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
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
