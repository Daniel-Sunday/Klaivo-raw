import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { SessionSummarySchema, SessionSummary, AgentLog, MasteryMapEntry } from '../schemas';

export interface ReflectionAgentInput {
  sessionId: string;
  learnerId: string;
  recentLogs: AgentLog[];
  masteryMap: Record<string, MasteryMapEntry>;
  goalSummary: string;
}

export async function runReflectionAgent(
  input: ReflectionAgentInput,
  mockOutput?: Partial<SessionSummary>
): Promise<AgentResult<SessionSummary>> {
  const systemInstruction = `You are the Klaivo Reflection Agent. Your job is to compress session activity into a concise, high-signal SessionSummary.

CRITICAL RULES:
1. Be genuinely compressive. Do NOT generate bloated transcripts.
2. PRESERVE STRUGGLE & MISCONCEPTION SIGNALS. Highlight resolved vs ongoing confusion flags.
3. List key takeaways and nodes covered clearly.

Output must match SessionSummary Schema:
{
  "sessionId": string,
  "timestamp": ISO timestamp string,
  "goalSummary": string,
  "nodesCovered": string[],
  "keyTakeaways": string[],
  "confusionFlagsResolved": string[]
}`;

  const userPrompt = `Session ID: ${input.sessionId}
Learner ID: ${input.learnerId}
Goal Summary: "${input.goalSummary}"
Mastery Map: ${JSON.stringify(input.masteryMap)}
Log Count: ${input.recentLogs.length}
Sample Log Actions: ${input.recentLogs.map((l) => `${l.agentName} (${l.validationPassed ? 'success' : 'failed'})`).join(', ')}`;

  return await executeAgent<ReflectionAgentInput, SessionSummary>({
    agentName: 'ReflectionAgent',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: SessionSummarySchema,
    temperature: 0.2,
    mockFn: mockOutput
      ? () => ({
          sessionId: input.sessionId,
          timestamp: new Date().toISOString(),
          goalSummary: input.goalSummary,
          nodesCovered: mockOutput.nodesCovered || ["node_1"],
          keyTakeaways: mockOutput.keyTakeaways || ["Mastered core IUPAC naming rules."],
          confusionFlagsResolved: mockOutput.confusionFlagsResolved || ["Resolved numbering direction misconception."],
        })
      : undefined,
  });
}
