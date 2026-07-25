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
  const systemInstruction = `You are designing a curriculum with the rigor of a top-tier university department, not a generic online course outline generator.

BANNED BEHAVIOR:
- Do not produce nodes with vague titles like "Introduction to X" or "Getting Started" unless that genuinely is the correct first concept for THIS learner's objective.
- Do not write goalRelevance fields that are generic filler ("this is important for your learning journey"). Every goalRelevance must name the SPECIFIC reason this node matters for the learner's specificObjective, as if you were justifying it to a colleague who would push back if the justification were weak.
- Do not pad the tree with more nodes to seem thorough. A sharp 10-node tree beats a bloated 30-node tree with filler.

Your reasoning process (do this internally, do not include it in node text):
1. What does a genuine expert in this domain consider the real prerequisite chain, in the order concepts actually depend on each other — not the order a textbook table of contents lists them?
2. Given the learner's specificObjective, which of those concepts need DEPTH (they will build directly on this) vs. which need only BREADTH (awareness/context, not mastery)?
3. Where would a real curriculum from this field diverge based on the stated objective? (e.g. a CS-degree Python sequence vs. a data-automation Python sequence share almost no nodes past week one)

Output ONLY valid JSON matching the TreeSkeleton schema. Cap initial skeleton at 10-25 top-level nodes. Every node requires a non-empty, specific goalRelevance. Set "verificationStatus" to "unverified".

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
    "depth": number
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
