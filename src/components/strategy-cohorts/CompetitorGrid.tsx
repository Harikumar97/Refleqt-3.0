/**
 * Competitor Grid Component
 * Displays selected competitors with status tracking and management
 */

"use client";

import type {
  CohortCompetitor,
  DiscoveredCompetitor,
} from "@/lib/strategy-cohorts/types";

interface CompetitorGridProps {
  competitors: (CohortCompetitor | DiscoveredCompetitor)[];
  onRemoveCompetitor: (index: number) => void;
  onAddCompetitor?: (competitor: DiscoveredCompetitor) => void;
}

export default function CompetitorGrid({
  competitors,
  onRemoveCompetitor,
}: CompetitorGridProps) {
  const getStatusColor = (
    status?: "pending" | "analyzing" | "completed" | "failed"
  ) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "analyzing":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (
    status?: "pending" | "analyzing" | "completed" | "failed"
  ) => {
    switch (status) {
      case "completed":
        return "✓ Analyzed";
      case "analyzing":
        return "⏳ Analyzing";
      case "failed":
        return "✗ Failed";
      default:
        return "⏹ Pending";
    }
  };

  if (competitors.length === 0) {
    return (
      <div className="competitor-grid-empty">
        <style jsx>{`
          .competitor-grid-empty {
            background: white;
            border-radius: 16px;
            padding: 48px 24px;
            text-align: center;
            border: 2px dashed #e5e7eb;
          }

          .empty-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          .empty-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 4px;
          }

          .empty-subtitle {
            font-size: 13px;
            color: #9ca3af;
          }
        `}</style>

        <div className="empty-icon">🎯</div>
        <div className="empty-title">No Competitors Selected</div>
        <div className="empty-subtitle">
          Use the discovery tools above to find competitors
        </div>
      </div>
    );
  }

  return (
    <div className="competitor-grid">
      <style jsx>{`
        .competitor-grid {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .grid-header {
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .grid-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
        }

        .grid-count {
          font-size: 13px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
        }

        .competitors-list {
          display: grid;
          gap: 12px;
        }

        .competitor-card {
          padding: 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .competitor-card:hover {
          border-color: #f5576c;
          box-shadow: 0 2px 8px rgba(245, 87, 108, 0.1);
        }

        .competitor-info {
          flex: 1;
          min-width: 0;
        }

        .competitor-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .competitor-website {
          font-size: 12px;
          color: #6b7280;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 6px;
        }

        .competitor-website:hover {
          color: #f5576c;
        }

        .competitor-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .competitor-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .relevance-score {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .remove-button {
          padding: 6px 12px;
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #991b1b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-button:hover {
          background: #fecaca;
          transform: scale(1.05);
        }
      `}</style>

      <div className="grid-header">
        <h3 className="grid-title">Selected Competitors</h3>
        <div className="grid-count">{competitors.length} companies</div>
      </div>

      <div className="competitors-list">
        {competitors.map((competitor, index) => {
          const isDiscovered = "relevanceScore" in competitor;
          const status = "status" in competitor ? competitor.status : undefined;
          const website =
            "website" in competitor ? competitor.website : competitor.url;
          const description =
            "description" in competitor ? competitor.description : undefined;

          return (
            <div key={index} className="competitor-card">
              <div className="competitor-info">
                <div className="competitor-name">{competitor.name}</div>
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="competitor-website"
                  >
                    {website}
                  </a>
                )}
                {description && (
                  <div className="competitor-description">{description}</div>
                )}
              </div>

              <div className="competitor-meta">
                {status && (
                  <div
                    className="status-badge"
                    style={{
                      background: `${getStatusColor(status)}22`,
                      color: getStatusColor(status),
                    }}
                  >
                    {getStatusLabel(status)}
                  </div>
                )}
                {isDiscovered && competitor.relevanceScore && (
                  <div className="relevance-score">
                    {(competitor.relevanceScore * 100).toFixed(0)}% match
                  </div>
                )}
                <button
                  className="remove-button"
                  onClick={() => onRemoveCompetitor(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
