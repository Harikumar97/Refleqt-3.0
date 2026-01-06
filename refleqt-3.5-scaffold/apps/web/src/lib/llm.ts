import { initializeLLMRouter, getLLMRouter, type LLMProvider } from '@refleqt/core/llm';

let initialized = false;

export function initLLM() {
  if (initialized) return getLLMRouter();

  const defaultProvider = (process.env.DEFAULT_LLM_PROVIDER as LLMProvider) || 'anthropic';

  const router = initializeLLMRouter({
    anthropic: process.env.ANTHROPIC_API_KEY ? {
      apiKey: process.env.ANTHROPIC_API_KEY,
    } : undefined,
    openai: process.env.OPENAI_API_KEY ? {
      apiKey: process.env.OPENAI_API_KEY,
    } : undefined,
    google: process.env.GOOGLE_AI_API_KEY ? {
      apiKey: process.env.GOOGLE_AI_API_KEY,
    } : undefined,
    defaultProvider,
  });

  initialized = true;
  return router;
}

export { getLLMRouter };
