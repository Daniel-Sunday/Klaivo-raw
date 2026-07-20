import { getModelProvider } from '../providers/modelProvider';
import { Session, DiagnosisAgentOutput } from '../types';

/**
 * Diagnosis Agent - Context gathering conversation and parameter extraction.
 */
export async function getDiagnosticQuestion(intent: string, prompt: string): Promise<string> {
  const fallback = `Welcome to Klaivo! To help you learn "${prompt}", do you have a specific syllabus, exam date, or particular topics you want to focus on? You can paste text or upload a PDF.`;

  const systemInstruction = `
    You are a Diagnosis Agent. The user wants to start a learning session.
    Goal: "${prompt}"
    Intent: "${intent}"
    
    Formulate a friendly, direct, and intelligent initial diagnostic question to gather context.
    If it's an exam preparation intent, ask if they have a syllabus, past questions, or specific weak areas.
    Keep the question concise and welcoming (under 3 sentences).
  `;

  try {
    const provider = getModelProvider();
    const result = await provider.generateText(prompt, systemInstruction);
    return result.trim() || fallback;
  } catch (err) {
    console.error('[DiagnosisAgent] Error getting initial question:', err);
    return fallback;
  }
}

export async function processDiagnosticTurn(
  session: Session,
  userMessage: string,
  attachedDocsText: string
): Promise<DiagnosisAgentOutput> {
  const fallbackOutput: DiagnosisAgentOutput = {
    readyForPath: true,
    feedback: `Got it! Let's generate your learning path.`,
    summary: {
      userGoal: session.title,
      intent: session.intent,
      extractedContext: userMessage + (attachedDocsText ? '\n' + attachedDocsText : ''),
      calibration: session.calibration
    }
  };

  const systemInstruction = `
    You are the Diagnosis Agent for Klaivo, an AI-powered adaptive learning platform.
    Your job is to analyze the conversation and any uploaded documents, and determine if we have enough context to generate a structured learning graph path for the user's goal.
    
    If the user has provided answers, pasted a syllabus, uploaded a document, or simply answered your question, set "readyForPath" to true.
    If the user is extremely vague and you need one more turn of clarification, you can set "readyForPath" to false and provide a follow-up question in "feedback".
    
    Context:
    - User Target Goal: "${session.title}"
    - Classification Intent: "${session.intent}"
    - Current Calibration: ${JSON.stringify(session.calibration)}
    - User Message: "${userMessage}"
    - Extracted Document Text: "${attachedDocsText || '(None)'}"
    
    Return a JSON object:
    {
      "readyForPath": boolean,
      "feedback": "Feedback message to user (e.g. 'Syllabus analyzed. Let\\'s build your path...' or a follow-up diagnostic question if not ready)",
      "summary": {
        "userGoal": "summarized final goal of the user",
        "intent": "learning intent",
        "extractedContext": "summary of topics, syllabus, or focus areas from the input",
        "calibration": {
          "level": "beginner" | "intermediate" | "advanced",
          "known_concepts": ["concept1", "concept2"],
          "weak_points": ["weak1", "weak2"]
        }
      }
    }
  `;

  try {
    const provider = getModelProvider();
    const output = await provider.generateJSON<DiagnosisAgentOutput>(
      `User message: ${userMessage}`,
      systemInstruction
    );
    console.log('[DiagnosisAgent] Turn Response JSON:', output);
    return output;
  } catch (err) {
    console.error('[DiagnosisAgent] Turn analysis failed:', err);
    return fallbackOutput;
  }
}
