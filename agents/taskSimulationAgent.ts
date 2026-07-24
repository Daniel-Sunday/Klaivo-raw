import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { TreeNode } from '../schemas';

export const TaskModalitySchema = z.enum([
  'code_challenge',
  'exam_rubric_challenge',
  'scenario_simulation',
  'creative_synthesis_challenge',
  'dialogue_simulation',
  'math_proof_challenge',
]);
export type TaskModality = z.infer<typeof TaskModalitySchema>;

export const TaskSimulationSpecSchema = z.object({
  id: z.string(),
  nodeId: z.string(),
  title: z.string(),
  taskType: TaskModalitySchema,
  domainCategory: z.string(),
  instructions: z.string(),
  starterTemplate: z.string().optional().default(''),
  solutionRubric: z.string().optional().default(''),
  expectedOutputs: z.array(z.string()).optional().default([]),
  evaluationCriteria: z.array(z.string()).optional().default([]),
});
export type TaskSimulationSpec = z.infer<typeof TaskSimulationSpecSchema>;

export const TaskEvaluationResultSchema = z.object({
  score: z.number().min(0.0).max(1.0),
  passed: z.boolean(),
  feedback: z.string(),
  detectedMisconceptions: z.array(z.string()).default([]),
  domainSpecificStrengths: z.array(z.string()).optional().default([]),
});
export type TaskEvaluationResult = z.infer<typeof TaskEvaluationResultSchema>;

export interface TaskSimulationInput {
  sessionId: string;
  node: TreeNode;
  goalSummary: string;
  vocabularyLevel: string;
  contextArtifacts?: string[];
}

export async function generateTaskSimulation(
  input: TaskSimulationInput
): Promise<TaskSimulationSpec> {
  const systemInstruction = `You are Klaivo's Universal Task & Domain Examiner Agent.
Your job is to analyze the learner's goal, the concept node, and the domain, and dynamically determine the optimal task modality and challenge.

AVAILABLE TASK MODALITIES (Select the single best fit for the domain):
1. "code_challenge": Software development, AI/ML, DevOps, Data Science, Web/App Engineering. Include starter code template and expected runtime outputs/assertions.
2. "exam_rubric_challenge": Standardized test preparation (e.g. WAEC, AWS, SAT, GRE, MCAT, Bar Exam, AP). Include precise scoring rubric criteria matching official exam schemes.
3. "scenario_simulation": Business, Product Strategy, Finance, Economics, Management, Law. Present a real-world case scenario requiring strategic decisions and tradeoff justifications.
4. "creative_synthesis_challenge": Creative Writing, Design, Philosophy, Journalism, Media. Require structural or creative synthesis evaluated against stylistic and conceptual criteria.
5. "dialogue_simulation": Language learning, Negotiation, Public Speaking, Leadership. Require roleplay dialogue or conversational translation response.
6. "math_proof_challenge": Mathematics, Physics, Statistics, Quantitative Reasoning. Require step-by-step mathematical proof or quantitative calculation.

CRITICAL INSTRUCTIONS:
- Automatically select "taskType" from the 6 modalities above based on what is being learned.
- Do NOT default to multiple-choice questions. Produce authentic, practical, hands-on tasks.
- For "starterTemplate", provide a helpful starting point (code skeleton, prompt outline, proof template, or scenario response structure).

Output MUST be a valid JSON object matching the TaskSimulationSpec schema.`;

  const userPrompt = `Node Title: "${input.node.title}"
Node Summary: "${input.node.oneLineSummary}"
Learner Goal: "${input.goalSummary}"
Vocabulary Level: ${input.vocabularyLevel}
Context Artifacts: ${input.contextArtifacts?.slice(0, 2).join('\n') || 'None'}`;

  const result = await executeAgent<TaskSimulationInput, TaskSimulationSpec>({
    agentName: 'TaskSimulationAgent',
    learnerId: input.sessionId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: TaskSimulationSpecSchema,
    temperature: 0.3,
  });

  return result.output;
}

export async function evaluateTaskSubmission(
  taskSpec: TaskSimulationSpec,
  learnerSubmission: string,
  sessionId: string
): Promise<TaskEvaluationResult> {
  const systemInstruction = `You are Klaivo's Universal Domain Evaluation Agent.
Evaluate the learner's task submission against the task specification, domain category ("${taskSpec.domainCategory}"), and solution rubric/criteria.

Evaluation Rules:
- Score is a number between 0.0 and 1.0.
- Set "passed": true if score >= 0.75.
- Provide constructive, domain-appropriate feedback explaining what was correct and how to improve.
- Identify specific conceptual misconceptions or errors in "detectedMisconceptions".
- Highlight key strengths in "domainSpecificStrengths".

Output MUST be valid JSON matching the TaskEvaluationResult schema.`;

  const userPrompt = `Task Title: "${taskSpec.title}"
Domain Category: ${taskSpec.domainCategory}
Task Modality: ${taskSpec.taskType}
Instructions: "${taskSpec.instructions}"
Solution Rubric / Criteria: "${taskSpec.solutionRubric}"
Learner Submission:
"""
${learnerSubmission}
"""`;

  const result = await executeAgent<{ taskSpec: TaskSimulationSpec; learnerSubmission: string }, TaskEvaluationResult>({
    agentName: 'TaskEvaluationAgent',
    learnerId: sessionId,
    systemInstruction,
    userPrompt,
    inputData: { taskSpec, learnerSubmission },
    schema: TaskEvaluationResultSchema,
    temperature: 0.1,
  });

  return result.output;
}
