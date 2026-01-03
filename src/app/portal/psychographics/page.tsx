"use client";

/**
 * Funnel-lytics - Psychographics Page
 * Behavioral segmentation and customer psychology analysis
 */

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Doughnut, Line, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

interface DataSource {
  id: string;
  sourceType: string;
  sourceName: string;
  isConnected: boolean;
}

interface BehavioralSegment {
  id: string;
  segmentName: string;
  segmentTagline: string;
  percentage: number;
  userCount: number;
  conversionRate: number;
  averageValue: number;
  traits: string[];
  insights: SegmentInsight[];
}

interface SegmentInsight {
  id: string;
  insightType: string;
  title: string;
  content: string;
  confidenceScore: number;
  impact: string;
}

interface JourneyStage {
  id: string;
  stageName: string;
  conversionRate: number;
  dropOffRate: number;
}

interface AnalysisProgress {
  stage: string;
  description: string;
  progress: number;
}

export default function FunnellyticsPage() {
  const { user } = useUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000001";

  // State
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(
    "behavioral-segments"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] =
    useState<AnalysisProgress | null>(null);
  const [segments, setSegments] = useState<BehavioralSegment[]>([]);
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [chartType, setChartType] = useState<
    "segments" | "journey" | "psychology"
  >("segments");
  const [showExportModal, setShowExportModal] = useState(false);
  const [refinementQuery, setRefinementQuery] = useState("");

  // Load data sources on mount
  useEffect(() => {
    loadDataSources();
  }, [userId]);

  async function loadDataSources() {
    try {
      const response = await fetch(
        `/api/psychographics/data-sources?userId=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setDataSources(data.data);
      }
    } catch (error) {
      console.error("Error loading data sources:", error);
    }
  }

  async function toggleDataSource(sourceType: string, sourceName: string) {
    try {
      const existing = dataSources.find((s) => s.sourceType === sourceType);
      const isConnected = existing ? !existing.isConnected : true;

      const response = await fetch("/api/psychographics/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sourceType,
          sourceName,
          isConnected,
        }),
      });

      if (response.ok) {
        await loadDataSources();
      }
    } catch (error) {
      console.error("Error toggling data source:", error);
    }
  }

  async function runAnalysis() {
    const connectedSources = dataSources.filter((s) => s.isConnected);
    if (connectedSources.length === 0) {
      alert("Please connect at least one data source.");
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);
    setAnalysisProgress({
      stage: "Initializing",
      description: "Starting analysis...",
      progress: 0,
    });

    const startTime = Date.now();

    try {
      const response = await fetch("/api/psychographics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          analysisType: selectedAnalysisType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSegments(data.data.segments || []);
        setExecutionTime(data.data.executionTimeMs || Date.now() - startTime);
        setConfidenceScore(
          data.data.confidenceScore ? parseFloat(data.data.confidenceScore) : 0.87
        );

        // Load journey stages
        const journeyResponse = await fetch(
          `/api/psychographics/journey-stages?userId=${userId}`
        );
        const journeyData = await journeyResponse.json();
        if (journeyData.success) {
          setJourneyStages(journeyData.data || []);
        }

        setShowResults(true);
      } else {
        alert(`Analysis failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error running analysis:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  }

  function isSourceConnected(sourceType: string): boolean {
    return dataSources.some(
      (s) => s.sourceType === sourceType && s.isConnected
    );
  }

  // Chart data
  const segmentsChartData = {
    labels: segments.map((s) => s.segmentName),
    datasets: [
      {
        data: segments.map((s) => parseFloat(s.percentage.toString())),
        backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const journeyChartData = {
    labels: journeyStages.map((s) =>
      s.stageName.charAt(0).toUpperCase() + s.stageName.slice(1)
    ),
    datasets: [
      {
        label: "Conversion Rate (%)",
        data: journeyStages.map((s) => parseFloat(s.conversionRate.toString())),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const psychologyChartData = {
    labels: [
      "Tech Savvy",
      "Price Sensitive",
      "Feature Focused",
      "Team Oriented",
      "Speed Focused",
    ],
    datasets: segments.slice(0, 2).map((segment, idx) => ({
      label: segment.segmentName,
      data: [
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
      ],
      borderColor: idx === 0 ? "#ff6b6b" : "#4ecdc4",
      backgroundColor:
        idx === 0 ? "rgba(255, 107, 107, 0.2)" : "rgba(78, 205, 196, 0.2)",
    })),
  };

  return (
    <>
      <style jsx global>{`
        .psychographics-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .builder-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .builder-header {
          margin-bottom: 30px;
        }

        .builder-title {
          font-size: 24px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .builder-subtitle {
          color: #718096;
          font-size: 16px;
        }

        .section-label {
          font-weight: 600;
          margin-bottom: 12px;
          color: #4a5568;
          font-size: 14px;
        }

        .sources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 30px;
        }

        .source-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .source-item:hover {
          border-color: #cbd5e0;
        }

        .source-item.connected {
          border-color: #48bb78;
          background: rgba(72, 187, 120, 0.1);
        }

        .source-status {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 4px;
          position: relative;
          flex-shrink: 0;
        }

        .source-item.connected .source-status {
          background: #48bb78;
          border-color: #48bb78;
        }

        .source-item.connected .source-status::after {
          content: "✓";
          position: absolute;
          top: -2px;
          left: 2px;
          color: white;
          font-size: 12px;
        }

        .source-info {
          flex: 1;
          min-width: 0;
        }

        .source-name {
          font-weight: 600;
          font-size: 14px;
          color: #2d3748;
        }

        .source-description {
          font-size: 12px;
          color: #718096;
        }

        .analysis-options {
          margin-bottom: 30px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .option-card {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .option-card:hover {
          border-color: #cbd5e0;
        }

        .option-card.selected {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .option-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .option-title {
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .option-description {
          font-size: 12px;
          color: #718096;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .processing-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .processing-content {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
        }

        .processing-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .processing-stage {
          font-size: 16px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 8px;
        }

        .processing-description {
          color: #718096;
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 14px;
          color: #718096;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f7fafc;
          flex-wrap: wrap;
          gap: 16px;
        }

        .results-title {
          font-size: 20px;
          font-weight: bold;
        }

        .results-meta {
          font-size: 14px;
          color: #718096;
        }

        .export-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .export-btn {
          padding: 8px 12px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .export-btn:hover {
          background: #667eea;
          color: white;
        }

        .segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .segment-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .segment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .segment-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .segment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .segment-name {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .segment-tagline {
          font-size: 14px;
          color: #718096;
          font-style: italic;
        }

        .segment-percentage {
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }

        .segment-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-item {
          text-align: center;
          background: #f7fafc;
          border-radius: 8px;
          padding: 8px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: bold;
          color: #2d3748;
        }

        .stat-label {
          font-size: 11px;
          color: #718096;
          text-transform: uppercase;
        }

        .traits-container {
          margin-bottom: 16px;
        }

        .traits-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .traits-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .trait-tag {
          background: #e6f7ff;
          color: #1890ff;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .segment-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 6px 12px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: #667eea;
          color: white;
        }

        .journey-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .journey-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .journey-stages {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .journey-stage {
          background: #f7fafc;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .journey-stage:hover {
          background: #e6f7ff;
          transform: translateY(-2px);
        }

        .journey-stage.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stage-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .stage-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .stage-conversion {
          font-size: 12px;
          opacity: 0.8;
        }

        .viz-section {
          margin: 30px 0;
        }

        .viz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .viz-title {
          font-size: 18px;
          font-weight: 600;
        }

        .viz-controls {
          display: flex;
          gap: 8px;
        }

        .viz-btn {
          padding: 6px 12px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .viz-btn:hover,
        .viz-btn.active {
          background: #667eea;
          color: white;
        }

        .viz-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
        }

        .refinement-section {
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-top: 30px;
        }

        .refinement-label {
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .refinement-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .refinement-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .refinement-info {
          font-size: 12px;
          color: #718096;
          margin-top: 8px;
        }

        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #2d3748;
        }

        .insight-item {
          padding: 12px;
          border-left: 4px solid;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .insight-item.success {
          background: #f0fff4;
          border-color: #48bb78;
        }

        .insight-item.warning {
          background: #fef5e7;
          border-color: #ed8936;
        }

        .insight-item.info {
          background: #e6f7ff;
          border-color: #1890ff;
        }

        .insight-title {
          font-weight: 600;
          font-size: 14px;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .insight-content {
          font-size: 12px;
          color: #4a5568;
        }

        .campaign-chip {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .campaign-chip:hover {
          border-color: #667eea;
          background: #f7fafc;
        }

        .campaign-title {
          font-weight: 600;
          font-size: 14px;
        }

        .campaign-description {
          font-size: 12px;
          color: #718096;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-dot.connected {
          background: #48bb78;
        }

        .status-dot.disconnected {
          background: #e53e3e;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .options-grid {
            grid-template-columns: 1fr;
          }

          .segments-grid {
            grid-template-columns: 1fr;
          }

          .journey-stages {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="psychographics-container">
        <div className="main-grid">
          {/* Main Content */}
          <div className="main-content">
            {/* Funnel-lytics Builder */}
            {!showResults && (
              <div className="builder-card">
                <div className="builder-header">
                  <div className="builder-title">📊 Funnel-lytics</div>
                  <div className="builder-subtitle">
                    Psychographics-as-a-Service: Understand not just what
                    customers do, but why they do it.
                  </div>
                </div>

                {/* Data Integration */}
                <div>
                  <div className="section-label">Connect Your Data Sources</div>
                  <div className="sources-grid">
                    <div
                      className={`source-item ${isSourceConnected("google-analytics") ? "connected" : ""}`}
                      onClick={() =>
                        toggleDataSource(
                          "google-analytics",
                          "Google Analytics"
                        )
                      }
                    >
                      <div className="source-status"></div>
                      <div className="source-info">
                        <div className="source-name">Google Analytics</div>
                        <div className="source-description">
                          User behavior tracking
                        </div>
                      </div>
                    </div>

                    <div
                      className={`source-item ${isSourceConnected("mixpanel") ? "connected" : ""}`}
                      onClick={() => toggleDataSource("mixpanel", "Mixpanel")}
                    >
                      <div className="source-status"></div>
                      <div className="source-info">
                        <div className="source-name">Mixpanel</div>
                        <div className="source-description">
                          Event tracking & analytics
                        </div>
                      </div>
                    </div>

                    <div
                      className={`source-item ${isSourceConnected("hotjar") ? "connected" : ""}`}
                      onClick={() => toggleDataSource("hotjar", "Hotjar")}
                    >
                      <div className="source-status"></div>
                      <div className="source-info">
                        <div className="source-name">Hotjar</div>
                        <div className="source-description">
                          User session recordings
                        </div>
                      </div>
                    </div>

                    <div
                      className={`source-item ${isSourceConnected("salesforce") ? "connected" : ""}`}
                      onClick={() =>
                        toggleDataSource("salesforce", "Salesforce")
                      }
                    >
                      <div className="source-status"></div>
                      <div className="source-info">
                        <div className="source-name">Salesforce</div>
                        <div className="source-description">
                          Customer data platform
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Options */}
                <div className="analysis-options">
                  <div className="section-label">Analysis Type</div>
                  <div className="options-grid">
                    <div
                      className={`option-card ${selectedAnalysisType === "behavioral-segments" ? "selected" : ""}`}
                      onClick={() =>
                        setSelectedAnalysisType("behavioral-segments")
                      }
                    >
                      <div className="option-icon">🧠</div>
                      <div className="option-title">Behavioral Segments</div>
                      <div className="option-description">
                        AI-powered psychographic clustering
                      </div>
                    </div>

                    <div
                      className={`option-card ${selectedAnalysisType === "journey-mapping" ? "selected" : ""}`}
                      onClick={() => setSelectedAnalysisType("journey-mapping")}
                    >
                      <div className="option-icon">🗺️</div>
                      <div className="option-title">Journey Mapping</div>
                      <div className="option-description">
                        Stage-by-stage behavioral analysis
                      </div>
                    </div>

                    <div
                      className={`option-card ${selectedAnalysisType === "conversion-psychology" ? "selected" : ""}`}
                      onClick={() =>
                        setSelectedAnalysisType("conversion-psychology")
                      }
                    >
                      <div className="option-icon">💡</div>
                      <div className="option-title">Conversion Psychology</div>
                      <div className="option-description">
                        Deep-dive into decision triggers
                      </div>
                    </div>

                    <div
                      className={`option-card ${selectedAnalysisType === "competitive-psychographics" ? "selected" : ""}`}
                      onClick={() =>
                        setSelectedAnalysisType("competitive-psychographics")
                      }
                    >
                      <div className="option-icon">⚔️</div>
                      <div className="option-title">Competitive Analysis</div>
                      <div className="option-description">
                        Compare customer psychology vs competitors
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                  >
                    🧠 Run Behavioral Analysis
                  </button>
                  <button className="btn btn-secondary">
                    💾 Save Configuration
                  </button>
                  <button className="btn btn-secondary">
                    📋 Load Template
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {showResults && segments.length > 0 && (
              <>
                <div className="builder-card">
                  <div className="results-header">
                    <div>
                      <div className="results-title">
                        Behavioral Segment Analysis
                      </div>
                      <div className="results-meta">
                        Analysis completed in {(executionTime / 1000).toFixed(1)}
                        s • {segments.length} segments identified •{" "}
                        {(confidenceScore * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <div className="export-controls">
                      <button className="export-btn">
                        📊 Psychographic Report
                      </button>
                      <button className="export-btn">📈 Segment Data</button>
                      <button className="export-btn">🎯 Campaign Export</button>
                      <button
                        className="export-btn"
                        onClick={() => setShowExportModal(true)}
                      >
                        ⚙️ More Options
                      </button>
                    </div>
                  </div>

                  {/* Behavioral Segments */}
                  <div>
                    <div style={{ marginBottom: "20px" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        Identified Behavioral Segments
                      </h3>
                      <div style={{ fontSize: "14px", color: "#718096" }}>
                        Based on 12,847 user interactions
                      </div>
                    </div>

                    <div className="segments-grid">
                      {segments.map((segment) => (
                        <div key={segment.id} className="segment-card">
                          <div className="segment-header">
                            <div>
                              <div className="segment-name">
                                {segment.segmentName}
                              </div>
                              <div className="segment-tagline">
                                {segment.segmentTagline}
                              </div>
                            </div>
                            <div className="segment-percentage">
                              {parseFloat(segment.percentage.toString())}%
                            </div>
                          </div>

                          <div className="segment-stats">
                            <div className="stat-item">
                              <div className="stat-value">
                                {segment.userCount?.toLocaleString()}
                              </div>
                              <div className="stat-label">Users</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-value">
                                {parseFloat(segment.conversionRate.toString())}%
                              </div>
                              <div className="stat-label">Conversion</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-value">
                                ${parseFloat(segment.averageValue.toString())}
                              </div>
                              <div className="stat-label">Avg Value</div>
                            </div>
                          </div>

                          <div className="traits-container">
                            <div className="traits-label">Key Traits</div>
                            <div className="traits-list">
                              {segment.traits.map((trait, idx) => (
                                <span key={idx} className="trait-tag">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="segment-actions">
                            <button className="action-btn">
                              View Details
                            </button>
                            <button className="action-btn">
                              Create Campaign
                            </button>
                            <button className="action-btn">Export</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Journey Mapping */}
                {journeyStages.length > 0 && (
                  <div className="journey-section">
                    <div className="journey-header">
                      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                        Customer Journey Analysis
                      </h3>
                      <div style={{ fontSize: "14px", color: "#718096" }}>
                        Select segment to view journey
                      </div>
                    </div>

                    <div className="journey-stages">
                      {journeyStages.map((stage, idx) => (
                        <div
                          key={stage.id}
                          className={`journey-stage ${idx === 0 ? "active" : ""}`}
                        >
                          <div className="stage-icon">
                            {
                              ["👁️", "🤔", "🔬", "💳", "🔄"][
                                idx % 5
                              ]
                            }
                          </div>
                          <div className="stage-name">
                            {stage.stageName.charAt(0).toUpperCase() +
                              stage.stageName.slice(1)}
                          </div>
                          <div className="stage-conversion">
                            {parseFloat(stage.conversionRate.toString())}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visualization Section */}
                <div className="viz-section">
                  <div className="viz-header">
                    <div className="viz-title">
                      📊 Behavioral Analysis Charts
                    </div>
                    <div className="viz-controls">
                      <button
                        className={`viz-btn ${chartType === "segments" ? "active" : ""}`}
                        onClick={() => setChartType("segments")}
                      >
                        Segments
                      </button>
                      <button
                        className={`viz-btn ${chartType === "journey" ? "active" : ""}`}
                        onClick={() => setChartType("journey")}
                      >
                        Journey
                      </button>
                      <button
                        className={`viz-btn ${chartType === "psychology" ? "active" : ""}`}
                        onClick={() => setChartType("psychology")}
                      >
                        Psychology
                      </button>
                    </div>
                  </div>

                  <div className="viz-container">
                    {chartType === "segments" && segments.length > 0 && (
                      <Doughnut
                        data={segmentsChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "bottom" },
                            title: {
                              display: true,
                              text: "Behavioral Segment Distribution",
                            },
                          },
                        }}
                      />
                    )}
                    {chartType === "journey" && journeyStages.length > 0 && (
                      <Line
                        data={journeyChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "bottom" },
                            title: {
                              display: true,
                              text: "Customer Journey Conversion Rates",
                            },
                          },
                          scales: {
                            y: { beginAtZero: true },
                          },
                        }}
                      />
                    )}
                    {chartType === "psychology" && segments.length >= 2 && (
                      <Radar
                        data={psychologyChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "bottom" },
                            title: {
                              display: true,
                              text: "Psychological Trait Comparison",
                            },
                          },
                          scales: {
                            r: { beginAtZero: true, max: 10 },
                          },
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Refinement Section */}
                <div className="refinement-section">
                  <div className="refinement-label">
                    💬 Refine Your Analysis
                  </div>
                  <input
                    type="text"
                    className="refinement-input"
                    placeholder="Ask follow-up questions about segments or behaviors..."
                    value={refinementQuery}
                    onChange={(e) => setRefinementQuery(e.target.value)}
                  />
                  <div className="refinement-buttons">
                    <button className="btn btn-secondary">
                      Refine Analysis
                    </button>
                    <button className="btn btn-secondary">
                      Create Custom Segment
                    </button>
                    <button className="btn btn-secondary">
                      Compare Segments
                    </button>
                  </div>
                  <div className="refinement-info">
                    Refinements remaining: <strong>6/7</strong> • Each
                    refinement improves segment accuracy
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            {/* Key Insights */}
            <div className="panel-card">
              <div className="panel-title">💡 Key Insights</div>
              <div className="insight-item success">
                <div className="insight-title">High-Intent Behavior</div>
                <div className="insight-content">
                  34% of users show power-user behavior patterns within first
                  week
                </div>
              </div>
              <div className="insight-item warning">
                <div className="insight-title">Drop-off Pattern</div>
                <div className="insight-content">
                  Trial abandoners cite "overwhelm" as primary reason (67%)
                </div>
              </div>
              <div className="insight-item info">
                <div className="insight-title">Conversion Trigger</div>
                <div className="insight-content">
                  Team invitation within 48hrs increases conversion by 340%
                </div>
              </div>
            </div>

            {/* Campaign Suggestions */}
            <div className="panel-card">
              <div className="panel-title">🎯 Campaign Suggestions</div>
              <div className="campaign-chip">
                <div className="campaign-title">Trial Abandoner Recovery</div>
                <div className="campaign-description">
                  Simplified onboarding email sequence
                </div>
              </div>
              <div className="campaign-chip">
                <div className="campaign-title">Power User Acceleration</div>
                <div className="campaign-description">
                  Advanced features showcase
                </div>
              </div>
              <div className="campaign-chip">
                <div className="campaign-title">Team Collaboration Push</div>
                <div className="campaign-description">
                  Encourage early team invitations
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="panel-card">
              <div className="panel-title">🔗 Data Integrations</div>
              {dataSources.map((source) => (
                <div key={source.id} className="status-row">
                  <span>
                    <span
                      className={`status-dot ${source.isConnected ? "connected" : "disconnected"}`}
                    ></span>
                    {source.sourceName}
                  </span>
                  <span
                    style={{
                      color: source.isConnected ? "#48bb78" : "#e53e3e",
                    }}
                  >
                    {source.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              ))}
              <button
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  marginTop: "12px",
                  cursor: "pointer",
                }}
              >
                Configure Integrations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {isAnalyzing && (
        <div className="processing-modal">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <div className="processing-stage">
              {analysisProgress?.stage || "Initializing"}
            </div>
            <div className="processing-description">
              {analysisProgress?.description || "Starting analysis..."}
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${analysisProgress?.progress || 0}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {analysisProgress?.progress || 0}% complete
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setIsAnalyzing(false)}
              >
                Cancel Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
