import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { AssessmentResultSchema, AssessmentResult, TreeNode, MasteryMapEntry } from '../schemas';

export interface AssessmentAgentInput {
  learnerId: string;
  node: TreeNode;
  learnerResponse: string;
  priorMastery?: MasteryMapEntry | null;
}

export async function runAssessmentAgent(
  input: AssessmentAgentInput,
  mockOutput?: Partial<AssessmentResult>,
  signal?: AbortSignal
): Promise<AgentResult<AssessmentResult>> {
  const systemInstruction = `You are grading with the honesty of a real subject-matter expert, not a supportive coach trying to make the learner feel good.

BANNED BEHAVIOR:
- Do not inflate masteryDelta to be encouraging. If understanding is shaky, say so and reflect it in the number.
- Do not produce vague reasoning ("good attempt, some room to grow"). Name the SPECIFIC misconception or gap, or specifically confirm what was correctly understood and why it demonstrates mastery.

Grade based on genuine conceptual understanding, not surface pattern-matching of keywords in the learner's response.

Output MUST be a JSON object matching the AssessmentResult schema:
{
  "nodeId": string,
  "masteryDelta": number, // number between -1.0 and 1.0
  "detectedMisconceptions": string[],
  "readyToAdvance": boolean,
  "reasoning": string
}`;

  const userPrompt = `Node ID: ${input.node.id}
Node Title: "${input.node.title}"
Learner Response: "${input.learnerResponse}"
Prior Mastery Entry: ${JSON.stringify(input.priorMastery || { level: 0, confusionFlags: [] })}`;

  return await executeAgent<AssessmentAgentInput, AssessmentResult>({
    agentName: 'AssessmentAgent',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: AssessmentResultSchema,
    temperature: 0.1,
    signal,
    mockFn: mockOutput
      ? () => ({
          nodeId: input.node.id,
          masteryDelta: mockOutput.masteryDelta ?? 0.35,
          detectedMisconceptions: mockOutput.detectedMisconceptions || [],
          readyToAdvance: mockOutput.readyToAdvance ?? true,
          reasoning: mockOutput.reasoning || "Learner demonstrated solid understanding of key principles with zero major misconceptions.",
        })
      : undefined,
  });
}

// --- Legacy API Adapter (For backward compatibility with legacy endpoints) ---
export async function assessAnswer(
  node: any,
  _calibrationOrResponse: any,
  responseOrAnswer?: string
): Promise<any> {
  const learnerResponse = typeof responseOrAnswer === 'string' ? responseOrAnswer : typeof _calibrationOrResponse === 'string' ? _calibrationOrResponse : 'Learner response';

  const treeNode: TreeNode = {
    id: node?.id || 'node_legacy',
    title: node?.title || 'Topic',
    oneLineSummary: node?.description || 'Summary',
    goalRelevance: 'Legacy topic assessment',
    prerequisiteIds: node?.dependencies || [],
    status: 'in_progress',
    content: null,
    masteryScore: 0,
    depth: 0,
  };

  const result = await runAssessmentAgent({
    learnerId: 'legacy_user',
    node: treeNode,
    learnerResponse,
  });

  return {
    passed: result.output.readyToAdvance,
    feedback: result.output.reasoning,
    calibration_update: {
      level_delta: result.output.masteryDelta,
      add_known: result.output.readyToAdvance ? [treeNode.title] : [],
      add_weak_points: result.output.detectedMisconceptions,
    },
  };
}
