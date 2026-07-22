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
  mockOutput?: Partial<IntentAgentOutput>
): Promise<AgentResult<IntentAgentOutput>> {
  const learnerId = input.learnerState?.learnerId || 'anonymous_learner';

  const systemInstruction = `You are the Klaivo Intent Agent. Your single job is to classify the user's input request into exactly one of the following intent categories:
- "quick_answer": Direct question seeking a immediate, concise factual response.
- "learning_goal": Desire to master a subject, topic, or learn a new discipline over time.
- "problem_solving": Debugging a specific error, resolving a stuck issue, or fixing broken code/math.
- "project_building": Wanting to build, create, or architect a software app, system, or project.
- "research": Deep exploration of academic papers, comparative literature, or complex analytical domains.
- "exam_preparation": Studying specifically to pass an exam, test, or standard qualification.

Output MUST be a JSON object with:
- "intent": one of the 6 intent keys listed above.
- "confidence": number between 0.0 and 1.0 representing your certainty.
- "reasoningForLog": brief one-sentence justification.

Do NOT write prose outside JSON. Keep temperature low and classification deterministic.`;

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
