import {
  TreeSkeleton,
  TreeNode,
  RefinementDiff,
  LearnerGoal,
  TreeSkeletonSchema,
} from '../schemas';

/**
 * 4.2 Per-Agent Fallback: Curriculum Drafter Starter Skeleton
 * Produces a minimal 3-5 node "starter skeleton" (broad orientation nodes only)
 * when Curriculum Drafter exhausts retries or fails validation repeatedly.
 */
export function createStarterSkeleton(currentGoal: LearnerGoal, learnerId: string): TreeSkeleton {
  const treeId = `tree_fallback_${Date.now()}`;
  const topic = currentGoal.specificObjective || currentGoal.domain || "Target Subject";

  const nodes: TreeNode[] = [
    {
      id: "node_starter_1",
      title: `${topic}: Core Syntax & Mental Model`,
      oneLineSummary: `Essential prerequisite concepts and setup for ${topic}`,
      goalRelevance: `Establishes fundamental building blocks required for ${topic}`,
      prerequisiteIds: [],
      status: "available",
      content: null,
      masteryScore: 0.0,
      depth: 0,
      phaseIndex: 0,
      chunkId: "chunk_phase_0",
      isCurrentActiveChunk: true,
      estimatedTimeMinutes: 25,
    },
    {
      id: "node_starter_2",
      title: `${topic}: Internal Mechanics & Data Structures`,
      oneLineSummary: `Core execution patterns, memory model, and key mechanisms`,
      goalRelevance: `Underpins reliable execution when building with ${topic}`,
      prerequisiteIds: ["node_starter_1"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 1,
      phaseIndex: 0,
      chunkId: "chunk_phase_0",
      isCurrentActiveChunk: true,
      estimatedTimeMinutes: 30,
    },
    {
      id: "node_starter_3",
      title: `${topic}: Practical Control Flow & API Pipeline`,
      oneLineSummary: "Hands-on workflow implementation and integration patterns",
      goalRelevance: `Enables functional implementation towards ${topic}`,
      prerequisiteIds: ["node_starter_2"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 2,
      phaseIndex: 1,
      chunkId: "chunk_phase_1",
      isCurrentActiveChunk: false,
      estimatedTimeMinutes: 35,
    },
    {
      id: "node_starter_4",
      title: `${topic}: Error Handling & Edge Cases`,
      oneLineSummary: "Diagnostic techniques, fault tolerance, and edge case handling",
      goalRelevance: `Ensures robust, bug-free execution in ${topic}`,
      prerequisiteIds: ["node_starter_3"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 2,
      phaseIndex: 1,
      chunkId: "chunk_phase_1",
      isCurrentActiveChunk: false,
      estimatedTimeMinutes: 35,
    },
    {
      id: "node_starter_5",
      title: `${topic}: Performance & State Optimization`,
      oneLineSummary: "Optimization patterns, resource management, and scaling",
      goalRelevance: `Drives production efficiency for ${topic}`,
      prerequisiteIds: ["node_starter_4"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 3,
      phaseIndex: 2,
      chunkId: "chunk_phase_2",
      isCurrentActiveChunk: false,
      estimatedTimeMinutes: 40,
    },
    {
      id: "node_starter_6",
      title: `${topic}: Production Deployment & Capstone Integration`,
      oneLineSummary: "Real-world project synthesis, deployment, and validation",
      goalRelevance: `Finalizes complete practical mastery of ${topic}`,
      prerequisiteIds: ["node_starter_5"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 4,
      phaseIndex: 2,
      chunkId: "chunk_phase_2",
      isCurrentActiveChunk: false,
      estimatedTimeMinutes: 45,
    },
  ];

  const skeleton: TreeSkeleton = {
    treeId,
    learnerId,
    goalSummary: currentGoal.specificObjective || currentGoal.rawStatement,
    nodes,
    edges: [
      { from: "node_starter_1", to: "node_starter_2" },
      { from: "node_starter_2", to: "node_starter_3" },
      { from: "node_starter_3", to: "node_starter_4" },
      { from: "node_starter_4", to: "node_starter_5" },
      { from: "node_starter_5", to: "node_starter_6" },
    ],
    verificationStatus: "unverified",
    verificationNotes: ["Fallback starter skeleton generated due to drafter retry exhaustion."],
    version: 1,
  };

  return TreeSkeletonSchema.parse(skeleton);
}

/**
 * 4.2 Per-Agent Fallback: Refinement Diff Sanitizer
 * Strips any illegal removals of mastered nodes from a diff if a model retry fails.
 */
export function sanitizeRefinementDiff(diff: RefinementDiff, currentTree: TreeSkeleton): RefinementDiff {
  const masteredNodeIds = new Set(
    currentTree.nodes
      .filter((n) => n.status === "mastered")
      .map((n) => n.id)
  );

  const safeRemovedNodeIds = diff.removedNodeIds.filter((id) => !masteredNodeIds.has(id));

  return {
    ...diff,
    removedNodeIds: safeRemovedNodeIds,
  };
}

/**
 * 4.4 User-Facing Error Language Sanitizer
 * Translates internal agent errors into soft, honest progress notes or questions.
 * NEVER exposes stack traces, raw model refusals, or JSON parse errors to the learner.
 */
export function sanitizeUserErrorMessage(agentName: string, rawError: string): string {
  switch (agentName) {
    case 'IntentAgent':
      return 'Could you clarify whether you want a quick answer, a structured learning path, or help solving a specific problem?';
    case 'DiagnosisAgent':
      return 'Could you provide a bit more specific detail about your primary target outcome for this topic?';
    case 'CurriculumDrafter':
      return 'Starting with core foundational topics while we prepare the complete learning path details.';
    case 'TeachingAgent':
      return 'This section needs a brief moment to prepare — continuing with the core concepts for now.';
    case 'AssessmentAgent':
      return 'We could not process your answer cleanly. Please submit your response again.';
    case 'RefinementAgent':
      return 'Updated the learning path structure while preserving all your completed topics.';
    default:
      return 'Continuing with the next available step in your learning path.';
  }
}
