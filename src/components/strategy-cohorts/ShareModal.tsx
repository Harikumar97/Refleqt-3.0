/**
 * Share Modal Component
 * Team Collaboration - Share cohort analysis with team members
 */

"use client";

import { useState } from "react";

interface ShareModalProps {
  cohortId: string;
  cohortName: string;
  onClose: () => void;
}

type SharePermission = "view" | "edit" | "admin";

export default function ShareModal({
  cohortId,
  cohortName,
  onClose,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [shareLink, setShareLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWith, setSharedWith] = useState<
    Array<{ email: string; permission: SharePermission; addedAt: Date }>
  >([]);

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/share/link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission }),
        }
      );

      const data = await response.json();
      setShareLink(data.shareLink);
    } catch (error) {
      console.error("Failed to generate link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleShareWithEmail = async () => {
    if (!email.trim()) return;

    setIsSharing(true);
    try {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/share/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, permission }),
        }
      );

      if (response.ok) {
        setSharedWith([
          ...sharedWith,
          { email, permission, addedAt: new Date() },
        ]);
        setEmail("");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <style jsx>{`
        .share-modal-overlay {
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

        .share-modal {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 550px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          margin-bottom: 24px;
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

        .share-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .email-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .email-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .email-input:focus {
          outline: none;
          border-color: #f5576c;
        }

        .permission-select {
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .share-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .share-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .shared-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .shared-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .shared-email {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .shared-permission {
          font-size: 11px;
          color: #6b7280;
          padding: 4px 8px;
          background: #e5e7eb;
          border-radius: 6px;
        }

        .link-section {
          padding: 16px;
          background: linear-gradient(135deg, #fef2f4 0%, #fee2e7 100%);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .link-container {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .link-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #f5576c;
          border-radius: 8px;
          font-size: 13px;
          background: white;
        }

        .copy-button {
          padding: 10px 16px;
          background: white;
          color: #f5576c;
          border: 2px solid #f5576c;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-button:hover {
          background: #f5576c;
          color: white;
        }

        .generate-button {
          padding: 10px 16px;
          background: white;
          color: #f5576c;
          border: 2px solid #f5576c;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .generate-button:hover:not(:disabled) {
          background: #f5576c;
          color: white;
        }

        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .permissions-info {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-top: 12px;
        }

        .info-item {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .info-item:last-child {
          margin-bottom: 0;
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
        }

        .close-button:hover {
          border-color: #f5576c;
          color: #f5576c;
        }
      `}</style>

      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Share Analysis</h2>
          <p className="modal-subtitle">
            Collaborate with your team on "{cohortName}"
          </p>
        </div>

        <div className="share-section">
          <h3 className="section-title">Share via Email</h3>
          <div className="email-input-group">
            <input
              type="email"
              className="email-input"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="permission-select"
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="share-button"
              onClick={handleShareWithEmail}
              disabled={isSharing || !email.trim()}
            >
              {isSharing ? "Sharing..." : "Share"}
            </button>
          </div>

          {sharedWith.length > 0 && (
            <div className="shared-list">
              {sharedWith.map((item, idx) => (
                <div key={idx} className="shared-item">
                  <span className="shared-email">{item.email}</span>
                  <span className="shared-permission">{item.permission}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="share-section">
          <h3 className="section-title">Share via Link</h3>
          <div className="link-section">
            {!shareLink ? (
              <button
                className="generate-button"
                onClick={handleGenerateLink}
                disabled={isGeneratingLink}
              >
                {isGeneratingLink ? "Generating..." : "Generate Share Link"}
              </button>
            ) : (
              <div className="link-container">
                <input
                  type="text"
                  className="link-input"
                  value={shareLink}
                  readOnly
                />
                <button className="copy-button" onClick={handleCopyLink}>
                  Copy
                </button>
              </div>
            )}
          </div>

          <div className="permissions-info">
            <div className="info-item">
              <strong>View Only:</strong> Can view insights and charts
            </div>
            <div className="info-item">
              <strong>Can Edit:</strong> Can modify insights and add notes
            </div>
            <div className="info-item">
              <strong>Admin:</strong> Full access including sharing and deletion
            </div>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
