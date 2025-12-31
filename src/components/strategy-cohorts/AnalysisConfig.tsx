/**
 * Analysis Configuration Component
 * Configure analysis type and options before execution
 */

"use client";

import { useState } from "react";
import type { StrategyCohort } from "@/lib/strategy-cohorts/types";

interface AnalysisConfigProps {
  onConfigChange: (config: AnalysisConfiguration) => void;
  initialConfig?: AnalysisConfiguration;
}

export interface AnalysisConfiguration {
  analysisType: StrategyCohort["analysisType"];
  query: string;
  includeFinancial: boolean;
  includeSocial: boolean;
  includeTech: boolean;
  includeSentiment: boolean;
}

export default function AnalysisConfig({
  onConfigChange,
  initialConfig,
}: AnalysisConfigProps) {
  const [config, setConfig] = useState<AnalysisConfiguration>(
    initialConfig || {
      analysisType: "insights",
      query: "",
      includeFinancial: false,
      includeSocial: true,
      includeTech: false,
      includeSentiment: true,
    }
  );

  const updateConfig = (updates: Partial<AnalysisConfiguration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const analysisTypes = [
    {
      id: "insights" as const,
      name: "Strategic Insights",
      icon: "💡",
      description: "8-10 key competitive insights with high confidence scoring",
      estimatedTime: "60-90s",
    },
    {
      id: "scenarios" as const,
      name: "Competitive Scenarios",
      icon: "🎲",
      description: "What-if analysis and strategic scenario planning",
      estimatedTime: "90-120s",
    },
    {
      id: "opportunities" as const,
      name: "Market Opportunities",
      icon: "🎯",
      description: "Gap analysis and positioning opportunities",
      estimatedTime: "75-105s",
    },
    {
      id: "deep-dive" as const,
      name: "Deep Dive Report",
      icon: "📊",
      description: "Comprehensive analysis with detailed findings",
      estimatedTime: "120-150s",
    },
  ];

  const analysisOptions = [
    {
      key: "includeFinancial" as const,
      label: "Financial Analysis",
      icon: "💰",
      description: "Revenue, funding, and financial metrics",
    },
    {
      key: "includeSocial" as const,
      label: "Social Media",
      icon: "📱",
      description: "Social presence and engagement monitoring",
    },
    {
      key: "includeTech" as const,
      label: "Technology Stack",
      icon: "⚙️",
      description: "Technical infrastructure and tools used",
    },
    {
      key: "includeSentiment" as const,
      label: "Customer Sentiment",
      icon: "❤️",
      description: "Reviews and customer satisfaction analysis",
    },
  ];

  return (
    <div className="analysis-config">
      <style jsx>{`
        .analysis-config {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .config-section {
          margin-bottom: 24px;
        }

        .config-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .section-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .analysis-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .analysis-type-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .analysis-type-card:hover {
          border-color: #f5576c;
          background: #fef2f4;
        }

        .analysis-type-card.active {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          box-shadow: 0 2px 8px rgba(245, 87, 108, 0.2);
        }

        .type-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .type-icon {
          font-size: 20px;
        }

        .type-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .type-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .type-time {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 600;
        }

        .query-input {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }

        .query-input:focus {
          outline: none;
          border-color: #f5576c;
          box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .option-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .option-checkbox:hover {
          border-color: #f5576c;
          background: #fef2f4;
        }

        .option-checkbox.checked {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .option-content {
          flex: 1;
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .option-icon {
          font-size: 14px;
        }

        .option-label {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }

        .option-description {
          font-size: 11px;
          color: #6b7280;
        }
      `}</style>

      <div className="config-section">
        <h3 className="section-title">Analysis Type</h3>
        <p className="section-subtitle">
          Select the type of competitive analysis you want to perform
        </p>
        <div className="analysis-types-grid">
          {analysisTypes.map((type) => (
            <div
              key={type.id}
              className={`analysis-type-card ${config.analysisType === type.id ? "active" : ""}`}
              onClick={() => updateConfig({ analysisType: type.id })}
            >
              <div className="type-header">
                <span className="type-icon">{type.icon}</span>
                <span className="type-name">{type.name}</span>
              </div>
              <p className="type-description">{type.description}</p>
              <p className="type-time">⏱ {type.estimatedTime}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h3 className="section-title">Analysis Question</h3>
        <p className="section-subtitle">
          What specific question do you want answered?
        </p>
        <textarea
          className="query-input"
          value={config.query}
          onChange={(e) => updateConfig({ query: e.target.value })}
          placeholder="E.g., How does our pricing compare to competitors? What are the main differentiators?"
        />
      </div>

      <div className="config-section">
        <h3 className="section-title">Analysis Options</h3>
        <p className="section-subtitle">
          Choose which data sources to include in the analysis
        </p>
        <div className="options-grid">
          {analysisOptions.map((option) => (
            <label
              key={option.key}
              className={`option-checkbox ${config[option.key] ? "checked" : ""}`}
            >
              <input
                type="checkbox"
                className="checkbox-input"
                checked={config[option.key]}
                onChange={(e) =>
                  updateConfig({ [option.key]: e.target.checked })
                }
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </div>
                <p className="option-description">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
