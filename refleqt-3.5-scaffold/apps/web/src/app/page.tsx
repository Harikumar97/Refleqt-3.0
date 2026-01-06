import { Card, Button, PageHeader } from '@refleqt/ui';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Welcome to Refleqt 3.5"
          description="AI-powered self-reflection and personal growth"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card
            title="Research Swarm"
            description="Multi-agent research system for deep analysis"
            footer={
              <Button variant="primary" href="/research">
                Start Research
              </Button>
            }
          >
            <p className="text-gray-400">
              Deploy a swarm of AI agents to research any topic with comprehensive analysis.
            </p>
          </Card>

          <Card
            title="Intelligence Metrics"
            description="Track your growth and progress"
            footer={
              <Button variant="secondary" href="/metrics">
                View Metrics
              </Button>
            }
          >
            <p className="text-gray-400">
              Monitor your intelligence scores across multiple dimensions.
            </p>
          </Card>

          <Card
            title="Analytics Dashboard"
            description="Insights and performance data"
            footer={
              <Button variant="outline" href="/analytics">
                Open Dashboard
              </Button>
            }
          >
            <p className="text-gray-400">
              Comprehensive analytics on usage patterns and system performance.
            </p>
          </Card>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Refleqt 3.5 - Reorganized Monorepo Architecture</p>
          <p className="text-sm mt-2">
            Built with Next.js 15, React 19, Turborepo, and multi-provider LLM support
          </p>
        </div>
      </div>
    </main>
  );
}
