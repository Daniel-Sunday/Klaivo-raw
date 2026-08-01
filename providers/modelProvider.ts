import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

function combineAbortSignals(signalA?: AbortSignal, signalB?: AbortSignal): AbortSignal {
  if (typeof (AbortSignal as any).any === 'function' && signalA && signalB) {
    return (AbortSignal as any).any([signalA, signalB]);
  }
  if (!signalA) return signalB || new AbortController().signal;
  if (!signalB) return signalA;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signalA.aborted || signalB.aborted) {
    controller.abort();
  } else {
    signalA.addEventListener('abort', onAbort, { once: true });
    signalB.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

export interface ModelProvider {
  name: string;
  generateJSON<T = any>(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<T>;
  generateText(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<string>;
  streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void>;
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

  async generateJSON<T = any>(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) {
      throw new Error('[GeminiProvider] Execution aborted');
    }
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { signal }
    );
    const text = result.response.text();
    const cleaned = cleanJsonOutput(text);
    return JSON.parse(cleaned) as T;
  }

  async generateText(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<string> {
    if (signal?.aborted) {
      throw new Error('[GeminiProvider] Execution aborted');
    }
    const model = this.ai.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });

    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { signal }
    );
    return result.response.text();
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
    const text = await this.generateText(prompt, systemInstruction, signal);
    onChunk(text);
  }
}

/**
 * Helper to strip markdown code blocks from model JSON outputs
 */
export function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  // 1. Strip markdown code fences if present anywhere
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }
  // 2. Extract outermost JSON object { ... } or array [ ... ] if surrounded by explanatory text
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  return cleaned;
}

/**
 * 2. NVIDIA NIM API Provider (build.nvidia.com)
 * Offers high-performance models (Meta Llama 3.1 70B, Llama 3.3 70B, Llama 3.1 8B)
 * with automated failover for model concurrency limits or API errors.
 */
export class NvidiaNimProvider implements ModelProvider {
  name = 'nvidia-nim';
  private apiKey: string;
  private primaryModel: string;
  private baseUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  // Fallback candidate sequence ordered by reliability and reasoning capability
  // Removed: meta/llama-3.3-70b-instruct (hangs forever, deprecated on NVIDIA)
  // Removed: nvidia/llama-3.1-nemotron-70b-instruct (404 Not Found, delisted)
  private fallbackModels = [
    'meta/llama-3.1-8b-instruct',
    'meta/llama-3.1-70b-instruct',
  ];

  // Per-model timeout (30s) prevents one hanging model from consuming the entire stage timeout
  private perModelTimeoutMs = 30_000;

  constructor(apiKey?: string, modelName = 'meta/llama-3.1-8b-instruct') {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || '';
    this.primaryModel = modelName;
  }

