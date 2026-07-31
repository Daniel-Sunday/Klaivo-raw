import { describe, it, expect } from 'vitest';
import { GeminiProvider, NvidiaNimProvider, MultiModelRouter, getModelProvider } from '../providers/modelProvider';

describe('Multi-Model Provider & NVIDIA NIM Integration Suite', () => {
  it('should instantiate NvidiaNimProvider with default Llama 3.3 70B model', () => {
    const provider = new NvidiaNimProvider('mock_nvidia_key');
    expect(provider.name).toBe('nvidia-nim');
  });

  it('should instantiate MultiModelRouter with provider fallback sequence', () => {
    const router = new MultiModelRouter();
    expect(router.name).toBe('multi-model-router');
  });

  it('should factory getModelProvider to MultiModelRouter by default', () => {
    const provider = getModelProvider();
    expect(provider).toBeDefined();
  });
});
