import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import {
  LearnerGoal,
  VocabularyLevel,
  MasteryMapEntry,
  TreeSkeletonSchema,
  TreeSkeleton,
  TreeNode,
} from '../schemas';

export interface CurriculumDrafterInput {
  treeId: string;
  learnerId: string;
  currentGoal: LearnerGoal;
  vocabularyLevel: VocabularyLevel;
  masteryMap?: Record<string, MasteryMapEntry>;
}

export interface StructuralVerificationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Code-side Structural Verifier for DAG Knowledge Graph
 * Enforces non-linear branching, convergence, and edge density.
 */
export function verifyCurriculumStructure(nodes: TreeNode[]): StructuralVerificationResult {
  const errors: string[] = [];
  const n = nodes.length;
  const edgeCount = nodes.reduce((sum, node) => sum + (node.prerequisiteIds?.length || 0), 0);

  if (n > 3 && edgeCount <= n - 1) {
    errors.push(`Structure is a linear chain (edges=${edgeCount}, nodes=${n}). Reject and regenerate with branching.`);
  }

  const childCount: Record<string, number> = {};
  nodes.forEach((node) => {
    (node.prerequisiteIds || []).forEach((p) => {
      childCount[p] = (childCount[p] || 0) + 1;
    });
  });

  const branchingNodes = Object.values(childCount).filter((c) => c >= 2).length;
  if (n > 4 && branchingNodes === 0) {
    errors.push("No node has 2+ children — no branching detected. Reject.");
  }

  const convergingNodes = nodes.filter((node) => (node.prerequisiteIds?.length || 0) >= 2).length;
  if (n > 4 && convergingNodes === 0) {
    errors.push("No node has 2+ prerequisites — no convergence detected. Reject.");
  }

  return { valid: errors.length === 0, errors };
}

