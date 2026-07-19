import { GoogleGenerativeAI } from '@google/generative-ai';
import { Session, DiagnosisAgentOutput } from '../types';

/**
 * Diagnosis Agent - Context gathering conversation and parameter extraction.
 */
export async function getDiagnosticQuestion(intent: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Welcome to Klaivo! To help you learn "${prompt}", do you have a specific syllabus, exam date, or particular topics you want to focus on? You can paste text or upload a PDF.`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const systemInstruction = `
    You are a Diagnosis Agent. The user wants to start a learning session.
    Goal: "${prompt}"
    Intent: "${intent}"
    
    Formulate a friendly, direct, and intelligent initial diagnostic question to gather context.
    If it's an exam preparation intent, ask if they have a syllabus, past questions, or specific weak areas.
    Keep the question concise and welcoming (under 3 sentences).
  `;

  try {
    const result = await model.generateContent(systemInstruction);
    return result.response.text().trim();
  } catch (err) {
    console.error('[DiagnosisAgent] Error getting initial question:', err);
    return `Welcome to Klaivo! To help you learn "${prompt}", do you have a specific syllabus, exam date, or particular topics you want to focus on? You can paste text or upload a PDF.`;
  }
}

export async function processDiagnosticTurn(
  session: Session,
  userMessage: string,
  attachedDocsText: string
): Promise<DiagnosisAgentOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback stub
    return {
      readyForPath: true,
      feedback: `Perfect, I've analyzed your inputs and goals! I am now generating a personalized concept path for you...`,
      summary: {
        userGoal: session.title,
        intent: session.intent,
        extractedContext: userMessage + (attachedDocsText ? '\n' + attachedDocsText : ''),
        calibration: session.calibration
      }
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

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
    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    console.log('[DiagnosisAgent] Turn Response JSON:', text);
    return JSON.parse(text) as DiagnosisAgentOutput;
  } catch (err) {
    console.error('[DiagnosisAgent] Turn analysis failed:', err);
    return {
      readyForPath: true,
      feedback: `Got it! Let's generate your learning path.`,
      summary: {
        userGoal: session.title,
        intent: session.intent,
        extractedContext: userMessage,
        calibration: session.calibration
      }
    };
  }
}
