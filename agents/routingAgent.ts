import { getModelProvider } from '../providers/modelProvider';
import { CurriculumNode, RoutingClassification, RoutingAgentOutput } from '../types';

type NodeTemplate = Omit<CurriculumNode, 'session_id'>;

/**
 * Routing Agent
 * Classifies if a user message is a follow-up question or an assessment answer.
 */
export async function classifyMessageIntent(node: NodeTemplate, content: string): Promise<RoutingClassification> {
  const systemInstruction = `
    You are a message router for Klaivo, an adaptive learning app.
    The user is studying the concept node: "${node.title}" (${node.description}).
    
    Classify whether the user's message is:
    1. "question": A follow-up question, request for clarification, asking for help, expressing confusion ("I don't understand", "what do you mean?"), or asking for another explanation.
    2. "answer": An attempt to answer or explain the assessment question/problem posed for this node (including tentative answers like "Is it because...", "I think...", "It means...").
    
    CRITICAL RULE:
    - Expression of confusion or asking for help/explanation ("I don't understand", "what do you mean", "please explain", "can you clarify", "I'm lost", "what is this") MUST be classified as "question".
    - Conceptual answers, hypotheses, or explanations—EVEN IF formatted as a question ("Is it because...", "Could it be...", "Because of...", "The answer is...", "Does it form...") MUST be classified as "answer".
    
    Return a JSON object matching this schema:
    {
      "classification": "question" | "answer",
      "reason": "brief reason for classification"
    }
  `;

  try {
    const provider = getModelProvider();
    const data = await provider.generateJSON<RoutingAgentOutput>(
      `User Message: "${content}"`,
      systemInstruction
    );
    return data.classification || 'answer';
  } catch (err) {
    console.error('[RoutingAgent] Classification error:', err);
    // Fallback classification logic
    const text = content.toLowerCase();
    const confusionPhrases = [
      'dont understand', "don't understand", 'do not understand',
      'what do you mean', 'what does that mean', 'explain', 'clarify',
      'help', 'confused', 'im lost', "i'm lost", 'what is', 'how does'
    ];
    if (confusionPhrases.some((phrase) => text.includes(phrase))) {
      return 'question';
    }
    return 'answer';
  }
}
