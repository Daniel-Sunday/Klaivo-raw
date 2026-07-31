import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { LearnerState } from '../schemas';

export const IntentTypeSchema = z.enum([
  "quick_answer",
  "learning_goal",
  "problem_solving",
  "project_building",
  "research",
  "exam_preparation",
]);
export type IntentType = z.infer<typeof IntentTypeSchema>;

export const IntentAgentOutputSchema = z.object({
  intent: IntentTypeSchema,
  confidence: z.number().min(0.0).max(1.0),
  reasoningForLog: z.string().optional(),
  needsClarification: z.boolean().default(false),
});
export type IntentAgentOutput = z.infer<typeof IntentAgentOutputSchema>;

export interface IntentAgentInput {
  rawMessage: string;
  learnerState?: LearnerState | null;
}

export async function runIntentAgent(
  input: IntentAgentInput,
  mockOutput?: Partial<IntentAgentOutput>,
  signal?: AbortSignal
): Promise<AgentResult<IntentAgentOutput>> {
  const learnerId = input.learnerState?.learnerId || 'anonymous_learner';

  const systemInstruction = `You are a classification system, not a conversational assistant.
Classify the user's message into exactly one intent category. Do not explain your reasoning in the output. Do not add caveats, greetings, or filler. Output ONLY valid JSON matching this shape:

{ "intent": "quick_answer" | "learning_goal" | "problem_solving" | "project_building" | "research" | "exam_preparation",
  "confidence": <number 0-1>,
  "reasoningForLog": "<one sentence, internal use only>" }

Rules:
- "learning_goal" = the user wants to learn a subject/skill from some starting point toward some competence level.
- "exam_preparation" = the user names a specific exam, test, or certification as the target.
- "quick_answer" = a single factual question with no learning trajectory implied.
- If genuinely ambiguous between two categories, pick the one that implies MORE structure needed, and lower confidence accordingly.`;

  const userPrompt = `User message: "${input.rawMessage}"
Existing Learner Goal Context: ${input.learnerState?.currentGoal.specificObjective || 'None'}`;

  const result = await executeAgent<IntentAgentInput, IntentAgentOutput>({
    agentName: 'IntentAgent',
    learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: IntentAgentOutputSchema,
    temperature: 0.1,
    signal,
    mockFn: mockOutput
      ? () => {
          const confidence = mockOutput.confidence ?? 0.9;
          return {
            intent: mockOutput.intent || 'learning_goal',
            confidence,
            reasoningForLog: mockOutput.reasoningForLog || 'Mock classification',
            needsClarification: confidence < 0.6,
          };
        }
      : undefined,
  });

  if (result.output.confidence < 0.6) {
    result.output.needsClarification = true;
  }

  return result;
}

// --- Legacy API Adapter ---
export async function classifyIntent(userPrompt: string, _context?: any): Promise<any> {
  const result = await runIntentAgent({ rawMessage: userPrompt });
  // Map 'exam_preparation' to 'exam_prep' if legacy caller expects it
  if (result.output.intent === 'exam_preparation') {
    return 'exam_prep';
  }
  return result.output.intent;
}
