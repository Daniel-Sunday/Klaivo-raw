import { getModelProvider } from '../providers/modelProvider';
import { CurriculumNode, RoutingClassification, RoutingAgentOutput } from '../types';

type NodeTemplate = Omit<CurriculumNode, 'session_id'>;

/**
 * Ruflo-Supercharged Fast-Path Swarm Router
 * Classifies if a user message is a follow-up question or an assessment answer hypothesis.
 */
export async function classifyMessageIntent(node: NodeTemplate, content: string): Promise<RoutingClassification> {
  const systemInstruction = `
    You are Klaivo's Ruflo Fast-Path Swarm Router.
    The user is currently interacting with concept node: "${node.title}" (${node.description}).
    
    CLASSIFICATION TARGETS:
    1. "question": Expressing confusion, asking for help/clarification, asking for code examples, requesting simpler terms, or saying "I don't get this".
    2. "answer": Attempting an assessment response, offering a solution hypothesis, answering a prompt, or explaining a mechanism (even if phrased as a question).

    FEW-SHOT CALIBRATION EXAMPLES:
    - User: "I don't understand how event loop callbacks get pushed to queue." -> "question"
    - User: "Could you clarify what non-blocking means here?" -> "question"
    - User: "Is it because callback functions are delegated to libuv worker threads?" -> "answer"
    - User: "Because the main thread executes sync code before microtask queue runs." -> "answer"
    - User: "I think the result will be 42 because x was incremented." -> "answer"

    CRITICAL DISAMBIGUATION RULE:
    - If user asks for explanation or expresses difficulty -> MUST BE "question".
    - If user proposes a technical mechanism, hypothesis, or solution to the concept challenge -> MUST BE "answer".

    Return JSON:
    {
      "classification": "question" | "answer",
      "reason": "brief rationale"
    }
  `;

  // Deterministic fast-path regex check before LLM call to save latency when obvious
  const lowerText = content.trim().toLowerCase();
  const explicitQuestionPhrases = [
    'dont understand', "don't understand", 'do not understand',
    'what do you mean', 'what does that mean', 'please explain', 'can you clarify',
    'help me', 'im confused', "i'm confused", 'im lost', "i'm lost",
    'give me an example', 'show me code', 'can you rephrase'
  ];

  if (explicitQuestionPhrases.some((phrase) => lowerText.includes(phrase))) {
    return 'question';
  }

  try {
    const provider = getModelProvider();
    const data = await provider.generateJSON<RoutingAgentOutput>(
      `User Message: "${content}"`,
      systemInstruction
    );
    return data.classification || 'answer';
  } catch (err) {
    console.error('[RoutingAgent] Classification error, using fast-path fallback:', err);
    // Enhanced fast-path fallback logic
    const answerIndicators = ['because', 'i think', 'it is', 'result is', 'is it', 'due to', 'value of'];
    if (answerIndicators.some((kw) => lowerText.includes(kw))) {
      return 'answer';
    }
    return 'answer';
  }
}
