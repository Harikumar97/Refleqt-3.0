import type { LLMProvider } from '../llm/types';

export type SwarmStatus = 'idle' | 'initializing' | 'running' | 'completed' | 'error';
export type AgentRole = 'orchestrator' | 'researcher' | 'analyst' | 'critic' | 'synthesizer';

export interface SwarmAgent {
  id: string;
  role: AgentRole;
  provider: LLMProvider;
  model?: string;
  systemPrompt: string;
  status: 'idle' | 'working' | 'done' | 'error';
}

export interface SwarmTask {
  id: string;
  query: string;
  agents: SwarmAgent[];
  status: SwarmStatus;
  results: AgentResult[];
  synthesis?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentResult {
  agentId: string;
  role: AgentRole;
  content: string;
  confidence: number;
  sources?: string[];
  timestamp: Date;
}

export interface SwarmConfig {
  maxAgents: number;
  maxIterations: number;
  consensusThreshold: number;
  defaultProvider: LLMProvider;
  timeout: number;
}

export interface SwarmProgress {
  taskId: string;
  status: SwarmStatus;
  completedAgents: number;
  totalAgents: number;
  currentPhase: string;
}
