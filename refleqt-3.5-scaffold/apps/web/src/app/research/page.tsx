'use client';

import { useState } from 'react';
import { Card, Button, PageHeader, LoadingSpinner } from '@refleqt/ui';

interface ResearchResult {
  role: string;
  content: string;
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults([]);
    setSynthesis(null);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setSynthesis(data.synthesis || null);
    } catch (error) {
      console.error('Research failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Research Swarm"
          description="Deploy AI agents to research any topic"
        />

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-2">
                Research Query
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research topic..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading || !query.trim()}>
              {isLoading ? 'Researching...' : 'Start Research'}
            </Button>
          </form>
        </Card>

        {isLoading && (
          <div className="mt-8">
            <LoadingSpinner message="Agents are researching..." />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">Agent Findings</h2>
            {results.map((result, index) => (
              <Card key={index} title={result.role}>
                <p className="text-gray-300 whitespace-pre-wrap">{result.content}</p>
              </Card>
            ))}
          </div>
        )}

        {synthesis && (
          <Card className="mt-8" title="Synthesis">
            <p className="text-gray-300 whitespace-pre-wrap">{synthesis}</p>
          </Card>
        )}
      </div>
    </main>
  );
}
