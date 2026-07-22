import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { LearnerGoalSchema, LearnerGoal } from '../schemas';

export const DiagnosisAgentOutputSchema = z.object({
  needsMoreContext: z.boolean(),
  clarifyingQuestion: z.string().optional(),
  currentGoal: LearnerGoalSchema,
  reasoning: z.string().min(1, "reasoning required"),
});
export type DiagnosisAgentOutput = z.infer<typeof DiagnosisAgentOutputSchema>;

export interface DiagnosisAgentInput {
  learnerId: string;
  rawGoalStatement: string;
  contextArtifacts?: string[];
  intentClassification: string;
}

export async function runDiagnosisAgent(
  input: DiagnosisAgentInput,
  mockOutput?: Partial<DiagnosisAgentOutput>
): Promise<AgentResult<DiagnosisAgentOutput>> {
  const systemInstruction = `You are the Klaivo Diagnosis Agent. Your job is to transform a learner's raw goal statement into a clear, actionable, goal-conditioned objective.

CRITICAL DISTINCTION:
- "domain": The general subject area (e.g. "organic chemistry", "python", "backend engineering").
- "specificObjective": The precise outcome, target depth, or deadline (e.g. "pass WAEC organic chemistry exam by May", "build production microservices to land a senior backend engineer role", "automate personal excel spreadsheets").

Do NOT collapse domain and objective. Someone in Python who wants to automate spreadsheets has a completely different depth requirements from someone aiming to be hired.

GUIDANCE:
- If the raw goal statement is too vague or lacks sufficient signal (e.g., just "I want to learn Python"), set "needsMoreContext": true and provide a specific, helpful "clarifyingQuestion".
- If the goal statement is specific enough, set "needsMoreContext": false and construct a sharp, goal-conditioned "specificObjective".

Output must be JSON matching:
{
  "needsMoreContext": boolean,
  "clarifyingQuestion": string (optional),
  "currentGoal": {
    "rawStatement": string,
    "domain": string,
    "specificObjective": string,
    "contextArtifacts": string[]
  },
  "reasoning": string
}`;

  const userPrompt = `Learner ID: ${input.learnerId}
Raw Goal Statement: "${input.rawGoalStatement}"
Intent Classification: ${input.intentClassification}
Context Artifacts Provided: ${input.contextArtifacts?.join(', ') || 'None'}`;

  return await executeAgent<DiagnosisAgentInput, DiagnosisAgentOutput>({
    agentName: 'DiagnosisAgent',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: DiagnosisAgentOutputSchema,
    temperature: 0.2,
    mockFn: mockOutput
      ? () => ({
          needsMoreContext: mockOutput.needsMoreContext ?? false,
          clarifyingQuestion: mockOutput.clarifyingQuestion,
          currentGoal: mockOutput.currentGoal || {
            rawStatement: input.rawGoalStatement,
            domain: "General Learning",
            specificObjective: "Master core concepts in the target domain",
            contextArtifacts: input.contextArtifacts || [],
          },
          reasoning: mockOutput.reasoning || "Mock diagnosis execution",
        })
      : undefined,
  });
}

// --- Legacy API Adapters ---
export async function getDiagnosticQuestion(goalOrIntent: any, promptOrContext?: any): Promise<string> {
  const goal = typeof promptOrContext === 'string' ? promptOrContext : typeof goalOrIntent === 'string' ? goalOrIntent : 'Learning Goal';
  const intent = typeof goalOrIntent === 'string' ? goalOrIntent : 'learning_goal';
  const result = await runDiagnosisAgent({
    learnerId: 'legacy_user',
    rawGoalStatement: goal,
    intentClassification: intent,
  });
  return result.output.clarifyingQuestion || `What is your primary target outcome for learning ${goal}?`;
}

export async function processDiagnosticTurn(
  session: any,
  text: string,
  _context?: any
): Promise<{ readyForPath: boolean; feedback: string; summary: any }> {
  const goal = typeof session === 'string' ? session : session?.title || text;
  const result = await runDiagnosisAgent({
    learnerId: session?.id || 'legacy_user',
    rawGoalStatement: `${goal}. ${text}`,
    intentClassification: session?.intent || 'learning_goal',
  });
  return {
    readyForPath: !result.output.needsMoreContext,
    feedback: result.output.clarifyingQuestion || "Goal diagnosed successfully.",
    summary: {
      userGoal: goal,
      intent: session?.intent || 'learning_goal',
      extractedContext: result.output.currentGoal.specificObjective,
      calibration: { level: 'beginner', known_concepts: [], weak_points: [] },
    },
  };
}
