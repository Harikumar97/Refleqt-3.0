"use client";

/**
 * User Menu Component
 * Displays user avatar and dropdown menu with sign-out option
 */

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="user-menu">
      <style jsx>{`
        .user-menu {
          position: relative;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .user-avatar:hover {
          border-color: #667eea;
          transform: scale(1.05);
        }

        .user-dropdown {
          position: absolute;
          top: 52px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          padding: 8px;
          min-width: 220px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }

        .user-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .user-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .user-email {
          font-size: 12px;
          color: #6b7280;
        }

        .dropdown-menu {
          padding: 4px 0;
        }

        .menu-item {
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-item:hover {
          background: #f3f4f6;
        }

        .menu-item.danger {
          color: #dc2626;
        }

        .menu-item.danger:hover {
          background: #fee2e2;
        }

        .menu-icon {
          font-size: 16px;
        }
      `}</style>

      <div className="user-avatar" onClick={() => setIsOpen(!isOpen)}>
        {userInitials}
      </div>

      <div className={`user-dropdown ${isOpen ? "open" : ""}`}>
        <div className="dropdown-header">
          <div className="user-name">{session.user.name}</div>
          <div className="user-email">{session.user.email}</div>
        </div>
        <div className="dropdown-menu">
          <div className="menu-item danger" onClick={handleSignOut}>
            <span className="menu-icon">🚪</span>
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
