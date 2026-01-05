"use client";

/**
 * Refleqt Landing Page
 * Beautiful marketing landing page with onboarding flow
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/onboarding/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type: "early_access",
          source: "landing_hero",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitMessage({
        type: "success",
        text: "Thank you! We'll notify you when we launch.",
      });
      setEmail("");
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect to portal after successful onboarding
    window.location.href = "/portal";
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f8fafc;
          color: #2d3748;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .header {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          z-index: 999;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-menu {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .nav-link {
          color: #4a5568;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .nav-cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 24px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.3s;
          cursor: pointer;
          border: none;
          font-size: 16px;
        }

        .nav-cta:hover {
          transform: scale(1.05);
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 120px 30px 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -250px;
          right: -250px;
        }

        .hero-section::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          bottom: -100px;
          left: -100px;
        }

        .hero-content {
          max-width: 800px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 56px;
          font-weight: bold;
          color: white;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .cta-button {
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cta-button.primary {
          background: white;
          color: #667eea;
        }

        .cta-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .email-capture {
          display: flex;
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
        }

        .email-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 20px;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .email-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .email-submit {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .email-submit:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .email-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-message {
          margin-top: 16px;
          font-size: 14px;
          animation: fadeIn 0.3s ease;
        }

        .submit-message.success {
          color: #48bb78;
        }

        .submit-message.error {
          color: #fc8181;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Features Section */
        .features-section {
          padding: 100px 30px;
          background: #f8fafc;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          text-align: center;
          font-size: 42px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 16px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 18px;
          color: #718096;
          margin-bottom: 60px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 24px;
        }

        .feature-title {
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 16px;
          color: #718096;
          line-height: 1.7;
        }

        /* CTA Section */
        .cta-section {
          padding: 100px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          text-align: center;
        }

        .cta-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 42px;
          font-weight: bold;
          color: white;
          margin-bottom: 20px;
        }

        .cta-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
        }

        /* Footer */
        .footer {
          background: #1a202c;
          padding: 60px 30px 30px;
          color: #a0aec0;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
        }

        .footer-brand {
          margin-bottom: 16px;
        }

        .footer-brand .logo {
          font-size: 24px;
        }

        .footer-description {
          font-size: 14px;
          line-height: 1.6;
        }

        .footer-links h4 {
          color: white;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .footer-links ul {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: #a0aec0;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 40px auto 0;
          padding-top: 30px;
          border-top: 1px solid #2d3748;
          text-align: center;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .nav-menu {
            display: none;
          }

          .header-content {
            justify-content: center;
          }

          .email-capture {
            flex-direction: column;
            border-radius: 16px;
            padding: 16px;
          }

          .email-input {
            text-align: center;
          }

          .email-submit {
            width: 100%;
          }

          .hero-buttons {
            flex-direction: column;
            padding: 0 20px;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

          .section-title {
            font-size: 32px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">Refleqt</div>
          <nav className="nav-menu">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#about" className="nav-link">
              About
            </a>
            <a href="#contact" className="nav-link">
              Contact
            </a>
            <button className="nav-cta" onClick={() => setShowOnboarding(true)}>
              Try Demo
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Stop Drowning in Data.
            <br />
            Start Obsessing Smart.
          </h1>
          <p className="hero-subtitle">
            The only Business Intelligence platform that thinks like a founder,
            obsesses like a strategist, and executes like a growth team.
          </p>

          <div className="hero-buttons">
            <button
              className="cta-button primary"
              onClick={() => setShowOnboarding(true)}
            >
              🚀 Get Started Now
            </button>
            <a href="#features" className="cta-button secondary">
              Explore Features
            </a>
          </div>

          <form onSubmit={handleEmailSubmit} className="email-capture">
            <input
              type="email"
              className="email-input"
              placeholder="Enter email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="email-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "..." : "Get Access"}
            </button>
          </form>

          {submitMessage && (
            <p className={`submit-message ${submitMessage.type}`}>
              {submitMessage.text}
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="section-title">Everything You Need to Obsess Smart</h2>
          <p className="section-subtitle">
            Powerful intelligence tools designed for founders who want to stay
            ahead of the competition.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📡</div>
              <h3 className="feature-title">Intelligence Feed</h3>
              <p className="feature-description">
                Real-time competitive intelligence from RSS feeds, news sources,
                and social media. Never miss a competitor move again.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3 className="feature-title">Research Swarms</h3>
              <p className="feature-description">
                AI-powered multi-agent research teams that dig deep into market
                trends, customer sentiment, and competitive positioning.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Strategy Cohorts</h3>
              <p className="feature-description">
                Compare and analyze competitors in cohorts. Understand pricing
                strategies, feature gaps, and market positioning.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Psychographics</h3>
              <p className="feature-description">
                Deep customer segment analysis. Understand motivations, pain
                points, and buying triggers across your funnel.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🍺</div>
              <h3 className="feature-title">The Brewery</h3>
              <p className="feature-description">
                Distill raw intelligence into actionable content: newsletters,
                strategy briefs, and competitive alerts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Smart Trackers</h3>
              <p className="feature-description">
                Set up automated monitoring for your research goals. Get
                notified when something important happens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Obsess Smart?</h2>
          <p className="cta-subtitle">
            Join hundreds of founders using Refleqt to make smarter, faster
            decisions.
          </p>
          <button
            className="cta-button primary"
            onClick={() => setShowOnboarding(true)}
            style={{ fontSize: "18px", padding: "20px 40px" }}
          >
            🚀 Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-brand">
              <span className="logo">Refleqt</span>
            </div>
            <p className="footer-description">
              AI-powered business intelligence for founders who obsess over
              winning.
            </p>
          </div>

          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <Link href="/portal">Portal</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Refleqt. All rights reserved.</p>
        </div>
      </footer>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