export async function runCurriculumDrafter(
  input: CurriculumDrafterInput,
  mockOutput?: Partial<TreeSkeleton>
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `# ROLE
You are the Curriculum Drafter Agent. You do not write flat lists. You build a knowledge graph — a directed acyclic graph (DAG) representing how concepts in this field genuinely relate to and depend on each other.

# YOUR SINGLE FAILURE MODE TO AVOID
Your most common failure is producing a shallow linear chain (A -> B -> C -> D) when the real structure of the field has branches, converging prerequisites, and parallel tracks. A straight line is almost never the correct shape for a real field of knowledge. If you catch yourself building a chain where every node has exactly one parent and one child, STOP — you are wrong. Real fields branch.

# STRUCTURAL REQUIREMENTS (all are mandatory, not optional)
1. Node count must be proportional to the actual scope of the field/goal:
   - Narrow single-concept goal ("understand photosynthesis"): 6-10 nodes minimum.
   - Syllabus-scale goal ("WAEC Organic Chemistry", "Full-Stack Software Architecture"): 15-35+ nodes minimum.
2. At least 30% of non-leaf nodes must have 2 or more children (branching), not 1.
3. At least 2 nodes must have 2+ prerequisites (convergence points) — real understanding requires combining prior concepts.
4. Leaf nodes (no children) should be roughly 20-40% of total nodes — these are terminal applications/skills.
5. Each node must list "prerequisiteIds": ["node_id", ...] — can be empty (root nodes), one id, or multiple ids. Do not default every node to exactly one prerequisite.
6. EXACT CONCEPT TITLE MANDATE: Each node's "title" MUST be the EXACT, precise name of the specific concept, formula, mechanism, or tool that node teaches (e.g. "sp3 Hybridization & Orbital Geometry", "Event Loop & Libuv Task Queues", "PostgreSQL B-Tree Indexing"). NEVER use vague titles like "Overview", "Introduction", or "Getting Started".
7. Partition all nodes across numbered Phase Chunks (phaseIndex 0, 1, 2, 3...):
   - Phase 0 (chunk_phase_0): Foundational Mechanics & Core Building Blocks. Set "isCurrentActiveChunk": true.
   - Phase 1..N: Subsequent milestone phases. Set "isCurrentActiveChunk": false.

# YOUR PROCESS (do this before outputting)
1. List every genuinely distinct concept/skill in this field/goal — cast a wide net.
2. Group into a dependency structure: which concepts are independent entry points? Which require 2+ prior concepts combined? Which branch into multiple follow-ons?
3. Only after that map exists, assign node IDs, prerequisiteIds, and edges.

# SELF-CHECK BEFORE RETURNING OUTPUT
Before outputting final JSON, verify against your draft:
- Total nodes meets scope floor
- Total edges > (total nodes - 1) — a pure chain has exactly n-1 edges
- At least one node has 2+ children
- At least one node has 2+ prerequisites
- No node exists purely to pad the count

Output ONLY valid JSON matching the TreeSkeleton schema. Set "verificationStatus" to "unverified".

Schema shape:
{
  "treeId": string,
  "learnerId": string,
  "goalSummary": string,
  "nodes": Array<{
    "id": string,
    "title": string,
    "oneLineSummary": string,
    "goalRelevance": string,
    "prerequisiteIds": string[],
    "status": "locked" | "available" | "in_progress" | "mastered",
    "content": null,
    "masteryScore": number,
    "depth": number,
    "phaseIndex": number,
    "chunkId": string,
    "isCurrentActiveChunk": boolean,
    "estimatedTimeMinutes": number
  }>,
  "edges": Array<{ "from": string, "to": string, "type"?: "prerequisite" | "related" }>,
  "verificationStatus": "unverified",
  "verificationNotes": [],
  "version": 1
}`;

  const userPrompt = `Tree ID: ${input.treeId}
Learner ID: ${input.learnerId}
Raw Goal: "${input.currentGoal.rawStatement}"
Domain: ${input.currentGoal.domain}
Specific Objective: "${input.currentGoal.specificObjective}"
Vocabulary Level: ${input.vocabularyLevel}
Prior Mastery Map: ${JSON.stringify(input.masteryMap || {})}`;

  const result = await executeAgent<CurriculumDrafterInput, TreeSkeleton>({
    agentName: 'CurriculumDrafter',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: TreeSkeletonSchema,
    temperature: 0.4, // Warm temperature for reasoning
    mockFn: mockOutput
      ? () => ({
          treeId: input.treeId,
          learnerId: input.learnerId,
          goalSummary: input.currentGoal.specificObjective,
          nodes: mockOutput.nodes || [
            {
              id: "node_1",
              title: "Core Prerequisite Fundamentals",
              oneLineSummary: "Essential basic concepts required for the domain",
              goalRelevance: `Directly establishes prerequisite knowledge required to achieve ${input.currentGoal.specificObjective}`,
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
              id: "node_2",
              title: "Practical Domain Application",
              oneLineSummary: "Applying core concepts to real-world tasks",
              goalRelevance: `Enables hands-on execution necessary for ${input.currentGoal.specificObjective}`,
              prerequisiteIds: ["node_1"],
              status: "locked",
              content: null,
              masteryScore: 0.0,
              depth: 1,
              phaseIndex: 1,
              chunkId: "chunk_phase_1",
              isCurrentActiveChunk: false,
              estimatedTimeMinutes: 35,
            },
          ],
          edges: mockOutput.edges || [{ from: "node_1", to: "node_2" }],
          verificationStatus: "unverified",
          verificationNotes: [],
          version: 1,
        })
      : undefined,
  });

  // Post-processing: Auto-sync edges array from prerequisiteIds & perform structural verification
  const generatedEdges: Array<{ from: string; to: string; type?: "prerequisite" | "related" }> = [];
  let activeChunkAssigned = false;

  for (const node of result.output.nodes) {
    if (!node.goalRelevance || node.goalRelevance.length < 10) {
      throw new Error(`CurriculumDrafter validation error: Node "${node.id}" has invalid/boilerplate goalRelevance.`);
    }

    if (node.phaseIndex === undefined || node.phaseIndex === null) {
      node.phaseIndex = node.depth || 0;
    }
    node.chunkId = node.chunkId || `chunk_phase_${node.phaseIndex}`;
    
    if (node.phaseIndex === 0 && !activeChunkAssigned) {
      node.isCurrentActiveChunk = true;
      activeChunkAssigned = true;
    } else if (node.phaseIndex !== 0) {
      node.isCurrentActiveChunk = false;
    }

    // Auto-populate edges from prerequisiteIds if edges array is empty
    if (node.prerequisiteIds && node.prerequisiteIds.length > 0) {
      for (const prereqId of node.prerequisiteIds) {
        generatedEdges.push({ from: prereqId, to: node.id, type: "prerequisite" });
      }
    }
  }

  if ((!result.output.edges || result.output.edges.length === 0) && generatedEdges.length > 0) {
    result.output.edges = generatedEdges;
  }

  // Code-side Structural Verification & Automatic Correction Loop
  const verification = verifyCurriculumStructure(result.output.nodes);
  if (!verification.valid) {
    console.warn(`[CurriculumDrafter] Structural Warning: ${verification.errors.join("; ")}`);
    if (!mockOutput) {
      console.warn(`[CurriculumDrafter] Triggering automatic correction pass...`);
      try {
        const correctionResult = await runCurriculumCorrection({
          rejectedSkeleton: result.output,
          structuralErrors: verification.errors,
          learnerId: input.learnerId,
        });
        return correctionResult;
      } catch (correctionErr: any) {
        console.error(`[CurriculumDrafter] Correction pass failed:`, correctionErr);
        result.output.verificationNotes = [
          ...(result.output.verificationNotes || []),
          ...verification.errors,
        ];
      }
    }
  }

  return result;
}

