"use client";

import { useState } from "react";
import type { BreweryCardProps } from "@/lib/types";
import "./brewery.css";

export function BreweryCard({
  item,
  onDelete,
  onSelect,
  isSelected,
}: BreweryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "research-swarm":
        return "🔬";
      case "strategy-cohort":
        return "🎯";
      case "intelligence-feed":
        return "📰";
      default:
        return "📝";
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case "research-swarm":
        return "Research Swarm";
      case "strategy-cohort":
        return "Strategy Cohort";
      case "intelligence-feed":
        return "Intelligence Feed";
      default:
        return sourceType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "status-saved";
      case "request-created":
        return "status-requested";
      case "assigned":
      case "in-progress":
        return "status-progress";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "saved":
        return "Saved";
      case "request-created":
        return "Request Created";
      case "assigned":
        return "Writer Assigned";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className={`brewery-card ${isSelected ? "selected" : ""}`}>
      <div className="card-header">
        <div className="card-meta">
          <span className="source-badge">
            <span className="source-icon">
              {getSourceIcon(item.sourceType)}
            </span>
            <span className="source-label">
              {getSourceLabel(item.sourceType)}
            </span>
          </span>
          {item.category && (
            <span className="category-badge">{item.category}</span>
          )}
        </div>
        <div className="card-actions">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="select-checkbox"
            aria-label="Select for writer request"
          />
        </div>
      </div>

      <h3 className="card-title">{item.title}</h3>

      <div className="card-content">
        <p className={`content-text ${isExpanded ? "expanded" : ""}`}>
          {item.excerpt || item.content}
        </p>
        {!isExpanded && item.content.length > 150 && (
          <button className="expand-btn" onClick={() => setIsExpanded(true)}>
            Read more
          </button>
        )}
        {isExpanded && (
          <button className="expand-btn" onClick={() => setIsExpanded(false)}>
            Show less
          </button>
        )}
      </div>

      <div className="card-footer">
        <div className="footer-left">
          <span className={`status-badge ${getStatusColor(item.writerStatus)}`}>
            {getStatusLabel(item.writerStatus)}
          </span>
          {item.confidence && (
            <span className="confidence-badge">
              {item.confidence} confidence
            </span>
          )}
          {item.sourceName && (
            <span className="source-name">{item.sourceName}</span>
          )}
        </div>
        <div className="footer-right">
          <span className="saved-date">
            {new Date(item.savedAt).toLocaleDateString()}
          </span>
          <button
            className="delete-btn"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to remove this from your Brewery?"
                )
              ) {
                onDelete(item.id);
              }
            }}
            aria-label="Delete item"
          >
            🗑️
          </button>
        </div>
      </div>

      {item.tags.length > 0 && (
        <div className="card-tags">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
