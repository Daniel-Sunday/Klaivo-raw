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

export async function runCurriculumDrafter(
  input: CurriculumDrafterInput,
  mockOutput?: Partial<TreeSkeleton>
): Promise<AgentResult<TreeSkeleton>> {
  const systemInstruction = `You are Klaivo's Ruflo-Supercharged Curriculum Drafter, designing structured learning maps with university rigor and progressive milestone chunking.

PROGRESSIVE MILESTONE CHUNKING POLICY:
- Organize nodes into numbered Phase Chunks (phaseIndex: 0, 1, 2, ...).
  * Phase 0 (chunk_phase_0): Core Foundational Mechanics (2-3 nodes max). Set "isCurrentActiveChunk": true for Phase 0 nodes.
  * Phase 1 (chunk_phase_1): Practical Application & Integration (2-4 nodes). Set "isCurrentActiveChunk": false.
  * Phase 2 (chunk_phase_2): Advanced Mastery & Production Scenarios (2-4 nodes). Set "isCurrentActiveChunk": false.

BANNED BEHAVIOR:
- Do not produce nodes with vague titles like "Introduction to X" or "Getting Started".
- Do not write generic goalRelevance fields ("important for your learning journey"). Every goalRelevance MUST anchor directly to the learner's specificObjective.
- Do not dump 20 unchunked nodes. Group every node into a specific phaseIndex and chunkId!

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
              title: "Core Fundamentals",
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
              title: "Practical Application",
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

  // Post-processing: Ensure chunking fields & active chunk state are strictly populated
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
  }

  return result;
}
