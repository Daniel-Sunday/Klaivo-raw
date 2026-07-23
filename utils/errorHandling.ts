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

  const nodes: TreeNode[] = [
    {
      id: "node_orientation_1",
      title: `${currentGoal.domain}: Overview & Foundations`,
      oneLineSummary: `Broad orientation covering essential principles of ${currentGoal.domain}`,
      goalRelevance: `Establishes preliminary context required for ${currentGoal.specificObjective}`,
      prerequisiteIds: [],
      status: "available",
      content: null,
      masteryScore: 0.0,
      depth: 0,
    },
    {
      id: "node_orientation_2",
      title: `${currentGoal.domain}: Core Methodology`,
      oneLineSummary: "Key tools, methods, and practical frameworks",
      goalRelevance: `Introduces fundamental techniques required for ${currentGoal.specificObjective}`,
      prerequisiteIds: ["node_orientation_1"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 1,
    },
    {
      id: "node_orientation_3",
      title: `${currentGoal.domain}: Practical Application`,
      oneLineSummary: "Initial hands-on problem solving and exercises",
      goalRelevance: `Enables basic execution towards ${currentGoal.specificObjective}`,
      prerequisiteIds: ["node_orientation_2"],
      status: "locked",
      content: null,
      masteryScore: 0.0,
      depth: 2,
    },
  ];

  const skeleton: TreeSkeleton = {
    treeId,
    learnerId,
    goalSummary: currentGoal.specificObjective || currentGoal.rawStatement,
    nodes,
    edges: [
      { from: "node_orientation_1", to: "node_orientation_2" },
      { from: "node_orientation_2", to: "node_orientation_3" },
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
