/**
 * Integration Hub Component
 * Internal Data Synthesis - Connect with other Refleqt features
 */

"use client";

import { useState } from "react";

interface IntegrationHubProps {
  cohortId: string;
  onClose: () => void;
}

type IntegrationType =
  | "psychographics"
  | "intelligence-feed"
  | "research-swarms"
  | "smart-trackers"
  | "expert-writers";

export default function IntegrationHub({
  cohortId,
  onClose,
}: IntegrationHubProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const integrations = [
    {
      id: "psychographics" as IntegrationType,
      name: "Funnel-lytics (Psychographics)",
      icon: "👥",
      description: "Import behavioral segments to enhance competitor analysis",
      actions: ["Import Segments", "Sync Audiences", "Cross-Reference Data"],
    },
    {
      id: "intelligence-feed" as IntegrationType,
      name: "Intelligence Feed",
      icon: "📰",
      description:
        "Connect competitive insights with real-time market intelligence",
      actions: ["Import Articles", "Sync Trends", "Link Sources"],
    },
    {
      id: "research-swarms" as IntegrationType,
      name: "Research Swarms",
      icon: "🤖",
      description: "Launch deeper research on specific competitors or markets",
      actions: ["Launch Swarm", "Import Findings", "Synthesize Data"],
    },
    {
      id: "smart-trackers" as IntegrationType,
      name: "Smart Trackers",
      icon: "📊",
      description: "Set up automated tracking for competitors and metrics",
      actions: ["Create Trackers", "Import Metrics", "Sync Updates"],
    },
    {
      id: "expert-writers" as IntegrationType,
      name: "Expert Writers",
      icon: "✍️",
      description: "Generate content based on competitive insights",
      actions: ["Export to Brewery", "Create Brief", "Generate Content"],
    },
  ];

  const handleImportData = async (
    integrationType: IntegrationType,
    action: string
  ) => {
    setIsImporting(true);
    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/integrate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integrationType,
            action,
          }),
        }
      );

      if (response.ok) {
        alert(`Successfully integrated with ${integrationType}!`);
      }
    } catch (error) {
      console.error("Integration failed:", error);
      alert("Integration failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncData = async (integrationType: IntegrationType) => {
    setIsSyncing(true);
    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/sync/${integrationType}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        alert(`Data synced with ${integrationType}!`);
      }
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="integration-hub-overlay" onClick={onClose}>
      <style jsx>{`
        .integration-hub-overlay {
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

        .integration-hub {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 700px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .hub-header {
          margin-bottom: 24px;
        }

        .hub-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .hub-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .integrations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .integration-card {
          padding: 20px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .integration-card:hover {
          border-color: #f5576c;
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.1);
        }

        .integration-card.selected {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
        }

        .integration-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .integration-icon {
          font-size: 28px;
        }

        .integration-info {
          flex: 1;
        }

        .integration-name {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .integration-description {
          font-size: 13px;
          color: #6b7280;
        }

        .integration-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 8px 14px;
          background: white;
          color: #f5576c;
          border: 2px solid #f5576c;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button:hover:not(:disabled) {
          background: #f5576c;
          color: white;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sync-button {
          padding: 8px 14px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sync-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .sync-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-box {
          padding: 16px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 12px;
          margin-top: 16px;
        }

        .info-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 8px;
        }

        .info-text {
          font-size: 12px;
          color: #1e3a8a;
          line-height: 1.5;
        }

        .close-button {
          width: 100%;
          padding: 12px;
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 24px;
        }

        .close-button:hover {
          border-color: #f5576c;
          color: #f5576c;
        }
      `}</style>

      <div className="integration-hub" onClick={(e) => e.stopPropagation()}>
        <div className="hub-header">
          <h2 className="hub-title">Integration Hub</h2>
          <p className="hub-subtitle">
            Connect Strategy Cohorts with other Refleqt features
          </p>
        </div>

        <div className="integrations-list">
          {integrations.map((integration) => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <span className="integration-icon">{integration.icon}</span>
                <div className="integration-info">
                  <div className="integration-name">{integration.name}</div>
                  <div className="integration-description">
                    {integration.description}
                  </div>
                </div>
              </div>

              <div className="integration-actions">
                {integration.actions.map((action) => (
                  <button
                    key={action}
                    className="action-button"
                    onClick={() =>
                      handleImportData(integration.id, action.toLowerCase())
                    }
                    disabled={isImporting}
                  >
                    {action}
                  </button>
                ))}
                <button
                  className="sync-button"
                  onClick={() => handleSyncData(integration.id)}
                  disabled={isSyncing}
                >
                  {isSyncing ? "Syncing..." : "Auto-Sync"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="info-box">
          <div className="info-title">💡 Integration Benefits</div>
          <div className="info-text">
            • <strong>Psychographics:</strong> Understand how different customer
            segments view your competitors
            <br />• <strong>Intelligence Feed:</strong> Stay updated on
            competitor news and market trends
            <br />• <strong>Research Swarms:</strong> Launch AI agents for
            deeper competitive research
            <br />• <strong>Smart Trackers:</strong> Monitor competitor changes
            automatically
            <br />• <strong>Expert Writers:</strong> Create content briefs from
            competitive insights
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