  private getModelCandidates(): string[] {
    const list = [this.primaryModel];
    for (const m of this.fallbackModels) {
      if (!list.includes(m)) {
        list.push(m);
      }
    }
    return list;
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<T> {
    if (!this.apiKey) {
      throw new Error('[NvidiaNimProvider] NVIDIA_API_KEY is missing.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt + '\nRespond ONLY with valid JSON.' });

    const candidates = this.getModelCandidates();
    let lastError: Error | null = null;

    for (const model of candidates) {
      if (signal?.aborted) {
        throw new Error('[NvidiaNimProvider] Execution aborted');
      }
      // Combine per-model timeout with the caller's abort signal so a single
      // hanging model fails fast (30s) instead of burning the full stage timeout
      const modelTimeout = AbortSignal.timeout(this.perModelTimeoutMs);
      const combinedSignal = combineAbortSignals(signal, modelTimeout);
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 4096,
          }),
          signal: combinedSignal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content || '{}';
        const cleaned = cleanJsonOutput(rawContent);
        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        // If the caller's signal was aborted, propagate immediately (stage timeout)
        if (signal?.aborted) {
          throw err;
        }
        // If only the per-model timeout fired, log and try next candidate
        const isModelTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
        console.warn(`[NvidiaNimProvider] Model candidate '${model}' failed: ${err.message}${isModelTimeout ? ` (per-model ${this.perModelTimeoutMs / 1000}s timeout)` : ''}. Trying next candidate...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[NvidiaNimProvider] All model candidates failed.');
  }

  async generateText(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<string> {
    if (!this.apiKey) {
      throw new Error('[NvidiaNimProvider] NVIDIA_API_KEY is missing.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const candidates = this.getModelCandidates();
    let lastError: Error | null = null;

    for (const model of candidates) {
      if (signal?.aborted) {
        throw new Error('[NvidiaNimProvider] Execution aborted');
      }
      const modelTimeout = AbortSignal.timeout(this.perModelTimeoutMs);
      const combinedSignal = combineAbortSignals(signal, modelTimeout);
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 4096,
          }),
          signal: combinedSignal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string') {
          return content;
        }
        throw new Error('Invalid or missing response content structure');
      } catch (err: any) {
        if (signal?.aborted) {
          throw err;
        }
        const isModelTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
        console.warn(`[NvidiaNimProvider] Model candidate '${model}' failed: ${err.message}${isModelTimeout ? ` (per-model ${this.perModelTimeoutMs / 1000}s timeout)` : ''}. Trying next candidate...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[NvidiaNimProvider] All model candidates failed.');
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
    const text = await this.generateText(prompt, systemInstruction, signal);
    onChunk(text);
  }
}

/**
 * 3. NVIDIA Embedding Provider (build.nvidia.com)
 * High-performance 1024-dimension vector embeddings using nvidia/nv-embedqa-e5-v5 (~385ms)
 */
export class NvidiaEmbeddingProvider {
  name = 'nvidia-embedding';
  private apiKey: string;
  private modelName: string;
  private baseUrl = 'https://integrate.api.nvidia.com/v1/embeddings';

  constructor(apiKey?: string, modelName = 'nvidia/nv-embedqa-e5-v5') {
    this.apiKey = apiKey || process.env.NVIDIA_API_KEY || '';
    this.modelName = modelName;
  }

  async generateEmbedding(text: string, inputType: 'passage' | 'query' = 'passage', signal?: AbortSignal): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('[NvidiaEmbeddingProvider] NVIDIA_API_KEY is missing.');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: [text],
        model: this.modelName,
        input_type: inputType,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[NvidiaEmbeddingProvider] HTTP ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    if (data?.data?.[0]?.embedding) {
      return data.data[0].embedding;
    }

    throw new Error('[NvidiaEmbeddingProvider] Invalid embedding response format');
  }
}

// Module-level persistent state for circuit breaker (persists across per-call MultiModelRouter instances)
const providerFailureTimestamps = new Map<string, number>();
const CIRCUIT_BREAKER_COOLDOWN_MS = 30000; // 30s cooldown

/**
 * 4. Multi-Model Provider Router with Failover & Load Balancing & Per-Provider Circuit Breaker
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
      this.providers.push(new NvidiaNimProvider(process.env.NVIDIA_API_KEY, 'meta/llama-3.1-70b-instruct'));
    }

    // Fallback if no keys set: default Gemini instantiation to preserve error handling
    if (this.providers.length === 0) {
      this.providers.push(new GeminiProvider('dummy_key'));
    }
  }

  async generateJSON<T = any>(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<T> {
    let lastError: any = null;
    const now = Date.now();

    let candidateProviders = this.providers.filter((p) => {
      const lastFailure = providerFailureTimestamps.get(p.name) || 0;
      return now - lastFailure >= CIRCUIT_BREAKER_COOLDOWN_MS;
    });

    if (candidateProviders.length === 0) {
      console.warn(`[MultiModelRouter] All providers were on circuit breaker cooldown. Resetting circuit breaker to attempt recovery...`);
      providerFailureTimestamps.clear();
      candidateProviders = this.providers;
    }

    for (const provider of candidateProviders) {
      if (signal?.aborted) {
        throw new Error('[MultiModelRouter] Execution aborted');
      }

      try {
        console.log(`[MultiModelRouter] Routing generateJSON via provider: ${provider.name}`);
        return await provider.generateJSON<T>(prompt, systemInstruction, signal);
      } catch (err: any) {
        if (err.name === 'AbortError' || signal?.aborted) {
          throw err;
        }
        providerFailureTimestamps.set(provider.name, Date.now());
        console.warn(`[MultiModelRouter] Provider ${provider.name} failed: ${err.message}. Failing over...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[MultiModelRouter] All model providers failed or are on circuit breaker cooldown.');
  }

  async generateText(prompt: string, systemInstruction?: string, signal?: AbortSignal): Promise<string> {
    let lastError: any = null;
    const now = Date.now();

    let candidateProviders = this.providers.filter((p) => {
      const lastFailure = providerFailureTimestamps.get(p.name) || 0;
      return now - lastFailure >= CIRCUIT_BREAKER_COOLDOWN_MS;
    });

    if (candidateProviders.length === 0) {
      console.warn(`[MultiModelRouter] All providers were on circuit breaker cooldown. Resetting circuit breaker to attempt recovery...`);
      providerFailureTimestamps.clear();
      candidateProviders = this.providers;
    }

    for (const provider of candidateProviders) {
      if (signal?.aborted) {
        throw new Error('[MultiModelRouter] Execution aborted');
      }

      try {
        console.log(`[MultiModelRouter] Routing generateText via provider: ${provider.name}`);
        return await provider.generateText(prompt, systemInstruction, signal);
      } catch (err: any) {
        if (err.name === 'AbortError' || signal?.aborted) {
          throw err;
        }
        providerFailureTimestamps.set(provider.name, Date.now());
        console.warn(`[MultiModelRouter] Provider ${provider.name} failed: ${err.message}. Failing over...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[MultiModelRouter] All model providers failed or are on circuit breaker cooldown.');
  }

  async streamText(prompt: string, systemInstruction: string, onChunk: (chunk: string) => void, signal?: AbortSignal): Promise<void> {
    const text = await this.generateText(prompt, systemInstruction, signal);
    onChunk(text);
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
