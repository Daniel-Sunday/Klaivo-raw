import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { AgentLog, AgentLogSchema } from '../schemas';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface AgentExecutionOptions<TInput, TOutput> {
  agentName: string;
  learnerId: string;
  systemInstruction: string;
  userPrompt: string;
  inputData: TInput;
  schema: z.ZodType<TOutput>;
  temperature?: number;
  maxRetries?: number;
  modelName?: string;
  mockFn?: (input: TInput) => Partial<TOutput>;
}

export interface AgentResult<TOutput> {
  output: TOutput;
  log: AgentLog;
}

export async function executeAgent<TInput, TOutput>(
  options: AgentExecutionOptions<TInput, TOutput>
): Promise<AgentResult<TOutput>> {
  const {
    agentName,
    learnerId,
    systemInstruction,
    userPrompt,
    inputData,
    schema,
    temperature = 0.2,
    maxRetries = 3,
    modelName = 'gemini-1.5-flash-latest',
    mockFn,
  } = options;

  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  // Mock execution path for isolated testing when flag is set or mockFn is provided without API key
  if (mockFn && (process.env.USE_AGENT_MOCKS === 'true' || !apiKey)) {
    const mockOutput = mockFn(inputData);
    const parseResult = schema.safeParse(mockOutput);
    if (!parseResult.success) {
      throw new Error(`Mock function output for ${agentName} failed schema validation: ${parseResult.error.message}`);
    }

    const log: AgentLog = AgentLogSchema.parse({
      logId,
      agentName,
      learnerId,
      timestamp,
      input: inputData as unknown,
      output: parseResult.data as unknown,
      reasoning: (mockOutput as any)?.reasoning || (mockOutput as any)?.reasoningForLog || "Executed mock handler for agent",
      validationPassed: true,
      retryCount: 0,
    });

    return { output: parseResult.data, log };
  }

  // Real LLM Execution path
  let lastError = '';
  let retryCount = 0;

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
    systemInstruction,
  });

  let currentPrompt = userPrompt;

  while (retryCount <= maxRetries) {
    try {
      const response = await model.generateContent(currentPrompt);
      const rawText = response.response.text();
      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(rawText);
      } catch (jsonErr: any) {
        throw new Error(`Invalid JSON syntax returned by model: ${jsonErr.message}`);
      }

      const validationResult = schema.safeParse(parsedJson);

      if (validationResult.success) {
        const reasoning =
          (parsedJson as any)?.reasoning ||
          (parsedJson as any)?.reasoningForLog ||
          null;

        const log: AgentLog = AgentLogSchema.parse({
          logId,
          agentName,
          learnerId,
          timestamp: new Date().toISOString(),
          input: inputData as unknown,
          output: validationResult.data as unknown,
          reasoning,
          validationPassed: true,
          retryCount,
        });

        return { output: validationResult.data, log };
      }

      lastError = validationResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      retryCount++;
      currentPrompt = `${userPrompt}\n\n[PREVIOUS OUTPUT FAILED VALIDATION]\nYour previous output was invalid:\nError: ${lastError}\nPlease fix these validation errors and return ONLY a valid JSON object matching the exact schema.`;
    } catch (err: any) {
      lastError = err.message;
      retryCount++;
      currentPrompt = `${userPrompt}\n\n[PREVIOUS CALL FAILED]\nError: ${lastError}\nPlease retry and return ONLY valid JSON.`;
    }
  }

  const log: AgentLog = AgentLogSchema.parse({
    logId,
    agentName,
    learnerId,
    timestamp: new Date().toISOString(),
    input: inputData as unknown,
    output: { error: lastError },
    reasoning: `Failed after ${maxRetries} retries. Last error: ${lastError}`,
    validationPassed: false,
    retryCount: maxRetries,
  });

  throw new Error(`Agent [${agentName}] failed validation after ${maxRetries} retries. Last error: ${lastError}`);
}
