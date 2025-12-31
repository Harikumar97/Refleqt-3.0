/**
 * Export Menu Component
 * External Data Transfer - Export cohort analysis in multiple formats
 */

"use client";

import { useState } from "react";

interface ExportMenuProps {
  cohortId: string;
  cohortName: string;
  onClose: () => void;
}

type ExportFormat = "pdf" | "excel" | "pptx" | "json" | "csv";

export default function ExportMenu({
  cohortId,
  cohortName,
  onClose,
}: ExportMenuProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [options, setOptions] = useState({
    includeSources: true,
    includeCharts: true,
    includeInsights: true,
    includeRecommendations: true,
    includeCompetitors: true,
    includeMetadata: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: "pdf" as ExportFormat,
      name: "PDF Report",
      icon: "📄",
      description: "Professional report with charts and insights",
      size: "~2-5 MB",
    },
    {
      id: "excel" as ExportFormat,
      name: "Excel Spreadsheet",
      icon: "📊",
      description: "Data tables for analysis and manipulation",
      size: "~500 KB",
    },
    {
      id: "pptx" as ExportFormat,
      name: "PowerPoint",
      icon: "📽️",
      description: "Presentation-ready slides",
      size: "~3-7 MB",
    },
    {
      id: "json" as ExportFormat,
      name: "JSON Data",
      icon: "🔧",
      description: "Raw data for developers and integrations",
      size: "~100 KB",
    },
    {
      id: "csv" as ExportFormat,
      name: "CSV Export",
      icon: "📋",
      description: "Simple data format for spreadsheets",
      size: "~50 KB",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/strategy-cohorts/${cohortId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: selectedFormat,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cohortName}-${selectedFormat}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-menu-overlay" onClick={onClose}>
      <style jsx>{`
        .export-menu-overlay {
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

        .export-menu {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .menu-header {
          margin-bottom: 24px;
        }

        .menu-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .menu-subtitle {
          font-size: 14px;
          color: #6b7280;
        }

        .formats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .format-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .format-card:hover {
          border-color: #f5576c;
          background: #fef2f4;
        }

        .format-card.active {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          box-shadow: 0 2px 8px rgba(245, 87, 108, 0.2);
        }

        .format-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .format-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .format-description {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .format-size {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 600;
        }

        .options-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .option-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .option-label {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
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
        }

        .export-info {
          padding: 12px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .info-text {
          font-size: 12px;
          color: #92400e;
          line-height: 1.5;
        }
      `}</style>

      <div className="export-menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header">
          <h2 className="menu-title">Export Analysis</h2>
          <p className="menu-subtitle">
            Download your competitive analysis in your preferred format
          </p>
        </div>

        <div className="formats-grid">
          {exportFormats.map((format) => (
            <div
              key={format.id}
              className={`format-card ${selectedFormat === format.id ? "active" : ""}`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <div className="format-icon">{format.icon}</div>
              <div className="format-name">{format.name}</div>
              <div className="format-description">{format.description}</div>
              <div className="format-size">{format.size}</div>
            </div>
          ))}
        </div>

        <div className="options-section">
          <h3 className="section-title">Export Options</h3>
          <div className="options-list">
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeInsights}
                onChange={(e) =>
                  setOptions({ ...options, includeInsights: e.target.checked })
                }
              />
              <span className="option-label">Include Insights & Analysis</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeCharts}
                onChange={(e) =>
                  setOptions({ ...options, includeCharts: e.target.checked })
                }
              />
              <span className="option-label">
                Include Charts & Visualizations
              </span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeSources}
                onChange={(e) =>
                  setOptions({ ...options, includeSources: e.target.checked })
                }
              />
              <span className="option-label">Include Source References</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeCompetitors}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    includeCompetitors: e.target.checked,
                  })
                }
              />
              <span className="option-label">Include Competitor Details</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeRecommendations}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    includeRecommendations: e.target.checked,
                  })
                }
              />
              <span className="option-label">
                Include Recommendations & Action Items
              </span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                className="option-checkbox"
                checked={options.includeMetadata}
                onChange={(e) =>
                  setOptions({ ...options, includeMetadata: e.target.checked })
                }
              />
              <span className="option-label">
                Include Metadata (timestamps, models used)
              </span>
            </label>
          </div>
        </div>

        <div className="export-info">
          <p className="info-text">
            💡 Your export will include all selected data. Large exports may
            take a few seconds to generate.
          </p>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting
              ? "Exporting..."
              : `Export as ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
