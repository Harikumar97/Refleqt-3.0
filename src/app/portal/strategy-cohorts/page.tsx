"use client";

/**
 * Strategy Cohorts Page
 * Comprehensive competitive analysis with AI-powered multi-agent swarms
 */

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCreateCohort,
  useGetCohort,
  useAddCompetitor,
  useUpdateCohort,
} from "@/lib/strategy-cohorts/hooks";
import CompetitorDiscovery from "@/components/strategy-cohorts/CompetitorDiscovery";
import CompetitorGrid from "@/components/strategy-cohorts/CompetitorGrid";
import AnalysisConfig, {
  type AnalysisConfiguration,
} from "@/components/strategy-cohorts/AnalysisConfig";
import ProcessingModal from "@/components/strategy-cohorts/ProcessingModal";
import InsightsGrid from "@/components/strategy-cohorts/InsightsGrid";
import CompetitiveChart from "@/components/strategy-cohorts/CompetitiveChart";
import type { DiscoveredCompetitor } from "@/lib/strategy-cohorts/types";

// Create a client
const queryClient = new QueryClient();

function StrategyCohortsContent() {
  const [currentCohortId, setCurrentCohortId] = useState<string | null>(null);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<
    DiscoveredCompetitor[]
  >([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfiguration>({
    analysisType: "insights",
    query: "",
    includeFinancial: false,
    includeSocial: true,
    includeTech: false,
    includeSentiment: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const createCohort = useCreateCohort();
  const { data: cohortData } = useGetCohort(currentCohortId);
  const addCompetitor = useAddCompetitor(currentCohortId || "");
  const updateCohort = useUpdateCohort(currentCohortId || "");

  const cohort = cohortData?.cohort;

  const handleCompetitorsDiscovered = (competitors: DiscoveredCompetitor[]) => {
    setDiscoveredCompetitors([...discoveredCompetitors, ...competitors]);
  };

  const handleRemoveCompetitor = (index: number) => {
    const newCompetitors = [...discoveredCompetitors];
    newCompetitors.splice(index, 1);
    setDiscoveredCompetitors(newCompetitors);
  };

  const handleStartAnalysis = async () => {
    if (discoveredCompetitors.length === 0) {
      alert("Please add at least one competitor");
      return;
    }

    if (!analysisConfig.query.trim()) {
      alert("Please enter an analysis question");
      return;
    }

    try {
      // Create cohort
      const newCohort = await createCohort.mutateAsync({
        name: `Analysis: ${analysisConfig.query.substring(0, 50)}...`,
        description: `Competitive analysis with ${discoveredCompetitors.length} competitors`,
        analysisType: analysisConfig.analysisType,
      });

      setCurrentCohortId(newCohort.id);

      // Add competitors to cohort
      for (const competitor of discoveredCompetitors) {
        await addCompetitor.mutateAsync({
          name: competitor.name,
          ...(competitor.website && { url: competitor.website }),
          discoveredData: competitor,
        });
      }

      // Update cohort with analysis config
      await updateCohort.mutateAsync({
        query: analysisConfig.query,
        includeFinancial: analysisConfig.includeFinancial,
        includeSocial: analysisConfig.includeSocial,
        includeTech: analysisConfig.includeTech,
        includeSentiment: analysisConfig.includeSentiment,
      });

      // Start processing
      setIsProcessing(true);
    } catch (error) {
      console.error("Failed to start analysis:", error);
      alert("Failed to start analysis. Please try again.");
    }
  };

  const handleAnalysisComplete = () => {
    setIsProcessing(false);
    setShowResults(true);
  };

  const handleStartNew = () => {
    setCurrentCohortId(null);
    setDiscoveredCompetitors([]);
    setShowResults(false);
    setAnalysisConfig({
      analysisType: "insights",
      query: "",
      includeFinancial: false,
      includeSocial: true,
      includeTech: false,
      includeSentiment: true,
    });
  };

  return (
    <>
      <style jsx global>{`
        .strategy-cohorts-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 32px;
          margin: -32px;
        }

        .page-header {
          background: white;
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .page-description {
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }

        .workflow-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header {
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #f5576c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .two-column-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .action-bar {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .action-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .action-subtitle {
          font-size: 13px;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          border-color: #f5576c;
          color: #f5576c;
          background: #fef2f4;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .two-column-grid {
            grid-template-columns: 1fr;
          }

          .action-bar {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="strategy-cohorts-page">
        <div className="page-header">
          <h1 className="page-title">🎯 Strategy Cohorts</h1>
          <p className="page-description">
            AI-powered competitive analysis using multi-agent Research Swarms.
            Discover competitors, configure analysis, and get strategic insights
            in under 2 minutes.
          </p>
        </div>

        {!showResults ? (
          <div className="workflow-container">
            {/* Step 1: Discovery */}
            <div className="section-header">
              <div className="section-title">Step 1: Discover Competitors</div>
            </div>
            <CompetitorDiscovery
              onCompetitorsDiscovered={handleCompetitorsDiscovered}
            />

            {/* Step 2: Review Competitors */}
            <div className="section-header">
              <div className="section-title">
                Step 2: Review Selected Competitors
              </div>
            </div>
            <CompetitorGrid
              competitors={discoveredCompetitors}
              onRemoveCompetitor={handleRemoveCompetitor}
            />

            {/* Step 3: Configure Analysis */}
            <div className="section-header">
              <div className="section-title">Step 3: Configure Analysis</div>
            </div>
            <AnalysisConfig
              onConfigChange={setAnalysisConfig}
              initialConfig={analysisConfig}
            />

            {/* Action Bar */}
            <div className="action-bar">
              <div className="action-info">
                <div className="action-title">Ready to Analyze?</div>
                <div className="action-subtitle">
                  {discoveredCompetitors.length} competitors •{" "}
                  {analysisConfig.analysisType} analysis
                </div>
              </div>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleStartAnalysis}
                  disabled={
                    discoveredCompetitors.length === 0 ||
                    !analysisConfig.query.trim() ||
                    createCohort.isPending
                  }
                >
                  {createCohort.isPending ? (
                    <>
                      <span>⏳</span>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-grid">
            {/* Results Header */}
            <div className="action-bar">
              <div className="action-info">
                <div className="action-title">Analysis Results</div>
                <div className="action-subtitle">
                  {cohort?.insightCount || 0} insights generated
                </div>
              </div>
              <div className="action-buttons">
                <button className="btn btn-secondary" onClick={handleStartNew}>
                  <span>➕</span>
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* Visualizations */}
            <div className="two-column-grid">
              <CompetitiveChart
                insights={cohort?.insights || []}
                type="category"
              />
              <CompetitiveChart
                insights={cohort?.insights || []}
                type="confidence"
              />
            </div>

            {/* Insights Grid */}
            <InsightsGrid
              insights={cohort?.insights || []}
              {...(cohort?.name && { cohortName: cohort.name })}
            />
          </div>
        )}

        {/* Processing Modal */}
        {isProcessing && currentCohortId && (
          <ProcessingModal
            isOpen={isProcessing}
            onClose={() => setIsProcessing(false)}
            cohortId={currentCohortId}
            onComplete={handleAnalysisComplete}
          />
        )}
      </div>
    </>
  );
}

export default function StrategyCohortsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <StrategyCohortsContent />
    </QueryClientProvider>
  );
}
