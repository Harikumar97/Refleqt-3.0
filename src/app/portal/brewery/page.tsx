"use client";

import { useState, useEffect } from "react";
import type { BreweryItem } from "@/lib/types";
import { BreweryCard } from "@/components/brewery/BreweryCard";
import { WriterRequestModal } from "@/components/brewery/WriterRequestModal";
import "@/components/brewery/brewery.css";

export default function Brewery(): React.ReactElement {
  const [items, setItems] = useState<BreweryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BreweryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showWriterModal, setShowWriterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBreweryItems();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [items, activeFilter]);

  const fetchBreweryItems = async () => {
    try {
      const response = await fetch("/api/brewery");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch brewery items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = items;

    switch (activeFilter) {
      case "research-swarm":
      case "strategy-cohort":
      case "intelligence-feed":
        filtered = items.filter((item) => item.sourceType === activeFilter);
        break;
      case "saved":
      case "request-created":
      case "in-progress":
      case "completed":
        filtered = items.filter((item) => item.writerStatus === activeFilter);
        break;
      case "all":
      default:
        filtered = items;
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/brewery/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleWriterRequest = async (request: any) => {
    try {
      const response = await fetch("/api/brewery/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Writer request created successfully!");
        setShowWriterModal(false);
        setSelectedIds(new Set());
        fetchBreweryItems(); // Refresh to get updated status
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create writer request");
      }
    } catch (error) {
      console.error("Failed to create writer request:", error);
      alert("Failed to create writer request");
    }
  };

  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  const stats = {
    total: items.length,
    saved: items.filter((i) => i.writerStatus === "saved").length,
    inProgress: items.filter((i) =>
      ["request-created", "assigned", "in-progress"].includes(i.writerStatus)
    ).length,
    completed: items.filter((i) => i.writerStatus === "completed").length,
  };

  if (isLoading) {
    return (
      <div className="brewery-container">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading your Brewery...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="brewery-container">
      <div className="brewery-header">
        <h1 className="brewery-title">🍺 The Brewery</h1>
        <p className="brewery-subtitle">
          Your curated collection of insights ready to become compelling content
        </p>

        <div className="brewery-stats">
          <div className="stat-card">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Saved</div>
            <div className="stat-value">{stats.saved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completed}</div>
          </div>
        </div>
      </div>

      <div className="brewery-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${activeFilter === "research-swarm" ? "active" : ""}`}
            onClick={() => setActiveFilter("research-swarm")}
          >
            Research Swarms
          </button>
          <button
            className={`filter-tab ${activeFilter === "strategy-cohort" ? "active" : ""}`}
            onClick={() => setActiveFilter("strategy-cohort")}
          >
            Strategy Cohorts
          </button>
          <button
            className={`filter-tab ${activeFilter === "intelligence-feed" ? "active" : ""}`}
            onClick={() => setActiveFilter("intelligence-feed")}
          >
            Intelligence Feed
          </button>
        </div>

        <div className="action-buttons">
          {filteredItems.length > 0 && (
            <button className="btn btn-secondary" onClick={handleSelectAll}>
              {selectedIds.size === filteredItems.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowWriterModal(true)}
            disabled={selectedIds.size === 0}
          >
            Create Writer Request ({selectedIds.size})
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍺</div>
          <div className="empty-title">
            {items.length === 0
              ? "Your Brewery is Empty"
              : "No items match this filter"}
          </div>
          <p className="empty-subtitle">
            {items.length === 0
              ? "Start saving insights from Research Swarms, Strategy Cohorts, or Intelligence Feed"
              : "Try a different filter to see your saved insights"}
          </p>
        </div>
      ) : (
        <div className="brewery-grid">
          {filteredItems.map((item) => (
            <BreweryCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onSelect={handleSelect}
              isSelected={selectedIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {showWriterModal && (
        <WriterRequestModal
          selectedItems={selectedItems}
          onClose={() => setShowWriterModal(false)}
          onSubmit={handleWriterRequest}
        />
      )}
    </div>
  );
}
