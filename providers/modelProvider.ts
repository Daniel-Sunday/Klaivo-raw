import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModelProvider {
  name: string;
  generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T>;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void>;
}

export class GeminiProvider implements ModelProvider {
  name = 'gemini';
  private ai: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = 'gemini-3.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('[GeminiProvider] GEMINI_API_KEY is not set in environment.');
    }
    this.ai = new GoogleGenerativeAI(key);
    this.modelName = process.env.GEMINI_MODEL || modelName;
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void> {
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction
    });

    const responseStream = await model.generateContentStream(prompt);
    for await (const chunk of responseStream.stream) {
      const text = chunk.text();
      if (text) {
        onChunk(text);
      }
    }
  }
}

/**
 * Factory function to retrieve active model provider based on process.env.LLM_PROVIDER
 */
export function getModelProvider(providerName?: string): ModelProvider {
  const name = providerName || process.env.LLM_PROVIDER || 'gemini';
  switch (name.toLowerCase()) {
    case 'gemini':
    default:
      return new GeminiProvider();
  }
}
