import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface ModelProvider {
  name: string;
  generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T>;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void>;
}

/**
 * 1. Google Gemini Model Provider
 */
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
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void> {
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
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
 * 2. NVIDIA NIM API Provider (build.nvidia.com)
 * Offers ultra-low cost/free high-performance models: meta/llama-3.3-70b-instruct, deepseek-ai/deepseek-r1
 */
export class NvidiaNimProvider implements ModelProvider {
  name = 'nvidia-nim';
  private apiKey: string;
  private modelName: string;
  private baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  constructor(apiKey?: string, modelName = 'meta/llama-3.3-70b-instruct') {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || '';
    this.modelName = modelName;
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('[NvidiaNimProvider] NVIDIA_API_KEY is missing.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt + '\nRespond ONLY with valid JSON.' });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[NvidiaNimProvider] HTTP ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || '{}';
    return JSON.parse(rawContent) as T;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('[NvidiaNimProvider] NVIDIA_API_KEY is missing.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[NvidiaNimProvider] HTTP ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void> {
    const text = await this.generateText(prompt, systemInstruction);
    onChunk(text);
  }
}

/**
 * 3. Multi-Model Provider Router with Failover & Load Balancing
 */
export class MultiModelRouter implements ModelProvider {
  name = 'multi-model-router';
  private providers: ModelProvider[] = [];

  constructor() {
    // 1. Primary: Gemini Provider if GEMINI_API_KEY exists
    if (process.env.GEMINI_API_KEY) {
      this.providers.push(new GeminiProvider());
    }

    // 2. Secondary/High-Performance: NVIDIA NIM build.nvidia.com provider
    if (process.env.NVIDIA_API_KEY) {
      this.providers.push(new NvidiaNimProvider(process.env.NVIDIA_API_KEY, 'meta/llama-3.3-70b-instruct'));
      this.providers.push(new NvidiaNimProvider(process.env.NVIDIA_API_KEY, 'deepseek-ai/deepseek-r1'));
    }

    // Fallback if no keys set: default Gemini instantiation to preserve error handling
    if (this.providers.length === 0) {
      this.providers.push(new GeminiProvider('dummy_key'));
    }
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
    let lastError: any = null;

    for (const provider of this.providers) {
      try {
        console.log(`[MultiModelRouter] Routing generateJSON via provider: ${provider.name}`);
        return await provider.generateJSON<T>(prompt, systemInstruction);
      } catch (err: any) {
        console.warn(`[MultiModelRouter] Provider ${provider.name} failed: ${err.message}. Failing over...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[MultiModelRouter] All model providers failed.');
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    let lastError: any = null;

    for (const provider of this.providers) {
      try {
        console.log(`[MultiModelRouter] Routing generateText via provider: ${provider.name}`);
        return await provider.generateText(prompt, systemInstruction);
      } catch (err: any) {
        console.warn(`[MultiModelRouter] Provider ${provider.name} failed: ${err.message}. Failing over...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[MultiModelRouter] All model providers failed.');
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void): Promise<void> {
    const primary = this.providers[0];
    try {
      await primary.streamText(prompt, systemInstruction, onChunk);
    } catch (err) {
      const fallbackText = await this.generateText(prompt, systemInstruction);
      onChunk(fallbackText);
    }
  }
}

/**
 * Factory function to retrieve active model provider / multi-model router
 */
export function getModelProvider(providerName?: string): ModelProvider {
  if (providerName && providerName !== 'multi') {
    if (providerName === 'nvidia') {
      return new NvidiaNimProvider();
    }
    return new GeminiProvider(undefined, providerName);
  }

  return new MultiModelRouter();
}
