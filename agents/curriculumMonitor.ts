import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { TreeSkeleton, TreeNode, LearnerState } from '../schemas';

export interface CurriculumMonitorInput {
  tree: TreeSkeleton;
  learnerState: LearnerState;
  lastAssessedNodeId?: string;
  lastMasteryDelta?: number;
  detectedMisconceptions?: string[];
}

export const CurriculumMonitorOutputSchema = z.object({
  activeChunkId: z.string(),
  activePhaseIndex: z.number().int(),
  chunkCompletionPercentage: z.number().min(0).max(100),
  recommendation: z.enum(['advance_chunk', 'continue_chunk', 'inject_remedial_node', 'fast_track']),
  remedialNodesNeeded: z.array(z.object({
    id: z.string(),
    title: z.string(),
    oneLineSummary: z.string(),
    goalRelevance: z.string(),
    prerequisiteIds: z.array(z.string()),
  })).default([]),
  reasoning: z.string(),
});
export type CurriculumMonitorOutput = z.infer<typeof CurriculumMonitorOutputSchema>;

/**
 * Ruflo-Supercharged Curriculum Monitor
 * Continuously monitors active learning chunk velocity, retry count, and misconception patterns.
 */
export async function runCurriculumMonitor(
  input: CurriculumMonitorInput,
  mockOutput?: Partial<CurriculumMonitorOutput>
): Promise<AgentResult<CurriculumMonitorOutput>> {
  const activeNodes = input.tree.nodes.filter((n) => n.isCurrentActiveChunk || n.phaseIndex === 0);
  const masteredInActive = activeNodes.filter((n) => n.status === 'mastered');
  const completionPct = activeNodes.length > 0 ? (masteredInActive.length / activeNodes.length) * 100 : 0;

  const systemInstruction = `You are Klaivo's Ruflo Curriculum Monitor.
Your job is to actively monitor the learner's chunk progress, velocity, and misconception occurrences.

CHUNKING & MONITORING RULES:
1. "advance_chunk": If all nodes in the active chunk (phaseIndex: ${input.tree.nodes[0]?.phaseIndex || 0}) are mastered, recommend advancing to the next phase chunk (phaseIndex + 1).
2. "inject_remedial_node": If the learner has persistent misconceptions or failed assessment on a node in this chunk, generate 1 targeted micro-remedial node to bridge the gap before advancing.
3. "fast_track": If the learner scores >= 0.9 on the first node of the chunk with zero misconceptions, recommend skipping optional breadth nodes in the current chunk.
4. "continue_chunk": Otherwise, continue the current active chunk.

Output MUST be valid JSON matching CurriculumMonitorOutputSchema.`;

  const userPrompt = `Tree ID: ${input.tree.treeId}
Learner ID: ${input.learnerState.learnerId}
Active Chunk Nodes: ${JSON.stringify(activeNodes.map((n) => ({ id: n.id, title: n.title, status: n.status, mastery: n.masteryScore })))}
Active Chunk Completion %: ${completionPct.toFixed(1)}%
Last Assessed Node: ${input.lastAssessedNodeId || 'None'}
Last Mastery Delta: ${input.lastMasteryDelta ?? 'N/A'}
Detected Misconceptions: ${input.detectedMisconceptions?.join(', ') || 'None'}`;

  return await executeAgent<CurriculumMonitorInput, CurriculumMonitorOutput>({
    agentName: 'CurriculumMonitor' as any,
    learnerId: input.learnerState.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: CurriculumMonitorOutputSchema,
    temperature: 0.2,
    mockFn: mockOutput
      ? () => ({
          activeChunkId: mockOutput.activeChunkId || activeNodes[0]?.chunkId || 'chunk_phase_0',
          activePhaseIndex: mockOutput.activePhaseIndex ?? (activeNodes[0]?.phaseIndex || 0),
          chunkCompletionPercentage: completionPct,
          recommendation: mockOutput.recommendation || (completionPct >= 100 ? 'advance_chunk' : 'continue_chunk'),
          remedialNodesNeeded: mockOutput.remedialNodesNeeded || [],
          reasoning: mockOutput.reasoning || 'Monitored active chunk progression',
        })
      : undefined,
  });
}
