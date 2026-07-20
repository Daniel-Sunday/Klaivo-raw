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
    1. "question": A follow-up question, request for clarification, asking for help, or asking for another explanation.
    2. "answer": An attempt to answer the assessment question posed for this node.
    
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
    // Fallback keyword-based classification
    const text = content.toLowerCase();
    if (text.includes('explain') || text.includes('what') || text.includes('how') || text.includes('why') || text.includes('help') || text.includes('understand') || text.includes('?') || text.includes('mean')) {
      return 'question';
    }
    return 'answer';
  }
}
