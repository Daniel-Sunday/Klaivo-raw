import { GoogleGenerativeAI } from '@google/generative-ai';
import { CurriculumNode, Calibration, AssessmentAgentOutput } from '../types';

type NodeTemplate = Omit<CurriculumNode, 'session_id'>;

/**
 * Assessment & Reflection Agent
 * Grades user responses and suggests calibration updates.
 */
export async function assessAnswer(
  node: NodeTemplate,
  calibration: Calibration,
  answer: string
): Promise<AssessmentAgentOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackAssessment(node, calibration, answer);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const systemInstruction = `
    You are the Assessment & Reflection Agent for Klaivo.
    Your job is to grade the user's answer to the assessment question posed in the teaching material.
    
    Concept Node:
    - Title: "${node.title}"
    - Description: "${node.description}"
    
    Learner Calibration:
    - Current Level: "${calibration.level}"
    - Known Concepts: ${JSON.stringify(calibration.known_concepts)}
    
    User's Answer: "${answer}"
    
    Instructions:
    1. Evaluate if the user's answer is correct and demonstrates real understanding (application, not just recall).
    2. Write a feedback response in "feedback" using Markdown. Be encouraging. If correct, validate their thinking. If incorrect, give a clear explanation and guide them to the correct reasoning without giving away the direct answer.
    3. Return a JSON object matching this schema:
    {
      "passed": boolean,
      "feedback": "Your markdown formatted feedback and grading explanation",
      "calibration_update": {
        "level_delta": number, // e.g. 0.15 if they passed, -0.05 if they failed
        "add_known": ["specific sub-concept name mastered"], // empty if failed
        "add_weak_points": ["specific concept struggle point"] // empty if passed
      }
    }
  `;

  try {
    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    console.log('[AssessmentAgent] API Grading JSON:', text);
    return JSON.parse(text) as AssessmentAgentOutput;
  } catch (err) {
    console.error('[AssessmentAgent] API call failed, falling back to stub:', err);
    return getFallbackAssessment(node, calibration, answer);
  }
}

function getFallbackAssessment(node: NodeTemplate, calibration: Calibration, answer: string): AssessmentAgentOutput {
  const text = answer.toLowerCase();
  const passed = text.length > 8 && 
                 !text.includes("don't know") && 
                 !text.includes("dont know") && 
                 !text.includes("idk") && 
                 !text.includes("help");
  const feedback = passed
    ? `Good job! Your explanation for **${node.title}** shows you understand the material. Let's move forward.`
    : `Your answer is a bit too short or missing details. Remember to explain *why* and give specific examples! Try again.`;
  const conceptLearned = node.title;

  return {
    passed,
    feedback,
    calibration_update: passed ? {
      level_delta: 0.15,
      add_known: [conceptLearned],
      add_weak_points: []
    } : {
      level_delta: -0.05,
      add_known: [],
      add_weak_points: [`Struggled with basics of ${node.title}`]
    }
  };
}
