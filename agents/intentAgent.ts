import { GoogleGenerativeAI } from '@google/generative-ai';
import { IntentType, IntentAgentOutput } from '../types';

/**
 * Intent Agent - Classifies user prompt into a structured learning category.
 */
export async function classifyIntent(prompt: string): Promise<IntentType> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[IntentAgent] API Key missing. Falling back to stub.');
    return 'learning_goal';
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const systemInstruction = `
    You are an Intent Classification Agent. Classify the user's initial prompt into one of the following learning intents:
    1. 'quick_answer': A single, direct question requiring a simple response.
    2. 'learning_goal': A desire to learn a broad topic from scratch.
    3. 'problem_solving': A specific problem, error, or equation to solve.
    4. 'project_building': A goal to build a physical or digital artifact/project.
    5. 'research': A request to dive deep into papers, facts, or advanced comparative studies.
    6. 'exam_prep': Preparation for a specific standard exam, certificate, or board (e.g. WAEC, SAT, MCAT).
    
    Return a JSON object matching this schema:
    {
      "intent": "quick_answer" | "learning_goal" | "problem_solving" | "project_building" | "research" | "exam_prep",
      "reason": "brief reason for this classification"
    }
  `;

  try {
    const result = await model.generateContent([
      { text: systemInstruction },
      { text: `User Prompt: "${prompt}"` }
    ]);
    const responseText = result.response.text();
    console.log('[IntentAgent] Response:', responseText);
    const data = JSON.parse(responseText) as IntentAgentOutput;
    return data.intent || 'learning_goal';
  } catch (err) {
    console.error('[IntentAgent] API call failed:', err);
    // Simple fallback logic
    const text = prompt.toLowerCase();
    if (text.includes('waec') || text.includes('exam') || text.includes('test')) return 'exam_prep';
    return 'learning_goal';
  }
}
