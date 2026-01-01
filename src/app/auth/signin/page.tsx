"use client";

/**
 * Sign-In Page
 * Handles user authentication with Google OAuth
 */

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="signin-container">
      <style jsx>{`
        .signin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .signin-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .signin-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .signin-logo {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .signin-title {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .signin-subtitle {
          font-size: 16px;
          color: #6b7280;
        }

        .signin-content {
          margin-bottom: 32px;
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          color: #991b1b;
          font-size: 14px;
        }

        .signin-button {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .signin-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .signin-button:active {
          transform: translateY(0);
        }

        .google-icon {
          font-size: 24px;
        }

        .signin-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 24px 0;
        }

        .features-list li {
          padding: 12px 0;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature-icon {
          font-size: 20px;
        }
      `}</style>

      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">🔬</div>
          <h1 className="signin-title">Refleqt</h1>
          <p className="signin-subtitle">
            Stop Drowning in Data. Start Obsessing Smart.
          </p>
        </div>

        <div className="signin-content">
          {error && (
            <div className="error-message">
              {error === "OAuthSignin"
                ? "Error connecting to authentication provider"
                : error === "OAuthCallback"
                  ? "Error during authentication callback"
                  : error === "OAuthCreateAccount"
                    ? "Could not create account"
                    : error === "EmailCreateAccount"
                      ? "Could not create account"
                      : error === "Callback"
                        ? "Authentication callback failed"
                        : error === "OAuthAccountNotLinked"
                          ? "Email already associated with another account"
                          : error === "EmailSignin"
                            ? "Check your email for sign-in link"
                            : error === "CredentialsSignin"
                              ? "Invalid credentials"
                              : error === "SessionRequired"
                                ? "Please sign in to access this page"
                                : "An error occurred during sign-in"}
            </div>
          )}

          <ul className="features-list">
            <li>
              <span className="feature-icon">🔬</span>
              <span>AI-powered competitive intelligence</span>
            </li>
            <li>
              <span className="feature-icon">🎯</span>
              <span>Strategic insights from multi-LLM analysis</span>
            </li>
            <li>
              <span className="feature-icon">🍺</span>
              <span>Curate insights into compelling content</span>
            </li>
          </ul>

          <button onClick={handleGoogleSignIn} className="signin-button">
            <span className="google-icon">🔐</span>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="signin-footer">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
