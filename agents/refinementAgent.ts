import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import {
  RefinementRequest,
  TreeSkeleton,
  RefinementDiffSchema,
  RefinementDiff,
  validateRefinementDiff,
  MasteryMapEntry,
} from '../schemas';

export interface RefinementAgentInput {
  request: RefinementRequest;
  currentTree: TreeSkeleton;
  masteryMap?: Record<string, MasteryMapEntry>;
}

export async function runRefinementAgent(
  input: RefinementAgentInput,
  mockOutput?: Partial<RefinementDiff>
): Promise<AgentResult<RefinementDiff>> {
  const masteredNodeIds = input.currentTree.nodes
    .filter((n) => n.status === 'mastered')
    .map((n) => n.id);

  const systemInstruction = `You are the Klaivo Refinement Agent. Your job is to process learner feedback and produce a targeted RefinementDiff.

STRICT NON-NEGOTIABLE RULE:
- You must NEVER remove a node whose status is "mastered". Protected Mastered Node IDs: [${masteredNodeIds.join(', ')}].
- If you include any mastered node ID in "removedNodeIds", your output will be REJECTED.
- Produce a diff (addedNodes, removedNodeIds, modifiedNodes) rather than rebuilding the whole tree from scratch.
- Increment "newVersion" to ${input.currentTree.version + 1}.

Output must match RefinementDiff Schema:
{
  "treeId": string,
  "addedNodes": TreeNode[],
  "removedNodeIds": string[],
  "modifiedNodes": TreeNode[],
  "newVersion": number
}`;

  const userPrompt = `Tree ID: ${input.currentTree.treeId}
Current Version: ${input.currentTree.version}
Learner Feedback: "${input.request.learnerFeedback}"
Target Node ID: ${input.request.targetNodeId || 'Entire Tree'}
Current Nodes: ${JSON.stringify(input.currentTree.nodes.map((n) => ({ id: n.id, title: n.title, status: n.status })))}`;

  const result = await executeAgent<RefinementAgentInput, RefinementDiff>({
    agentName: 'RefinementAgent',
    learnerId: input.currentTree.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: RefinementDiffSchema,
    temperature: 0.3,
    mockFn: mockOutput
      ? () => ({
          treeId: input.currentTree.treeId,
          addedNodes: mockOutput.addedNodes || [],
          removedNodeIds: mockOutput.removedNodeIds || [],
          modifiedNodes: mockOutput.modifiedNodes || [],
          newVersion: input.currentTree.version + 1,
        })
      : undefined,
  });

  // Validation Guardrail: Enforce non-negotiable rule via validateRefinementDiff
  validateRefinementDiff(result.output, input.currentTree);

  return result;
}
