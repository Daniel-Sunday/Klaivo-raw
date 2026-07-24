import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import {
  LearnerGoalSchema,
  LearnerGoal,
  DiagnosisAgentOutputSchema,
  DiagnosisAgentOutput,
  DiagnosisSlotState,
  DiagnosisSlotStateSchema,
  ProposedSlotEntrySchema,
} from '../schemas';

export { DiagnosisAgentOutputSchema, DiagnosisAgentOutput };

export interface DiagnosisAgentInput {
  learnerId: string;
  rawGoalStatement: string;
  conversationHistory?: string[];
  currentSlotState?: DiagnosisSlotState;
  contextArtifacts?: string[];
  intentClassification: string;
}

export async function runDiagnosisAgent(
  input: DiagnosisAgentInput,
  mockOutput?: Partial<DiagnosisAgentOutput>
): Promise<AgentResult<DiagnosisAgentOutput>> {
  const slotState = input.currentSlotState || {
    slotsResolved: {},
    slotsStillNeeded: ['targetSubject', 'targetLevelOrOutcome'],
    roundCount: 0,
    forceProceedTriggered: false,
    blockedOverwrites: [],
  };

  const systemInstruction = `You are Klaivo's Instant Academic Advisor & Intake Agent.
Your primary job is to extract structured intake slots and IMMEDIATELY enable curriculum tree creation.

INSTANT TREE GENERATION POLICY:
- If "targetSubject" is present or identifiable in the user's input or conversation history (e.g. "WAEC Chemistry", "Build an LLM from scratch", "Python", "Rust"), set "needsMoreContext": false IMMEDIATELY!
- Do NOT ask optional questions about prior knowledge, time availability, or learning style if "targetSubject" is known. Generate the curriculum map right away!
- Set "needsMoreContext": true ONLY if the user's goal statement is completely empty or ambiguous (e.g., "help me learn something").

SLOT KEYS TO EXTRACT:
- "targetSubject": The topic/domain (e.g. "Rust Backend Engineering", "Linear Algebra", "AWS Architect", "LLM from scratch", "WAEC Chemistry")
- "targetLevelOrOutcome": Target proficiency/objective (e.g. "production microservices", "pass exam", "build working prototype")
- "priorKnowledge": Baseline background (optional fallback)
- "practicalFocus": Specific subtopics/tools (optional fallback)

FORCE PROCEED RULE:
- Set "userRequestsProceed": true if the user asks to stop questions, proceed immediately, skip diagnosis, or build the tree now (e.g. "stop asking", "proceed", "build tree", "skip").

Output MUST be valid JSON matching this schema:
{
  "needsMoreContext": boolean,
  "userRequestsProceed": boolean,
  "clarifyingQuestion": string (optional or null),
  "proposedSlots": {
    "<slotKey>": {
      "value": string,
      "isCorrection": boolean,
      "reasoning": string
    }
  },
  "unfilledSlotKeys": string[],
  "reasoning": string
}`;

  const blockedContext = slotState.blockedOverwrites.length > 0
    ? `PREVIOUSLY BLOCKED OVERWRITES (Do NOT re-attempt unless user explicitly corrects):
${slotState.blockedOverwrites.map((b) => `- Slot "${b.slotKey}": Attempted "${b.attemptedValue}" was REJECTED. Confirmed value: "${b.existingValue}".`).join('\n')}`
    : 'None';

  const historyContext = input.conversationHistory && input.conversationHistory.length > 0
    ? `FULL SESSION CONVERSATION HISTORY:\n${input.conversationHistory.map((m, idx) => `Turn ${idx + 1}: ${m}`).join('\n')}`
    : 'Turn 1 (Initial prompt)';

  const userPrompt = `Learner ID: ${input.learnerId}
Latest User Input: "${input.rawGoalStatement}"
${historyContext}
Intent Classification: ${input.intentClassification}
Current Resolved Slots: ${JSON.stringify(slotState.slotsResolved)}
Current Diagnosis Round: ${slotState.roundCount + 1} / 1
Blocked Overwrites History: ${blockedContext}
Context Artifacts: ${input.contextArtifacts?.join(', ') || 'None'}`;

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
          userRequestsProceed: mockOutput.userRequestsProceed ?? false,
          clarifyingQuestion: mockOutput.clarifyingQuestion,
          proposedSlots: mockOutput.proposedSlots || {},
          unfilledSlotKeys: mockOutput.unfilledSlotKeys || [],
          reasoning: mockOutput.reasoning || 'Mock diagnosis execution',
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
      extractedContext: goal,
      calibration: { level: 'beginner', known_concepts: [], weak_points: [] },
    },
  };
}

