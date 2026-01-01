/**
 * Insights Grid Component
 * Display analyzed competitive insights with filtering and sorting
 */

"use client";

import { useState } from "react";
import type { CohortInsight } from "@/lib/strategy-cohorts/types";

const saveToBrewery = async (insight: CohortInsight, cohortName?: string) => {
  try {
    const response = await fetch("/api/brewery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: insight.title,
        content: insight.content,
        sourceType: "strategy-cohort",
        sourceId: insight.id,
        sourceName: cohortName || "Strategy Cohort Analysis",
        category: insight.category,
        confidence: insight.confidence,
      }),
    });

    if (response.ok) {
      alert("✅ Saved to Brewery! Visit The Brewery to create content.");
    } else if (response.status === 409) {
      alert("ℹ️ This insight is already in your Brewery");
    } else {
      alert("Failed to save to Brewery");
    }
  } catch (error) {
    console.error("Failed to save to brewery:", error);
    alert("Failed to save to Brewery");
  }
};

interface InsightsGridProps {
  insights: CohortInsight[];
  cohortName?: string;
}

export default function InsightsGrid({
  insights,
  cohortName,
}: InsightsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<string | null>(
    null
  );

  // Get unique categories
  const categories = Array.from(
    new Set(insights.map((insight) => insight.category))
  );

  // Filter insights
  const filteredInsights = insights.filter((insight) => {
    if (selectedCategory && insight.category !== selectedCategory) return false;
    if (selectedConfidence && insight.confidence !== selectedConfidence)
      return false;
    return true;
  });

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "🎯";
      case "medium":
        return "⚡";
      case "low":
        return "💭";
      default:
        return "•";
    }
  };

  if (insights.length === 0) {
    return (
      <div className="insights-empty">
        <style jsx>{`
          .insights-empty {
            background: white;
            border-radius: 16px;
            padding: 64px 24px;
            text-align: center;
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .empty-title {
            font-size: 20px;
            font-weight: 700;
            color: #374151;
            margin-bottom: 8px;
          }

          .empty-subtitle {
            font-size: 14px;
            color: #9ca3af;
          }
        `}</style>

        <div className="empty-icon">💡</div>
        <div className="empty-title">No Insights Yet</div>
        <div className="empty-subtitle">
          Run an analysis to generate competitive insights
        </div>
      </div>
    );
  }

  return (
    <div className="insights-grid">
      <style jsx>{`
        .insights-grid {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .grid-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .grid-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .insight-count {
          font-size: 14px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 6px 14px;
          border-radius: 12px;
          font-weight: 600;
        }

        .filters-section {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .filter-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .filter-button {
          padding: 6px 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-button:hover {
          border-color: #f5576c;
          color: #f5576c;
        }

        .filter-button.active {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          color: #f5576c;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insight-card {
          padding: 20px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 12px;
          border-left: 4px solid transparent;
          transition: all 0.2s;
        }

        .insight-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .insight-card.confidence-high {
          border-left-color: #10b981;
        }

        .insight-card.confidence-medium {
          border-left-color: #f59e0b;
        }

        .insight-card.confidence-low {
          border-left-color: #ef4444;
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 16px;
        }

        .insight-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          flex: 1;
        }

        .insight-badges {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .insight-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .badge-confidence {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .insight-content {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .insight-meta {
          display: flex;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .meta-icon {
          font-size: 14px;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .source-link {
          font-size: 11px;
          color: #f5576c;
          text-decoration: none;
        }

        .source-link:hover {
          text-decoration: underline;
        }

        .save-brewery-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-brewery-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      `}</style>

      <div className="grid-header">
        <div className="header-top">
          <h2 className="grid-title">
            {cohortName ? `${cohortName} - Insights` : "Competitive Insights"}
          </h2>
          <div className="insight-count">
            {filteredInsights.length} insights
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <span className="filter-label">Category:</span>
            <button
              className={`filter-button ${selectedCategory === null ? "active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-label">Confidence:</span>
            <button
              className={`filter-button ${selectedConfidence === null ? "active" : ""}`}
              onClick={() => setSelectedConfidence(null)}
            >
              All
            </button>
            {["high", "medium", "low"].map((confidence) => (
              <button
                key={confidence}
                className={`filter-button ${selectedConfidence === confidence ? "active" : ""}`}
                onClick={() => setSelectedConfidence(confidence)}
              >
                {confidence}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="insights-list">
        {filteredInsights
          .sort((a, b) => a.rank - b.rank)
          .map((insight) => (
            <div
              key={insight.id}
              className={`insight-card confidence-${insight.confidence}`}
            >
              <div className="insight-header">
                <h3 className="insight-title">{insight.title}</h3>
                <div className="insight-badges">
                  <span
                    className="insight-badge badge-confidence"
                    style={{
                      background: `${getConfidenceColor(insight.confidence)}22`,
                      color: getConfidenceColor(insight.confidence),
                    }}
                  >
                    <span>{getConfidenceIcon(insight.confidence)}</span>
                    <span>{insight.confidence}</span>
                  </span>
                  <span
                    className="insight-badge"
                    style={{
                      background: "#e5e7eb",
                      color: "#6b7280",
                    }}
                  >
                    {insight.category}
                  </span>
                </div>
              </div>

              <p className="insight-content">{insight.content}</p>

              <div className="insight-meta">
                <div className="meta-item">
                  <span className="meta-icon">📊</span>
                  <span>Rank #{insight.rank}</span>
                </div>
                {insight.llmProvider && (
                  <div className="meta-item">
                    <span className="meta-icon">🤖</span>
                    <span>
                      {insight.llmProvider}
                      {insight.llmModel && ` (${insight.llmModel})`}
                    </span>
                  </div>
                )}
                {insight.sources && insight.sources.length > 0 && (
                  <div className="meta-item">
                    <span className="meta-icon">🔗</span>
                    <span>{insight.sources.length} sources</span>
                  </div>
                )}
                <button
                  className="save-brewery-btn"
                  onClick={() => saveToBrewery(insight, cohortName)}
                  title="Save to Brewery"
                >
                  <span>🍺</span>
                  <span>Save to Brewery</span>
                </button>
              </div>

              {insight.sources && insight.sources.length > 0 && (
                <div className="sources-list">
                  {insight.sources.slice(0, 3).map((source, idx) => (
                    <a
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      {source}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
