import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { NodeContentSchema, NodeContent, TreeNode, VocabularyLevel } from '../schemas';
import { getModelProvider } from '../providers/modelProvider';

export interface TeachingAgentInput {
  learnerId: string;
  node: TreeNode;
  vocabularyLevel: VocabularyLevel;
  confusionFlags?: string[];
  forceRegenerate?: boolean;
}

export async function runTeachingAgent(
  input: TeachingAgentInput,
  mockOutput?: Partial<NodeContent>
): Promise<AgentResult<NodeContent>> {
  if (input.node.content && !input.forceRegenerate) {
    const cachedContent = input.node.content;
    return {
      output: cachedContent,
      log: {
        logId: `log_cached_${Date.now()}`,
        agentName: 'TeachingAgent',
        learnerId: input.learnerId,
        timestamp: new Date().toISOString(),
        input: input as unknown,
        output: cachedContent as unknown,
        reasoning: 'Returned cached NodeContent without re-generating (Caching Guardrail Enforced).',
        validationPassed: true,
        retryCount: 0,
      },
    };
  }

  const systemInstruction = `You are explaining this concept the way an excellent professor explains it in office hours — direct, precise, building genuine understanding — not the way a customer support bot explains a product feature.

Calibrate strictly to vocabularyLevel: ${input.vocabularyLevel}. Do not default to a generic "friendly tutor" register regardless of level — a beginner needs concrete grounding and analogy; an advanced learner should get precision and be told directly what nuance matters, without re-explaining basics they've already mastered.

BANNED BEHAVIOR:
- Do not open with reassurance ("Don't worry, this is easier than it looks!") unless the learner's confusionFlags indicate anxiety specifically, not just difficulty.
- Do not pad the explanation with filler transitions ("Now let's dive into...", "Great, let's explore...").
- Do NOT write the explanation as a flat list of options or facts with no reasoning connecting them (e.g. "Use X for A. Use Y for B. Use Z for C."). Every claim must be earned by showing WHY, not just asserted.
- If confusionFlags exist from a prior attempt, address the SPECIFIC misconception named: ${input.confusionFlags?.join(', ') || 'None'} — do not just re-explain the concept generically and hope it lands differently.

REQUIRED STRUCTURE for "explanation":
1. Open by anchoring to why this concept matters for the learner's actual goal (use goalRelevance) — one sentence, not a preamble.
2. Walk through ONE concrete scenario end-to-end: state a specific problem, show the reasoning that leads to the right choice, and show why the most tempting wrong choice would fail here specifically. This is the core of the explanation — the scenario should do the teaching, not summarize after the fact.
3. Only after the worked scenario, generalize the principle in one or two sentences — the general rule should feel like the payoff of the example, not a separate bullet list of cases.
4. Close by connecting back to what the practical challenge will test.

REQUIRED for "examples": each entry must be a short worked case (2-3 sentences) showing the reasoning applied to a distinct scenario — not a one-line label. If you cannot write a real worked example for a case, cut it rather than padding with a label.

Output MUST be a JSON object with:
{
  "nodeId": string,
  "explanation": string,
  "examples": string[],
  "generatedAt": string,
  "vocabularyLevelUsed": string
}`;

  const userPrompt = `Node ID: ${input.node.id}
Title: "${input.node.title}"
One Line Summary: "${input.node.oneLineSummary}"
Goal Relevance: "${input.node.goalRelevance}"
Vocabulary Level: ${input.vocabularyLevel}
Confusion Flags: ${input.confusionFlags?.join(', ') || 'None'}`;

  return await executeAgent<TeachingAgentInput, NodeContent>({
    agentName: 'TeachingAgent',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: NodeContentSchema,
    temperature: 0.3,
    mockFn: mockOutput
      ? () => ({
        nodeId: input.node.id,
        explanation: mockOutput.explanation || `Comprehensive ${input.vocabularyLevel}-level explanation for ${input.node.title}.`,
        examples: mockOutput.examples || [`Practical example 1 for ${input.node.title}`, `Practical example 2 for ${input.node.title}`],
        generatedAt: new Date().toISOString(),
        vocabularyLevelUsed: input.vocabularyLevel,
      })
      : undefined,
  });
}

// --- Legacy API Adapters (For backward compatibility with legacy streaming endpoints) ---
export async function streamExplanation(
  node: any,
  _calibration: any,
  writeChunk: (chunk: string) => void
): Promise<void> {
  const treeNode: TreeNode = {
    id: node.id || 'node_legacy',
    title: node.title || 'Topic',
    oneLineSummary: node.description || 'Summary',
    goalRelevance: 'Legacy topic explanation',
    prerequisiteIds: node.dependencies || [],
    status: 'in_progress',
    content: null,
    masteryScore: 0,
    depth: 0,
  };

  const result = await runTeachingAgent({
    learnerId: 'legacy_user',
    node: treeNode,
    vocabularyLevel: 'intermediate',
  });

  writeChunk(result.output.explanation);
  if (result.output.examples.length > 0) {
    writeChunk("\n\n### Examples:\n- " + result.output.examples.join("\n- "));
  }
}

export async function streamFollowUpAnswer(
  node: any,
  _calibration: any,
  _history: any[],
  userQuestionOrChunk: string | ((chunk: string) => void),
  writeChunk?: (chunk: string) => void
): Promise<void> {
  const callback = typeof userQuestionOrChunk === 'function' ? userQuestionOrChunk : writeChunk!;
  const question = typeof userQuestionOrChunk === 'string' ? userQuestionOrChunk : 'question';

  try {
    const provider = getModelProvider();
    const text = await provider.generateText(
      `Learner question: "${question}"`,
      `You are Klaivo's AI tutor explaining concept "${node?.title || 'Topic'}". Answer the question clearly and directly.`
    );
    callback(text);
  } catch (err) {
    callback("Sorry, I couldn't generate a response — try asking again.");
  }
}
