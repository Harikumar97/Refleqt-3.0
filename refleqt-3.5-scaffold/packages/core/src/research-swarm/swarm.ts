import type { SwarmConfig, SwarmTask, SwarmAgent, AgentResult, SwarmStatus, AgentRole, SwarmProgress } from './types';
import type { LLMProvider } from '../llm/types';
import { getLLMRouter } from '../llm/router';
import { buildAgentPrompt } from './prompts';

const DEFAULT_CONFIG: SwarmConfig = {
  maxAgents: 5,
  maxIterations: 3,
  consensusThreshold: 0.7,
  defaultProvider: 'anthropic',
  timeout: 120000,
};

export class ResearchSwarm {
  private config: SwarmConfig;
  private tasks: Map<string, SwarmTask> = new Map();
  private progressCallbacks: Map<string, (progress: SwarmProgress) => void> = new Map();

  constructor(config?: Partial<SwarmConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async startResearch(query: string, options?: { provider?: LLMProvider }): Promise<SwarmTask> {
    const taskId = this.generateTaskId();
    const provider = options?.provider ?? this.config.defaultProvider;

    const agents = this.createAgentTeam(provider);

    const task: SwarmTask = {
      id: taskId,
      query,
      agents,
      status: 'initializing',
      results: [],
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);
    this.emitProgress(task, 'Initializing swarm');

    this.executeResearch(task).catch(error => {
      task.status = 'error';
      console.error(`Swarm task ${taskId} failed:`, error);
    });

    return task;
  }

  private createAgentTeam(provider: LLMProvider): SwarmAgent[] {
    const roles: AgentRole[] = ['orchestrator', 'researcher', 'analyst', 'critic', 'synthesizer'];

    return roles.slice(0, this.config.maxAgents).map((role, index) => ({
      id: `agent-${index}-${role}`,
      role,
      provider,
      systemPrompt: buildAgentPrompt(role),
      status: 'idle',
    }));
  }

  private async executeResearch(task: SwarmTask): Promise<void> {
    const router = getLLMRouter();
    task.status = 'running';

    const orchestrator = task.agents.find(a => a.role === 'orchestrator');
    if (orchestrator) {
      orchestrator.status = 'working';
      this.emitProgress(task, 'Orchestrator planning research');

      const planResult = await router.complete(
        [
          { role: 'system', content: orchestrator.systemPrompt },
          { role: 'user', content: `Research query: ${task.query}\n\nCreate a research plan with specific sub-tasks for the team.` },
        ],
        { provider: orchestrator.provider }
      );

      task.results.push({
        agentId: orchestrator.id,
        role: 'orchestrator',
        content: planResult.content,
        confidence: 0.9,
        timestamp: new Date(),
      });

      orchestrator.status = 'done';
    }

    const researchers = task.agents.filter(a => a.role === 'researcher');
    for (const researcher of researchers) {
      researcher.status = 'working';
      this.emitProgress(task, `Researcher ${researcher.id} investigating`);

      const researchResult = await router.complete(
        [
          { role: 'system', content: researcher.systemPrompt },
          { role: 'user', content: `Research query: ${task.query}\n\nInvestigate this topic and provide detailed findings.` },
        ],
        { provider: researcher.provider }
      );

      task.results.push({
        agentId: researcher.id,
        role: 'researcher',
        content: researchResult.content,
        confidence: 0.85,
        timestamp: new Date(),
      });

      researcher.status = 'done';
    }

    const analyst = task.agents.find(a => a.role === 'analyst');
    if (analyst) {
      analyst.status = 'working';
      this.emitProgress(task, 'Analyst processing findings');

      const findings = task.results.filter(r => r.role === 'researcher').map(r => r.content).join('\n\n---\n\n');

      const analysisResult = await router.complete(
        [
          { role: 'system', content: analyst.systemPrompt },
          { role: 'user', content: `Research findings:\n${findings}\n\nAnalyze these findings and provide insights.` },
        ],
        { provider: analyst.provider }
      );

      task.results.push({
        agentId: analyst.id,
        role: 'analyst',
        content: analysisResult.content,
        confidence: 0.88,
        timestamp: new Date(),
      });

      analyst.status = 'done';
    }

    const critic = task.agents.find(a => a.role === 'critic');
    if (critic) {
      critic.status = 'working';
      this.emitProgress(task, 'Critic reviewing work');

      const allWork = task.results.map(r => `[${r.role}]: ${r.content}`).join('\n\n---\n\n');

      const critiqueResult = await router.complete(
        [
          { role: 'system', content: critic.systemPrompt },
          { role: 'user', content: `Review this research work:\n${allWork}\n\nProvide critical feedback and identify gaps.` },
        ],
        { provider: critic.provider }
      );

      task.results.push({
        agentId: critic.id,
        role: 'critic',
        content: critiqueResult.content,
        confidence: 0.82,
        timestamp: new Date(),
      });

      critic.status = 'done';
    }

    const synthesizer = task.agents.find(a => a.role === 'synthesizer');
    if (synthesizer) {
      synthesizer.status = 'working';
      this.emitProgress(task, 'Synthesizer creating final report');

      const allResults = task.results.map(r => `[${r.role}]: ${r.content}`).join('\n\n---\n\n');

      const synthesisResult = await router.complete(
        [
          { role: 'system', content: synthesizer.systemPrompt },
          { role: 'user', content: `Original query: ${task.query}\n\nAll agent contributions:\n${allResults}\n\nCreate a comprehensive synthesis.` },
        ],
        { provider: synthesizer.provider }
      );

      task.synthesis = synthesisResult.content;

      task.results.push({
        agentId: synthesizer.id,
        role: 'synthesizer',
        content: synthesisResult.content,
        confidence: 0.9,
        timestamp: new Date(),
      });

      synthesizer.status = 'done';
    }

    task.status = 'completed';
    task.completedAt = new Date();
    this.emitProgress(task, 'Research complete');
  }

  getTask(taskId: string): SwarmTask | undefined {
    return this.tasks.get(taskId);
  }

  onProgress(taskId: string, callback: (progress: SwarmProgress) => void): void {
    this.progressCallbacks.set(taskId, callback);
  }

  private emitProgress(task: SwarmTask, phase: string): void {
    const callback = this.progressCallbacks.get(task.id);
    if (callback) {
      callback({
        taskId: task.id,
        status: task.status,
        completedAgents: task.agents.filter(a => a.status === 'done').length,
        totalAgents: task.agents.length,
        currentPhase: phase,
      });
    }
  }

  private generateTaskId(): string {
    return `swarm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

let swarmInstance: ResearchSwarm | null = null;

export function initializeSwarm(config?: Partial<SwarmConfig>): ResearchSwarm {
  swarmInstance = new ResearchSwarm(config);
  return swarmInstance;
}

export function getSwarm(): ResearchSwarm {
  if (!swarmInstance) {
    throw new Error('Research Swarm not initialized. Call initializeSwarm first.');
  }
  return swarmInstance;
}
