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
    slotsStillNeeded: ['targetSubject', 'targetLevelOrOutcome', 'priorKnowledge'],
    roundCount: 0,
    forceProceedTriggered: false,
    blockedOverwrites: [],
  };

  const systemInstruction = `You are a rigorous academic advisor, not a customer support agent.
Your job is to analyze the user's input and extract structured intake slots for designing their learning curriculum.

SLOT KEYS TO EXTRACT:
- "targetSubject": The topic/domain (e.g. "Rust Backend Engineering", "Linear Algebra", "AWS Architect")
- "targetLevelOrOutcome": Target proficiency/objective (e.g. "production microservices", "pass exam X")
- "priorKnowledge": Baseline background (e.g. "3 years C++", "beginner", "intermediate math")
- "practicalFocus": Specific subtopics/tools (e.g. "Tokio async, Axum", "No frontend")

SLOT CORRECTION RULES:
- When extracting a proposed slot, set "isCorrection": true ONLY if the user's latest input explicitly corrects or changes a previously established slot. Otherwise set "isCorrection": false.

FORCE PROCEED RULE:
- Set "userRequestsProceed": true if the user explicitly asks to stop questions, proceed immediately, skip diagnosis, or build the tree now (e.g. "stop asking", "proceed", "build tree", "skip").

BANNED BEHAVIOR:
- Do not respond with encouragement ("Great goal!").
- Do not make assumptions about unstated slots.
- Do not re-attempt overwrites listed in PREVIOUSLY BLOCKED OVERWRITES unless user explicitly corrected them.

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

  const userPrompt = `Learner ID: ${input.learnerId}
Latest User Input: "${input.rawGoalStatement}"
Intent Classification: ${input.intentClassification}
Current Resolved Slots: ${JSON.stringify(slotState.slotsResolved)}
Slots Still Needed: ${JSON.stringify(slotState.slotsStillNeeded)}
Current Diagnosis Round: ${slotState.roundCount + 1} / 3
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

