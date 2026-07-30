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

  const systemInstruction = `You are Klaivo's Ruflo-Supercharged Academic Advisor & Unified Intake Agent.
Your primary job is to extract structured intake slots, classify global session intent, and IMMEDIATELY enable curriculum tree creation in a single pass.

INSTANT TREE GENERATION POLICY (RULE 9 HARD MANDATE):
- If the user prompt or conversation history mentions ANY topic, subject, or domain (e.g. "Calculus", "Calculus — differentiation and integration", "Organic Chemistry", "Python", "AWS", "WAEC Chemistry", "LLM"), you MUST extract "targetSubject" in proposedSlots and MUST set "needsMoreContext": false IMMEDIATELY on Turn 1!
- NEVER ask clarifying questions or set "needsMoreContext": true when a target subject is identifiable in the user prompt!
- Set "needsMoreContext": true ONLY if the user's goal statement is completely empty or completely vague with zero topic mentioned (e.g., "help me learn something").

UNIFIED INTENT CLASSIFICATION (Single Pass):
Classify user intent into one of: "learning_goal", "exam_preparation", "quick_answer", "problem_solving", "project_building", "research".
- If specific exam/test named -> "exam_preparation"
- If factual query with no learning path -> "quick_answer"
- Otherwise default -> "learning_goal"

SLOT KEYS & CANONICAL NORMALIZATION:
- "targetSubject": The primary topic (e.g., "Rust Backend Engineering", "WAEC Chemistry", "LLM Architecture")
- "targetLevelOrOutcome": Target proficiency/objective (e.g., "production microservices", "pass exam", "master concepts")
- "priorKnowledge": Baseline background (optional fallback)
- "practicalFocus": Specific subtopics/tools (optional fallback)

For each proposed slot, include:
- "value": extracted text string
- "canonicalValue": cleaned/normalized title (e.g. "React.js" -> "React")
- "confidence": confidence score between 0.0 and 1.0
- "isCorrection": boolean indicating if learner is correcting a previous value
- "reasoning": brief explanation

FORCE PROCEED RULE:
- Set "userRequestsProceed": true if the user asks to stop questions, proceed immediately, skip diagnosis, or build the tree now (e.g. "stop asking", "proceed", "build tree", "skip").

Output MUST be valid JSON matching this schema:
{
  "needsMoreContext": boolean,
  "userRequestsProceed": boolean,
  "intent": string,
  "clarifyingQuestion": string (optional or null),
  "proposedSlots": {
    "<slotKey>": {
      "value": string,
      "canonicalValue": string,
      "confidence": number,
      "isCorrection": boolean,
      "reasoning": string
    }
  },
  "unfilledSlotKeys": string[],
  "reasoning": string,
  "currentGoal": {
    "rawStatement": string,
    "domain": string,
    "specificObjective": string,
    "contextArtifacts": string[]
  }
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
Intent Classification: ${input.intentClassification || 'unspecified'}
Current Resolved Slots: ${JSON.stringify(slotState.slotsResolved)}
Current Diagnosis Round: ${slotState.roundCount + 1} / 1
Blocked Overwrites History: ${blockedContext}
Context Artifacts: ${input.contextArtifacts?.join(', ') || 'None'}`;

  const result = await executeAgent<DiagnosisAgentInput, DiagnosisAgentOutput>({
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
          intent: mockOutput.intent || 'learning_goal',
          currentGoal: mockOutput.currentGoal || {
            rawStatement: input.rawGoalStatement,
            domain: 'General',
            specificObjective: 'Master core concepts',
            contextArtifacts: input.contextArtifacts || [],
          },
        })
      : undefined,
  });

  // Canonical normalization post-processing guard
  if (result.output.proposedSlots) {
    for (const [key, slot] of Object.entries(result.output.proposedSlots)) {
      if (slot && !slot.canonicalValue) {
        slot.canonicalValue = slot.value.trim();
      }
    }
  }

  return result;
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

