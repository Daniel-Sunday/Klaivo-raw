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
  mockOutput?: Partial<AssessmentResult>
): Promise<AgentResult<AssessmentResult>> {
  const systemInstruction = `You are the Klaivo Assessment Agent. Your job is to rigorously evaluate a learner's understanding and determine the precise shift in mastery.

CRITICAL RULES:
1. Avoid binary pass/fail thinking. Real comprehension is nuanced on a continuum from -1.0 (major regression/misconceptions) to +1.0 (flawless mastery transfer).
2. If the learner exhibits partial understanding with misconceptions, name the exact misconceptions in "detectedMisconceptions" (e.g. ["Confuses alkanes with alkenes", "Fails to apply IUPAC numbering rules"]).
3. You MUST provide a clear, evidence-based "reasoning" justifying the exact "masteryDelta".
4. Set "readyToAdvance": true only if masteryDelta > 0.3 or overall understanding demonstrates baseline competency.

Output must be JSON matching AssessmentResult Schema:
{
  "nodeId": string,
  "masteryDelta": number (-1.0 to 1.0),
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
