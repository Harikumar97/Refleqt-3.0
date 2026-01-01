"use client";

/**
 * Authentication Error Page
 * Displays authentication errors with helpful messages
 */

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="error-container">
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .error-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .error-icon {
          font-size: 72px;
          margin-bottom: 24px;
        }

        .error-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 16px;
        }

        .error-message {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
        }
      `}</style>

      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">Authentication Error</h1>
        <p className="error-message">{getErrorMessage(error)}</p>
        <div className="error-actions">
          <Link href="/auth/signin" className="btn btn-primary">
            Try Again
          </Link>
          <Link href="/" className="btn btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
