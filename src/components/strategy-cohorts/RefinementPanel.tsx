/**
 * Refinement Panel Component
 * Data Editing - Refine and edit generated insights
 */

"use client";

import { useState } from "react";
import type { CohortInsight } from "@/lib/strategy-cohorts/types";

interface RefinementPanelProps {
  cohortId: string;
  insights: CohortInsight[];
  onRefine: (newInsights: CohortInsight[]) => void;
  onClose: () => void;
}

export default function RefinementPanel({
  cohortId,
  insights,
  onRefine,
  onClose,
}: RefinementPanelProps) {
  const [selectedInsight, setSelectedInsight] = useState<CohortInsight | null>(
    null
  );
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedConfidence, setEditedConfidence] = useState<
    "high" | "medium" | "low"
  >("high");
  const [refinementQuery, setRefinementQuery] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleSelectInsight = (insight: CohortInsight) => {
    setSelectedInsight(insight);
    setEditedTitle(insight.title);
    setEditedContent(insight.content);
    setEditedCategory(insight.category);
    setEditedConfidence(insight.confidence);
  };

  const handleSaveEdit = async () => {
    if (!selectedInsight) return;

    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/insights/${selectedInsight.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editedTitle,
            content: editedContent,
            category: editedCategory,
            confidence: editedConfidence,
          }),
        }
      );

      if (response.ok) {
        const updatedInsights = insights.map((i) =>
          i.id === selectedInsight.id
            ? {
                ...i,
                title: editedTitle,
                content: editedContent,
                category: editedCategory,
                confidence: editedConfidence,
              }
            : i
        );
        onRefine(updatedInsights);
        setSelectedInsight(null);
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleRefineWithAI = async () => {
    if (!refinementQuery.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch(`/api/strategy-cohorts/${cohortId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: refinementQuery,
          focusAreas: [editedCategory],
        }),
      });

      const data = await response.json();
      onRefine([...insights, ...data.additionalInsights]);
      setRefinementQuery("");
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    if (!confirm("Are you sure you want to delete this insight?")) return;

    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/insights/${insightId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedInsights = insights.filter((i) => i.id !== insightId);
        onRefine(updatedInsights);
        setSelectedInsight(null);
      }
    } catch (error) {
      console.error("Failed to delete insight:", error);
    }
  };

  return (
    <div className="refinement-panel-overlay" onClick={onClose}>
      <style jsx>{`
        .refinement-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .refinement-panel {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .panel-header {
          margin-bottom: 24px;
        }

        .panel-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .panel-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .panel-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 500px;
          overflow-y: auto;
        }

        .insight-item {
          padding: 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .insight-item:hover {
          border-color: #f5576c;
          background: #fef2f4;
        }

        .insight-item.selected {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
        }

        .insight-item-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .insight-item-meta {
          font-size: 11px;
          color: #6b7280;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          border-color: #f5576c;
        }

        .form-textarea {
          min-height: 150px;
          resize: vertical;
        }

        .form-select {
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          border-color: #f5576c;
          color: #f5576c;
        }

        .btn-danger {
          background: #fee2e2;
          color: #991b1b;
          border: 2px solid #ef4444;
        }

        .btn-danger:hover {
          background: #fecaca;
        }

        .refine-section {
          padding: 16px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          margin-top: 16px;
        }

        .refine-title {
          font-size: 14px;
          font-weight: 700;
          color: #92400e;
          margin-bottom: 8px;
        }

        .refine-description {
          font-size: 12px;
          color: #92400e;
          margin-bottom: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .panel-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="refinement-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2 className="panel-title">Refine Insights</h2>
          <p className="panel-subtitle">
            Edit existing insights or generate new ones with AI refinement
          </p>
        </div>

        <div className="panel-content">
          <div className="insights-list">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`insight-item ${selectedInsight?.id === insight.id ? "selected" : ""}`}
                onClick={() => handleSelectInsight(insight)}
              >
                <div className="insight-item-title">{insight.title}</div>
                <div className="insight-item-meta">
                  {insight.category} • {insight.confidence}
                </div>
              </div>
            ))}
          </div>

          <div className="edit-form">
            {selectedInsight ? (
              <>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confidence Level</label>
                  <select
                    className="form-select"
                    value={editedConfidence}
                    onChange={(e) =>
                      setEditedConfidence(
                        e.target.value as "high" | "medium" | "low"
                      )
                    }
                  >
                    <option value="high">High Confidence</option>
                    <option value="medium">Medium Confidence</option>
                    <option value="low">Low Confidence</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedInsight(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteInsight(selectedInsight.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select an insight to edit, or use AI refinement below to
                generate new insights
              </div>
            )}

            <div className="refine-section">
              <div className="refine-title">✨ AI Refinement</div>
              <div className="refine-description">
                Ask for additional insights or deeper analysis
              </div>
              <div className="form-group">
                <textarea
                  className="form-input"
                  placeholder="E.g., 'Give me more insights about pricing strategies' or 'Focus on market opportunities in Asia'"
                  value={refinementQuery}
                  onChange={(e) => setRefinementQuery(e.target.value)}
                  rows={3}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRefineWithAI}
                disabled={isRefining || !refinementQuery.trim()}
              >
                {isRefining ? "Refining..." : "Generate Additional Insights"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: "100%" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
