import { z } from 'zod';
import { executeAgent, AgentResult } from './agentUtils';
import { NodeContentSchema, NodeContent, TreeNode, VocabularyLevel, ChatMessageEntry, LearnerGoal } from '../schemas';
import { getModelProvider } from '../providers/modelProvider';

export interface TeachingAgentInput {
  learnerId: string;
  node: TreeNode;
  vocabularyLevel: VocabularyLevel;
  confusionFlags?: string[];
  forceRegenerate?: boolean;
  chatHistory?: ChatMessageEntry[];
  learnerGoal?: LearnerGoal;
  masteredPrerequisites?: string[];
  pedagogicalStance?: 'direct_instruction' | 'socratic_guided' | 'worked_example_focus' | 'remediation';
}

export async function runTeachingAgent(
  input: TeachingAgentInput,
  mockOutput?: Partial<NodeContent>,
  signal?: AbortSignal
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

  const domainContext = input.learnerGoal?.domain && input.learnerGoal.domain !== 'General'
    ? `Learner Domain: "${input.learnerGoal.domain}". Specific Objective: "${input.learnerGoal.specificObjective}". Adapt analogies or worked scenarios to this domain naturally when helpful.`
    : 'Adapt examples to practical, relatable scenarios.';

  const prerequisiteContext = input.masteredPrerequisites && input.masteredPrerequisites.length > 0
    ? `Mastered Prerequisite Concepts: ${input.masteredPrerequisites.join(', ')}. Reference or build upon these concepts explicitly where appropriate.`
    : 'No prerequisite concepts logged yet.';

  const recentHistoryText = input.chatHistory && input.chatHistory.length > 0
    ? input.chatHistory.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : 'None';

  const systemInstruction = `You are Klaivo's SOTA Teaching Agent, explaining concepts like an elite professor in office hours — direct, precise, building genuine understanding rather than superficial customer support bot reassurance.

PEDAGOGICAL REPERTOIRE (NOT A MANDATORY TEMPLATE):
You have access to optional pedagogical fields:
- "coreConcept": A single-sentence thesis statement summarizing the core idea.
- "anchorAnalogy": A natural, domain-aligned real-world analogy.
- "workedExample": A structured object with { "problem", "stepByStepSolution", "commonMistake", "whyMistakeFails" }.
- "checkForUnderstanding": A micro active-learning question object with { "question", "hint", "answer" }.
- "commonMisconceptions": An array of specific mental model traps debunked.

CRITICAL INSTRUCTION FOR OPTIONAL FIELDS:
You decide PER NODE which optional fields earn their place given the specific content and learner state.
OMIT any optional field that would feel forced, fabricated, or unnatural (e.g. for simple definitional nodes, procedural steps, or basic terminology).
These fields are a repertoire to draw from contextually, NOT a mandatory checklist to fill every time.

CONTINUOUS VOCABULARY CALIBRATION:
Treat vocabularyLevel: "${input.vocabularyLevel}" as a reference point on a continuous calibration spectrum (adapting register, depth, and formality in real time) rather than a rigid bucket.
- Beginner reference: Grounded explanations, intuitive domain analogies, zero unintroduced jargon.
- Intermediate reference: Mechanistic precision, trade-off analysis, practical problem-solving.
- Advanced reference: Architectural/mathematical guarantees, failure modes, subtle boundary conditions.

STRICT BANNED BEHAVIORS:
- FORCED OR MANUFACTURED ANALOGIES, MISCONCEPTIONS, OR CHECKPOINTS on nodes that do not warrant them (e.g. simple definitions). Omit unneeded optional fields cleanly.
- Reassurance preambles ("Don't worry, this is easy!").
- Filler transitions ("Now let me explain...", "Great, let's dive into...").
- Unearned assertions or flat bullet lists without explaining WHY mechanics work.
- Ignoring confusionFlags: If confusionFlags exist (${input.confusionFlags?.join(', ') || 'None'}), address the named misconceptions directly with contrastive explanations ("Mistaken Intuition vs Actual Mechanism").

REQUIRED OUTPUT FIELDS:
- "nodeId": string
- "explanation": string (REQUIRED — main explanation body, step-by-step reasoning)
- "examples": string[] (REQUIRED — array of short worked cases/examples, default empty array if unneeded)
- "generatedAt": ISO string
- "vocabularyLevelUsed": string
Optional fields (include only if genuinely useful): "coreConcept", "anchorAnalogy", "workedExample", "checkForUnderstanding", "commonMisconceptions".`;

  const userPrompt = `Node ID: ${input.node.id}
Title: "${input.node.title}"
One Line Summary: "${input.node.oneLineSummary}"
Goal Relevance: "${input.node.goalRelevance}"
Vocabulary Level Reference: ${input.vocabularyLevel}
${domainContext}
${prerequisiteContext}
Confusion Flags: ${input.confusionFlags?.join(', ') || 'None'}
Recent Session Transcript:
${recentHistoryText}`;

  return await executeAgent<TeachingAgentInput, NodeContent>({
    agentName: 'TeachingAgent',
    learnerId: input.learnerId,
    systemInstruction,
    userPrompt,
    inputData: input,
    schema: NodeContentSchema,
    temperature: 0.3,
    signal,
    mockFn: mockOutput
      ? () => ({
        nodeId: input.node.id,
        explanation: mockOutput.explanation || `Comprehensive ${input.vocabularyLevel}-level explanation for ${input.node.title}.`,
        examples: mockOutput.examples || [`Practical example 1 for ${input.node.title}`, `Practical example 2 for ${input.node.title}`],
        generatedAt: new Date().toISOString(),
        vocabularyLevelUsed: input.vocabularyLevel,
        coreConcept: mockOutput.coreConcept,
        anchorAnalogy: mockOutput.anchorAnalogy,
        workedExample: mockOutput.workedExample,
        checkForUnderstanding: mockOutput.checkForUnderstanding,
        commonMisconceptions: mockOutput.commonMisconceptions,
      })
      : undefined,
  });
}

