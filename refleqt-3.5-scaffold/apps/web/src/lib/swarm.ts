import { initializeSwarm, getSwarm } from '@refleqt/core/research-swarm';
import { initLLM } from './llm';

let initialized = false;

export function initSwarm() {
  if (initialized) return getSwarm();

  initLLM();

  const swarm = initializeSwarm({
    maxAgents: 5,
    maxIterations: 3,
    consensusThreshold: 0.7,
    defaultProvider: 'anthropic',
    timeout: 120000,
  });

  initialized = true;
  return swarm;
}

export { getSwarm };