export interface CurriculumCorrectionInput {
  rejectedSkeleton: TreeSkeleton;
  structuralErrors: string[];
  learnerId: string;
}

export async function runCurriculumCorrection(
  input: CurriculumCorrectionInput,
  mockOutput?: Partial<TreeSkeleton>
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `# ROLE
You are the Curriculum Correction Agent. Your previous curriculum draft was rejected by structural verification.
You must correct the specific structural defects below while preserving accurate node content and field coverage.

# YOUR GOAL
Transform the rejected curriculum structure into a true Directed Acyclic Graph (DAG) with branching tracks, converging prerequisites, and proportional node depth.

# SPECIFIC FAILURE CORRECTION RULES:
- If flagged as a linear chain: Identify at least 2 places in your sequence where a single node leads to multiple distinct follow-on concepts. Split the single "next step" into 2+ parallel nodes depending on the same prerequisite.
- If flagged for no branching: Pick the foundational concept and identify what it actually unlocks — add missing parallel sibling nodes.
- If flagged for no convergence: Identify a downstream concept that in reality requires combining two earlier concepts (not just one) — update its "prerequisiteIds" to list both.
- If flagged for node count below floor: Under-decomposed — split any node that is actually 2+ distinct sub-concepts bundled together.

# RE-VERIFY BEFORE OUTPUTTING:
- Total edges > (total nodes - 1)
- At least 1 node has 2+ children
- At least 1 node has 2+ prerequisites
- Node count meets scope floor
- No padding nodes added just to pass checks

Output ONLY valid JSON matching the TreeSkeleton schema. Set "verificationStatus" to "unverified".`;

  const userPrompt = `# CORRECTION REQUIRED — PREVIOUS OUTPUT REJECTED

## YOUR PREVIOUS OUTPUT
${JSON.stringify(input.rejectedSkeleton, null, 2)}

## SPECIFIC FAILURES DETECTED
${input.structuralErrors.map((e) => `- "${e}"`).join('\n')}

## RE-VERIFY BEFORE RETURNING
Return the corrected full JSON — the complete node set with valid DAG topology.`;

  return executeAgent<CurriculumCorrectionInput, TreeSkeleton>({
    agentName: 'CurriculumCorrection',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: TreeSkeletonSchema,
    temperature: 0.3,
    mockFn: mockOutput ? () => ({ ...input.rejectedSkeleton, ...mockOutput }) : undefined,
  });
}
