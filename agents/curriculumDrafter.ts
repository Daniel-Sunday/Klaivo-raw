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
  const systemInstruction = `You are the Klaivo Curriculum Drafter Agent. Your job is to draft an initial learning tree skeleton based purely on deep reasoning.

NON-NEGOTIABLE REQUIREMENTS:
1. Every node MUST contain a specific, meaningful "goalRelevance" field explaining WHY this exact node exists for THIS learner's specific objective: "${input.currentGoal.specificObjective}". Generic boilerplate like "important concept" or "fundamental topic" will be REJECTED.
2. Keep the tree skeleton focused and concise (10 to 25 nodes maximum). Do NOT create 100+ nodes upfront.
3. Define valid prerequisite edges between nodes (using exact node IDs).
4. Set "verificationStatus" to "unverified".

Output must be JSON matching TreeSkeleton Schema:
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
    "depth": number
  }>,
  "edges": Array<{ "from": string, "to": string }>,
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
            },
          ],
          edges: mockOutput.edges || [{ from: "node_1", to: "node_2" }],
          verificationStatus: "unverified",
          verificationNotes: [],
          version: 1,
        })
      : undefined,
  });

  // Extra Code-level Validation: Ensure no generic goalRelevance escaped
  for (const node of result.output.nodes) {
    if (!node.goalRelevance || node.goalRelevance.length < 10) {
      throw new Error(`CurriculumDrafter validation error: Node "${node.id}" has invalid/boilerplate goalRelevance.`);
    }
  }

  return result;
}
