/**
 * Cohort Actions Menu Component
 * Comprehensive actions menu with all cohort operations
 */

"use client";

import { useState } from "react";
import ExportMenu from "./ExportMenu";
import ShareModal from "./ShareModal";
import RefinementPanel from "./RefinementPanel";
import IntegrationHub from "./IntegrationHub";
import type { CohortInsight } from "@/lib/strategy-cohorts/types";

interface CohortActionsMenuProps {
  cohortId: string;
  cohortName: string;
  insights: CohortInsight[];
  onRefine?: (insights: CohortInsight[]) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

type ActiveModal =
  | "export"
  | "share"
  | "refine"
  | "integrate"
  | "duplicate"
  | "delete"
  | null;

export default function CohortActionsMenu({
  cohortId,
  cohortName,
  insights,
  onRefine,
  onDuplicate,
  onDelete,
}: CohortActionsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const actionGroups = [
    {
      title: "External Data Transfer",
      actions: [
        {
          id: "export" as ActiveModal,
          name: "Export Analysis",
          icon: "📤",
          description: "Download as PDF, Excel, PowerPoint, or JSON",
        },
        {
          id: "share" as ActiveModal,
          name: "Share with Team",
          icon: "👥",
          description: "Collaborate with team members",
        },
      ],
    },
    {
      title: "Internal Data Synthesis",
      actions: [
        {
          id: "integrate" as ActiveModal,
          name: "Integration Hub",
          icon: "🔗",
          description: "Connect with Psychographics, Intelligence Feed, etc.",
        },
        {
          id: "duplicate" as ActiveModal,
          name: "Duplicate Cohort",
          icon: "📋",
          description: "Create a copy for comparison",
        },
      ],
    },
    {
      title: "Edit & Refine",
      actions: [
        {
          id: "refine" as ActiveModal,
          name: "Refine Insights",
          icon: "✨",
          description: "Edit insights or generate additional ones",
        },
        {
          id: "delete" as ActiveModal,
          name: "Delete Cohort",
          icon: "🗑️",
          description: "Permanently remove this analysis",
          danger: true,
        },
      ],
    },
  ];

  const handleAction = (actionId: ActiveModal) => {
    setIsMenuOpen(false);
    if (actionId === "duplicate" && onDuplicate) {
      onDuplicate();
    } else if (actionId === "delete" && onDelete) {
      if (
        confirm(
          "Are you sure you want to delete this cohort? This action cannot be undone."
        )
      ) {
        onDelete();
      }
    } else {
      setActiveModal(actionId);
    }
  };

  return (
    <>
      <style jsx>{`
        .actions-menu-container {
          position: relative;
        }

        .menu-button {
          padding: 10px 16px;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-button:hover {
          border-color: #f5576c;
          color: #f5576c;
          background: #fef2f4;
        }

        .menu-button.open {
          border-color: #f5576c;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          min-width: 320px;
          z-index: 100;
          padding: 8px;
        }

        .menu-group {
          margin-bottom: 8px;
        }

        .menu-group:last-child {
          margin-bottom: 0;
        }

        .group-title {
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .menu-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .menu-item:hover {
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
        }

        .menu-item.danger:hover {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .item-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .item-name.danger {
          color: #991b1b;
        }

        .item-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.3;
        }

        .menu-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 8px 0;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
        }
      `}</style>

      <div className="actions-menu-container">
        <button
          className={`menu-button ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span>⚙️</span>
          <span>Actions</span>
          <span>{isMenuOpen ? "▲" : "▼"}</span>
        </button>

        {isMenuOpen && (
          <>
            <div className="overlay" onClick={() => setIsMenuOpen(false)} />
            <div className="dropdown-menu">
              {actionGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="menu-group">
                  <div className="group-title">{group.title}</div>
                  {group.actions.map((action) => (
                    <div
                      key={action.id}
                      className={`menu-item ${action.danger ? "danger" : ""}`}
                      onClick={() => handleAction(action.id)}
                    >
                      <span className="item-icon">{action.icon}</span>
                      <div className="item-content">
                        <div
                          className={`item-name ${action.danger ? "danger" : ""}`}
                        >
                          {action.name}
                        </div>
                        <div className="item-description">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {groupIdx < actionGroups.length - 1 && (
                    <div className="menu-divider" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {activeModal === "export" && (
        <ExportMenu
          cohortId={cohortId}
          cohortName={cohortName}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "share" && (
        <ShareModal
          cohortId={cohortId}
          cohortName={cohortName}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "refine" && onRefine && (
        <RefinementPanel
          cohortId={cohortId}
          insights={insights}
          onRefine={(newInsights) => {
            onRefine(newInsights);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "integrate" && (
        <IntegrationHub
          cohortId={cohortId}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
