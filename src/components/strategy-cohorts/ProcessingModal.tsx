/**
 * Processing Modal Component
 * Real-time progress tracking during cohort analysis execution
 */

"use client";

import { useEffect, useState } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  onComplete: (result: any) => void;
}

interface ProgressState {
  stage: string;
  progress: number;
  description: string;
}

export default function ProcessingModal({
  isOpen,
  onClose,
  cohortId,
  onComplete,
}: ProcessingModalProps) {
  const [progress, setProgress] = useState<ProgressState>({
    stage: "initializing",
    progress: 0,
    description: "Starting analysis...",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !cohortId) return;

    let eventSource: EventSource | null = null;
    let isCancelled = false;

    const startExecution = async () => {
      try {
        // Start the execution
        const response = await fetch(
          `/api/strategy-cohorts/${cohortId}/execute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to start execution");
        }

        // Set up EventSource to listen for progress updates
        eventSource = new EventSource(
          `/api/strategy-cohorts/${cohortId}/execute`
        );

        eventSource.onmessage = (event) => {
          if (isCancelled) return;

          try {
            const data = JSON.parse(event.data);

            if (data.type === "progress") {
              setProgress({
                stage: data.stage,
                progress: data.progress,
                description: data.description,
              });
            } else if (data.type === "complete") {
              setProgress({
                stage: "complete",
                progress: 100,
                description: "Analysis complete!",
              });

              setTimeout(() => {
                if (!isCancelled) {
                  onComplete(data.result);
                  eventSource?.close();
                }
              }, 1000);
            } else if (data.type === "error") {
              setError(data.error || "An error occurred during analysis");
              eventSource?.close();
            }
          } catch (err) {
            console.error("Failed to parse SSE data:", err);
          }
        };

        eventSource.onerror = () => {
          if (!isCancelled) {
            setError("Connection lost. Please try again.");
            eventSource?.close();
          }
        };
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to start analysis"
          );
        }
      }
    };

    startExecution();

    return () => {
      isCancelled = true;
      eventSource?.close();
    };
  }, [isOpen, cohortId, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="processing-modal-overlay">
      <style jsx>{`
        .processing-modal-overlay {
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

        .processing-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .modal-icon {
          font-size: 64px;
          margin-bottom: 16px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-stage {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .progress-percentage {
          font-size: 14px;
          font-weight: 700;
          color: #f5576c;
        }

        .progress-description {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }

        .stages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .stage-item.active {
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          border: 1px solid #f5576c;
        }

        .stage-item.completed {
          opacity: 0.6;
        }

        .stage-icon {
          font-size: 18px;
        }

        .stage-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .stage-status {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 600;
        }

        .status-pending {
          background: #e5e7eb;
          color: #6b7280;
        }

        .status-active {
          background: #fef3c7;
          color: #92400e;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .error-message {
          padding: 16px;
          background: #fee2e2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          color: #991b1b;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .close-button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }
      `}</style>

      <div className="processing-modal">
        <div className="modal-header">
          <div className="modal-icon">
            {error ? "⚠️" : progress.progress === 100 ? "✅" : "🔄"}
          </div>
          <h2 className="modal-title">
            {error
              ? "Analysis Failed"
              : progress.progress === 100
                ? "Analysis Complete!"
                : "Analyzing Competitors"}
          </h2>
          <p className="modal-subtitle">
            {error
              ? "An error occurred during analysis"
              : progress.progress === 100
                ? "Your competitive insights are ready"
                : "AI agents are analyzing your competitors in real-time"}
          </p>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="progress-info">
              <span className="progress-stage">
                {progress.stage.charAt(0).toUpperCase() +
                  progress.stage.slice(1)}
              </span>
              <span className="progress-percentage">{progress.progress}%</span>
            </div>
            <p className="progress-description">{progress.description}</p>
          </div>
        )}

        <div className="stages-list">
          {[
            { id: "discovery", name: "Competitor Discovery", icon: "🔍" },
            { id: "analysis", name: "Data Analysis", icon: "📊" },
            { id: "insights", name: "Generating Insights", icon: "💡" },
            { id: "complete", name: "Finalizing Results", icon: "✨" },
          ].map((stage) => {
            const isActive = progress.stage === stage.id;
            const isCompleted =
              ["discovery", "analysis", "insights", "complete"].indexOf(
                progress.stage
              ) >
              ["discovery", "analysis", "insights", "complete"].indexOf(
                stage.id
              );

            return (
              <div
                key={stage.id}
                className={`stage-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              >
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-name">{stage.name}</span>
                <span
                  className={`stage-status ${
                    isCompleted
                      ? "status-completed"
                      : isActive
                        ? "status-active"
                        : "status-pending"
                  }`}
                >
                  {isCompleted ? "✓" : isActive ? "⏳" : "⏹"}
                </span>
              </div>
            );
          })}
        </div>

        {(error || progress.progress === 100) && (
          <button className="close-button" onClick={onClose}>
            {error ? "Close" : "View Results"}
          </button>
        )}
      </div>
    </div>
  );
}