// --- Legacy & Multi-Turn Streaming API Adapters ---
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

  if (result.output.coreConcept) {
    writeChunk(`**Core Concept:** ${result.output.coreConcept}\n\n`);
  }
  if (result.output.anchorAnalogy) {
    writeChunk(`> 💡 **Analogy:** ${result.output.anchorAnalogy}\n\n`);
  }

  writeChunk(result.output.explanation);

  if (result.output.examples && result.output.examples.length > 0) {
    writeChunk('\n\n### Practical Examples:\n- ' + result.output.examples.join('\n- '));
  }

  if (result.output.workedExample) {
    const we = result.output.workedExample;
    writeChunk(`\n\n### Worked Example:\n**Problem:** ${we.problem}\n**Solution:** ${we.stepByStepSolution}\n⚠️ **Common Pitfall:** ${we.commonMistake} (${we.whyMistakeFails})`);
  }

  if (result.output.checkForUnderstanding) {
    const cfu = result.output.checkForUnderstanding;
    writeChunk(`\n\n🎯 **Check Your Understanding:**\n${cfu.question}\n*(Hint: ${cfu.hint})*`);
  }
}

export async function streamFollowUpAnswer(
  node: any,
  _calibration: any,
  history: ChatMessageEntry[] | any[],
  userQuestionOrChunk: string | ((chunk: string) => void),
  writeChunk?: (chunk: string) => void
): Promise<void> {
  const callback = typeof userQuestionOrChunk === 'function' ? userQuestionOrChunk : writeChunk!;
  const question = typeof userQuestionOrChunk === 'string' ? userQuestionOrChunk : 'question';

  const sanitizedHistory: ChatMessageEntry[] = Array.isArray(history)
    ? history.filter(h => h && typeof h.content === 'string').map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.content),
      }))
    : [];

  const historyContextText = sanitizedHistory.length > 0
    ? sanitizedHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : 'No prior turn transcript.';

  const systemInstruction = `You are Klaivo's SOTA Socratic AI Tutor assisting a learner on node "${node?.title || 'Topic'}".
Your goal is to answer the learner's follow-up question accurately, grounded strictly in the topic's context.

SOCRATIC & PEDAGOGICAL DIRECTIVES:
- Direct & Clear: Answer the specific question directly without evasive fluff.
- Contextual Grounding: If the learner asks about a detail from the explanation, connect your answer to the mechanics of ${node?.title || 'this concept'}.
- Socratic Guidance: If the user asks a conceptual question where guiding them with a quick follow-up hint helps them make the final connection, include a brief guiding micro-prompt at the end.
- No Bot Preambles: Do not say "Great question!" or "Sure, I'd be happy to explain!". Start immediately with the answer.`;

  const prompt = `Topic Node: "${node?.title || 'Topic'}"
Summary: "${node?.description || node?.oneLineSummary || ''}"

Session Transcript:
${historyContextText}

Learner Question: "${question}"`;

  try {
    const provider = getModelProvider();
    const text = await provider.generateText(prompt, systemInstruction);
    callback(text);
  } catch (err) {
    console.error('[streamFollowUpAnswer] Error generating follow-up answer:', err);
    callback("Sorry, I encountered an issue generating a response — please ask your question again.");
  }
}
