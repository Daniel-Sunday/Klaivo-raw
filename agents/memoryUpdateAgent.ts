import {
  LearnerState,
  LearnerStateSchema,
  AssessmentResult,
  validateAssessmentResult,
  AgentLog,
  AgentLogSchema,
} from '../schemas';

export interface MemoryUpdateResult {
  updatedState: LearnerState;
  log: AgentLog;
}

/**
 * Memory Update Agent (2.7)
 * Applies a validated AssessmentResult to LearnerState deterministically.
 * Rejects any unvalidated AssessmentResult before state mutation.
 */
export function runMemoryUpdateAgent(
  assessmentResult: AssessmentResult,
  currentState: LearnerState
): MemoryUpdateResult {
  const timestamp = new Date().toISOString();

  // 1. Validation Guardrail: Validate assessment result before touching state
  const validatedAssessment = validateAssessmentResult(assessmentResult);

  // 2. Clone state to ensure immutability
  const newState: LearnerState = JSON.parse(JSON.stringify(currentState));

  // 3. Retrieve or initialize node entry in masteryMap
  const existingEntry = newState.masteryMap[validatedAssessment.nodeId] || {
    level: 0.0,
    lastAssessed: timestamp,
    confusionFlags: [],
  };

  // 4. Update level (clamped 0.0 - 1.0)
  const newLevel = Math.max(0.0, Math.min(1.0, existingEntry.level + validatedAssessment.masteryDelta));

  // 5. Merge confusionFlags (add new, preserve unresolved)
  const flagSet = new Set([...existingEntry.confusionFlags, ...validatedAssessment.detectedMisconceptions]);

  newState.masteryMap[validatedAssessment.nodeId] = {
    level: newLevel,
    lastAssessed: timestamp,
    confusionFlags: Array.from(flagSet),
  };

  // 6. Vocabulary level progression heuristic
  const masteredCount = Object.values(newState.masteryMap).filter((entry) => entry.level >= 0.85).length;
  if (masteredCount >= 10 && newState.vocabularyLevel === 'beginner') {
    newState.vocabularyLevel = 'intermediate';
  } else if (masteredCount >= 25 && newState.vocabularyLevel === 'intermediate') {
    newState.vocabularyLevel = 'advanced';
  }

  // 7. Validate updated state
  const finalState = LearnerStateSchema.parse(newState);

  const log: AgentLog = AgentLogSchema.parse({
    logId: `log_mem_${Date.now()}`,
    agentName: 'MemoryUpdateAgent',
    learnerId: finalState.learnerId,
    timestamp,
    input: { assessmentResult, currentState } as unknown,
    output: finalState as unknown,
    reasoning: `Applied assessment for node ${validatedAssessment.nodeId}: delta ${validatedAssessment.masteryDelta}, new level ${newLevel.toFixed(2)}.`,
    validationPassed: true,
    retryCount: 0,
  });

  return { updatedState: finalState, log };
}
