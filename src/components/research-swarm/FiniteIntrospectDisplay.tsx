"use client";

import { useState, useEffect } from "react";

/**
 * FiniteIntrospectDisplay Component
 * Displays synthesized insights (max 10) from Research Swarm execution
 * Features hierarchy badges, priority indicators, and action items
 */

interface SynthesizedInsight {
  id: string;
  title: string;
  content: string;
  hierarchyLevel: "strategic" | "tactical" | "operational";
  priorityScore: number;
  relevanceScore: number;
  isActionable: boolean;
  actionItems: string[];
  displayPosition: number;
  createdAt: string;
  swarmId: string;
}

interface FiniteIntrospectDisplayProps {
  userId: string;
  onInsightClick?: (insight: SynthesizedInsight) => void;
}

export function FiniteIntrospectDisplay({
  userId,
  onInsightClick,
}: FiniteIntrospectDisplayProps) {
  const [insights, setInsights] = useState<SynthesizedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(
    null
  );
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Fetch insights on mount
  useEffect(() => {
    fetchInsights();
    // Poll for new insights every 30 seconds
    const interval = setInterval(fetchInsights, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  async function fetchInsights() {
    try {
      const response = await fetch(
        `/api/synthesized-insights?userId=${userId}`
      );
      if (!response.ok) {
        console.warn("Could not fetch insights:", response.status);
        setInsights([]);
        setError(null); // Don't show error for empty data
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setInsights(data.data.insights);
        setError(null);
      } else {
        console.warn("Insights API returned unsuccessful response");
        setInsights([]);
        setError(null);
      }
    } catch (err) {
      console.warn("Error fetching insights (database may be empty):", err);
      setInsights([]);
      setError(null); // Don't show error UI for empty database
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss(insightId: string) {
    setDismissingId(insightId);
    try {
      const response = await fetch(`/api/synthesized-insights/${insightId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss insight");
      }

      // Remove from local state
      setInsights(insights.filter((i) => i.id !== insightId));
    } catch (err) {
      console.error("Error dismissing insight:", err);
      alert("Failed to dismiss insight");
    } finally {
      setDismissingId(null);
    }
  }

  async function saveToBrewery(insight: SynthesizedInsight) {
    try {
      const response = await fetch("/api/brewery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: insight.title,
          content: insight.content,
          sourceType: "research-swarm",
          sourceId: insight.swarmId,
          sourceName: "Research Swarm Insight",
          category: insight.hierarchyLevel,
          confidence:
            insight.priorityScore >= 0.8
              ? "high"
              : insight.priorityScore >= 0.5
                ? "medium"
                : "low",
        }),
      });

      if (response.ok) {
        alert("✅ Saved to Brewery! Visit The Brewery to create content.");
      } else if (response.status === 409) {
        alert("ℹ️ This insight is already in your Brewery");
      } else {
        throw new Error("Failed to save to brewery");
      }
    } catch (error) {
      console.error("Failed to save to brewery:", error);
      alert("Failed to save to Brewery");
    }
  }

  function toggleExpanded(insightId: string) {
    setExpandedInsightId(expandedInsightId === insightId ? null : insightId);
  }

  function getHierarchyBadgeStyle(level: string) {
    switch (level) {
      case "strategic":
        return {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          icon: "🎯",
        };
      case "tactical":
        return {
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          icon: "⚡",
        };
      case "operational":
        return {
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          icon: "🔧",
        };
      default:
        return {
          background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
          icon: "📊",
        };
    }
  }

  function getPriorityColor(score: number): string {
    if (score >= 0.8) return "#22c55e"; // green
    if (score >= 0.6) return "#eab308"; // yellow
    if (score >= 0.4) return "#f97316"; // orange
    return "#ef4444"; // red
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading insights...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            gap: 16px;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(139, 92, 246, 0.1);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .loading-container p {
            color: #9ca3af;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{error}</p>
        <button onClick={() => fetchInsights()} className="retry-button">
          Retry
        </button>
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            gap: 12px;
          }

          .error-icon {
            font-size: 48px;
          }

          .error-text {
            color: #ef4444;
            font-size: 14px;
          }

          .retry-button {
            padding: 8px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .retry-button:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">🔍</div>
        <h3>No Insights Yet</h3>
        <p>Configure a research goal to start generating insights</p>
        <style jsx>{`
          .empty-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 80px 20px;
            gap: 12px;
          }

          .empty-icon {
            font-size: 64px;
            opacity: 0.5;
          }

          .empty-container h3 {
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }

          .empty-container p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <h2>
          <span className="insights-icon">✨</span>
          Finite Insights
          <span className="insights-count">{insights.length}/10</span>
        </h2>
        <p className="insights-subtitle">
          Synthesized intelligence from your research swarms
        </p>
      </div>

      <div className="insights-grid">
        {insights.map((insight, _index) => {
          const hierarchyStyle = getHierarchyBadgeStyle(insight.hierarchyLevel);
          const isExpanded = expandedInsightId === insight.id;
          const isDismissing = dismissingId === insight.id;

          return (
            <div
              key={insight.id}
              className="insight-card"
              onClick={() => onInsightClick?.(insight)}
            >
              {/* Position Badge */}
              <div className="position-badge">#{insight.displayPosition}</div>

              {/* Hierarchy Badge */}
              <div
                className="hierarchy-badge"
                style={{ background: hierarchyStyle.background }}
              >
                <span className="hierarchy-icon">{hierarchyStyle.icon}</span>
                <span className="hierarchy-text">
                  {insight.hierarchyLevel.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h3 className="insight-title">{insight.title}</h3>

              {/* Scores */}
              <div className="scores-container">
                <div className="score-item">
                  <span className="score-label">Priority</span>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{
                        width: `${insight.priorityScore * 100}%`,
                        background: getPriorityColor(insight.priorityScore),
                      }}
                    ></div>
                  </div>
                  <span className="score-value">
                    {(insight.priorityScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="score-item">
                  <span className="score-label">Relevance</span>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{
                        width: `${insight.relevanceScore * 100}%`,
                        background: "#8b5cf6",
                      }}
                    ></div>
                  </div>
                  <span className="score-value">
                    {(insight.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="insight-content">{insight.content}</p>

              {/* Action Items */}
              {insight.isActionable && insight.actionItems.length > 0 && (
                <div className="action-section">
                  <button
                    className="action-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(insight.id);
                    }}
                  >
                    <span className="action-icon">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className="action-label">
                      {insight.actionItems.length} Action Item
                      {insight.actionItems.length !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {isExpanded && (
                    <ul className="action-list">
                      {insight.actionItems.map((action, i) => (
                        <li key={i} className="action-item">
                          <span className="action-bullet">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="insight-footer">
                <span className="insight-timestamp">
                  {new Date(insight.createdAt).toLocaleString()}
                </span>
                <div className="footer-actions">
                  <button
                    className="brewery-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveToBrewery(insight);
                    }}
                  >
                    <span className="brewery-icon">🍺</span>
                    Save to Brewery
                  </button>
                  <button
                    className="dismiss-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(insight.id);
                    }}
                    disabled={isDismissing}
                  >
                    {isDismissing ? "..." : "Dismiss"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .insights-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .insights-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .insights-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }

        .insights-icon {
          font-size: 32px;
          filter: grayscale(0);
        }

        .insights-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 20px;
          -webkit-text-fill-color: white;
        }

        .insights-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .insight-card {
          position: relative;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .insight-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #8b5cf6;
        }

        .position-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          font-size: 12px;
          font-weight: 700;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hierarchy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hierarchy-icon {
          font-size: 14px;
        }

        .hierarchy-text {
          line-height: 1;
        }

        .insight-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .scores-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 12px;
        }

        .score-item {
          display: grid;
          grid-template-columns: 80px 1fr 50px;
          align-items: center;
          gap: 12px;
        }

        .score-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .score-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .score-value {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          text-align: right;
        }

        .insight-content {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .action-section {
          margin-bottom: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px solid #fbbf24;
        }

        .action-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #92400e;
          transition: all 0.2s;
        }

        .action-toggle:hover {
          color: #78350f;
          transform: translateX(2px);
        }

        .action-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }

        .action-label {
          line-height: 1;
        }

        .action-list {
          margin: 12px 0 0 0;
          padding: 0;
          list-style: none;
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 0;
          color: #78350f;
          font-size: 13px;
          line-height: 1.5;
        }

        .action-bullet {
          color: #f59e0b;
          font-weight: 700;
          font-size: 16px;
        }

        .insight-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .insight-timestamp {
          font-size: 11px;
          color: #9ca3af;
        }

        .footer-actions {
          display: flex;
          gap: 8px;
        }

        .brewery-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .brewery-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .brewery-icon {
          font-size: 14px;
        }

        .dismiss-button {
          padding: 6px 14px;
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
          color: #991b1b;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dismiss-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
          transform: scale(1.05);
        }

        .dismiss-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .insights-grid {
            grid-template-columns: 1fr;
          }

          .insight-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
