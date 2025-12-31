/**
 * Competitor Discovery Component
 * Allows users to discover competitors using 4 methods:
 * 1. URL Analysis
 * 2. Company Name Lookup
 * 3. Industry Scan
 * 4. Bulk Import
 */

"use client";

import { useState } from "react";
import { useDiscoverCompetitors } from "@/lib/strategy-cohorts/hooks";
import type { DiscoveredCompetitor } from "@/lib/strategy-cohorts/types";

interface CompetitorDiscoveryProps {
  onCompetitorsDiscovered: (competitors: DiscoveredCompetitor[]) => void;
}

type DiscoveryMethod = "url" | "company-name" | "industry-scan" | "bulk-import";

export default function CompetitorDiscovery({
  onCompetitorsDiscovered,
}: CompetitorDiscoveryProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<DiscoveryMethod>("company-name");
  const [input, setInput] = useState("");

  const discoverMutation = useDiscoverCompetitors();

  const methods = [
    {
      id: "url" as DiscoveryMethod,
      name: "Analyze URL",
      icon: "🔗",
      placeholder: "https://competitor.com",
      description: "Analyze a competitor's website to find similar companies",
    },
    {
      id: "company-name" as DiscoveryMethod,
      name: "Company Name",
      icon: "🏢",
      placeholder: "e.g., Stripe, Salesforce",
      description: "Find competitors for a specific company",
    },
    {
      id: "industry-scan" as DiscoveryMethod,
      name: "Industry Scan",
      icon: "🔍",
      placeholder: "e.g., CRM Software, Payment Processing",
      description: "Scan an entire industry or market segment",
    },
    {
      id: "bulk-import" as DiscoveryMethod,
      name: "Bulk Import",
      icon: "📋",
      placeholder: '[{"name": "Company A", "website": "..."}]',
      description: "Import competitors via JSON",
    },
  ];

  const handleDiscover = async () => {
    if (!input.trim()) return;

    try {
      const result = await discoverMutation.mutateAsync({
        method: selectedMethod,
        input: input.trim(),
      });

      onCompetitorsDiscovered(result.competitors);
    } catch (error) {
      console.error("Discovery failed:", error);
    }
  };

  return (
    <div className="competitor-discovery">
      <style jsx>{`
        .competitor-discovery {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .discovery-header {
          margin-bottom: 20px;
        }

        .discovery-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .discovery-subtitle {
          font-size: 13px;
          color: #6b7280;
        }

        .methods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .method-card {
          padding: 14px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          text-align: center;
        }

        .method-card:hover {
          border-color: #f5576c;
          background: #fef2f4;
        }

        .method-card.active {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          box-shadow: 0 2px 8px rgba(245, 87, 108, 0.2);
        }

        .method-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .method-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }

        .method-description {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          line-height: 1.3;
        }

        .input-section {
          margin-bottom: 16px;
        }

        .input-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          display: block;
        }

        .input-field {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #f5576c;
          box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
        }

        .input-field.textarea {
          min-height: 100px;
          resize: vertical;
        }

        .discover-button {
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .discover-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .discover-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          margin-top: 12px;
          padding: 12px;
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #991b1b;
          font-size: 13px;
        }
      `}</style>

      <div className="discovery-header">
        <h3 className="discovery-title">🔍 Discover Competitors</h3>
        <p className="discovery-subtitle">
          Choose a discovery method and let AI find your competitors
        </p>
      </div>

      <div className="methods-grid">
        {methods.map((method) => (
          <button
            key={method.id}
            className={`method-card ${selectedMethod === method.id ? "active" : ""}`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-name">{method.name}</div>
            <div className="method-description">{method.description}</div>
          </button>
        ))}
      </div>

      <div className="input-section">
        <label className="input-label">
          {methods.find((m) => m.id === selectedMethod)?.name}
        </label>
        {selectedMethod === "bulk-import" ? (
          <textarea
            className="input-field textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              methods.find((m) => m.id === selectedMethod)?.placeholder
            }
          />
        ) : (
          <input
            type="text"
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              methods.find((m) => m.id === selectedMethod)?.placeholder
            }
          />
        )}
      </div>

      <button
        className="discover-button"
        onClick={handleDiscover}
        disabled={!input.trim() || discoverMutation.isPending}
      >
        {discoverMutation.isPending ? (
          <>
            <div className="loading-spinner" />
            <span>Discovering...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Discover Competitors</span>
          </>
        )}
      </button>

      {discoverMutation.isError && (
        <div className="error-message">
          {discoverMutation.error?.message || "Discovery failed"}
        </div>
      )}
    </div>
  );
}
