"use client";

/**
 * OnboardingModal - Multi-step onboarding flow
 * Collects user information and sets up their intelligence portal
 */

import { useState, useEffect, useCallback } from "react";

// Type definitions
interface OnboardingFormData {
  companyName: string;
  industry: string;
  companyStage: string;
  operationRegion: string;
  operationScope: "local" | "national" | "international";
  challenges: string[];
  competitors: string[];
  goals: string;
  teamSize: string;
  hasExistingData: boolean | null;
  targetRegions?: string;
  needsRegionalIntel?: boolean | null;
}

interface ProcessingStep {
  text: string;
  duration: number;
}

interface OnboardingModalProps {
  onComplete: () => void;
  onClose: () => void;
}

// Constants
const INDUSTRIES = [
  "SaaS",
  "E-commerce",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Marketing",
  "Consulting",
  "Manufacturing",
  "Other",
];

const STAGES = [
  "Pre-launch / Idea",
  "Early Stage (0-10 users)",
  "Growth Stage (10-100 users)",
  "Scale Stage (100-1000 users)",
  "Enterprise (1000+ users)",
];

const CHALLENGES = [
  "Understanding competitor moves",
  "Low conversion rates",
  "User retention issues",
  "Market positioning unclear",
  "Limited market research",
  "Content strategy gaps",
  "Product-market fit uncertainty",
];

const REGIONS = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "latin-america", label: "Latin America" },
  { value: "middle-east", label: "Middle East" },
  { value: "africa", label: "Africa" },
  { value: "global", label: "Global / Multiple Regions" },
];

const PROCESSING_STEPS: ProcessingStep[] = [
  { text: "Analyzing your business context...", duration: 1500 },
  { text: "Mapping competitive landscape...", duration: 1800 },
  { text: "Identifying market opportunities...", duration: 1600 },
  { text: "Configuring intelligence feeds...", duration: 1400 },
  { text: "Setting up psychographic tracking...", duration: 1200 },
  { text: "Initializing your portal...", duration: 1000 },
];

export function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(6);
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    industry: "",
    companyStage: "",
    operationRegion: "",
    operationScope: "local",
    challenges: [],
    competitors: ["", "", ""],
    goals: "",
    teamSize: "",
    hasExistingData: null,
    targetRegions: "",
    needsRegionalIntel: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically adjust form flow based on responses
  useEffect(() => {
    if (formData.operationScope === "international") {
      setTotalSteps(7);
    } else {
      setTotalSteps(6);
    }
  }, [formData.operationScope]);

  const updateFormData = useCallback(
    <K extends keyof OnboardingFormData>(
      key: K,
      value: OnboardingFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleChallenge = useCallback((challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  }, []);

  const updateCompetitor = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newCompetitors = [...prev.competitors];
      newCompetitors[index] = value;
      return { ...prev, competitors: newCompetitors };
    });
  }, []);

  const submitOnboarding = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Animate through processing steps
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setCurrentProcessingStep(i);
        const step = PROCESSING_STEPS[i];
        if (step) {
          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }
      }

      // Send to backend API
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          competitors: formData.competitors.filter((c) => c.trim() !== ""),
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      setIsComplete(true);

      // Wait a moment to show success state
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch {
      setError(
        "We're experiencing technical difficulties. Please try again in a moment."
      );
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (step === totalSteps) {
      await submitOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return formData.companyName.trim() !== "" && formData.industry !== "";
      case 2:
        return formData.operationRegion !== "";
      case 3:
        return formData.companyStage !== "";
      case 4:
        return formData.challenges.length > 0;
      case 5:
        return (
          (formData.competitors[0]?.trim() ?? "") !== "" &&
          formData.hasExistingData !== null
        );
      case 6:
        return formData.goals.trim() !== "";
      case 7:
        return (
          (formData.targetRegions?.trim() ?? "") !== "" &&
          formData.needsRegionalIntel !== null
        );
      default:
        return true;
    }
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <>
      <style jsx>{`
        .onboarding-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .onboarding-content {
          background: white;
          border-radius: 24px;
          padding: 48px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
          position: relative;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f7fafc;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          color: #718096;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #edf2f7;
          color: #2d3748;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          gap: 8px;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
          transition: all 0.3s;
        }

        .step-dot.active {
          background: #667eea;
          transform: scale(1.3);
        }

        .step-dot.completed {
          background: #10b981;
        }

        .progress-bar {
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin-bottom: 30px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .step-title {
          font-size: 28px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 12px;
          text-align: center;
        }

        .step-subtitle {
          color: #718096;
          text-align: center;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s;
          font-family: inherit;
          background: white;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .option-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .option-button {
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          color: #2d3748;
        }

        .option-button:hover {
          border-color: #667eea;
          background: #f7fafc;
        }

        .option-button.selected {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .stage-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stage-button {
          padding: 16px;
          text-align: left;
        }

        .button-row {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .back-button {
          padding: 16px 24px;
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .back-button:hover {
          background: #edf2f7;
        }

        .next-button {
          flex: 1;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .next-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tip-box {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 12px;
          margin-top: 20px;
          border: 1px solid #bae6fd;
          font-size: 14px;
          color: #0c4a6e;
        }

        /* Processing Animation */
        .processing-container {
          text-align: center;
          padding: 40px 20px;
        }

        .processing-icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .processing-title {
          font-size: 24px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .processing-subtitle {
          color: #718096;
          margin-bottom: 30px;
        }

        .processing-steps {
          text-align: left;
        }

        .processing-step {
          padding: 16px;
          margin-bottom: 12px;
          background: #f7fafc;
          border-radius: 12px;
          border-left: 4px solid #e2e8f0;
          transition: all 0.3s;
          display: flex;
          align-items: center;
        }

        .processing-step.active {
          border-left-color: #667eea;
          background: #eef2ff;
        }

        .processing-step.completed {
          border-left-color: #10b981;
          background: #f0fdf4;
        }

        .step-icon {
          margin-right: 12px;
          font-size: 18px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Profile Summary */
        .profile-summary {
          background: #f7fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 30px;
          text-align: left;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .profile-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          font-weight: bold;
        }

        .profile-info h3 {
          color: #2d3748;
          font-size: 20px;
          margin-bottom: 4px;
        }

        .profile-info p {
          color: #718096;
          font-size: 14px;
        }

        .profile-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          background: white;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }

        .detail-label {
          font-size: 12px;
          color: #718096;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .detail-value {
          font-weight: 600;
          color: #2d3748;
        }

        /* Success State */
        .success-container {
          text-align: center;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-icon {
          color: white;
          font-size: 40px;
        }

        .success-title {
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 12px;
        }

        .success-subtitle {
          color: #718096;
          margin-bottom: 24px;
        }

        /* Error State */
        .error-container {
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin-top: 30px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .error-title {
          color: #ef4444;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 12px;
        }

        .error-message {
          color: #6b7280;
          margin-bottom: 16px;
        }

        .retry-button {
          padding: 12px 24px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .retry-button:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .onboarding-content {
            padding: 32px 24px;
          }

          .option-grid {
            grid-template-columns: 1fr;
          }

          .profile-details {
            grid-template-columns: 1fr;
          }

          .step-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="onboarding-modal">
        <div className="onboarding-content">
          <button className="close-button" onClick={onClose}>
            ✕
          </button>

          {/* Step Indicator */}
          <div className="step-indicator">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`step-dot ${
                  i < step - 1 ? "completed" : i === step - 1 ? "active" : ""
                }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Form Steps */}
          {!isProcessing && !error && (
            <>
              {/* Step 1: Welcome & Company Info */}
              {step === 1 && (
                <div>
                  <h2 className="step-title">Welcome to Refleqt! 👋</h2>
                  <p className="step-subtitle">
                    Let's set up your personalized intelligence portal
                  </p>

                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.companyName}
                      onChange={(e) =>
                        updateFormData("companyName", e.target.value)
                      }
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry *</label>
                    <div className="option-grid">
                      {INDUSTRIES.map((industry) => (
                        <button
                          key={industry}
                          type="button"
                          className={`option-button ${
                            formData.industry === industry ? "selected" : ""
                          }`}
                          onClick={() => updateFormData("industry", industry)}
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Operation Region */}
              {step === 2 && (
                <div>
                  <h2 className="step-title">Where do you operate? 🌍</h2>
                  <p className="step-subtitle">
                    This helps us provide region-specific intelligence
                  </p>

                  <div className="form-group">
                    <label className="form-label">Operation Scope *</label>
                    <div
                      className="option-grid"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                    >
                      <button
                        type="button"
                        className={`option-button ${
                          formData.operationScope === "local" ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateFormData("operationScope", "local")
                        }
                      >
                        🏘️ Local
                      </button>
                      <button
                        type="button"
                        className={`option-button ${
                          formData.operationScope === "national"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateFormData("operationScope", "national")
                        }
                      >
                        🏛️ National
                      </button>
                      <button
                        type="button"
                        className={`option-button ${
                          formData.operationScope === "international"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateFormData("operationScope", "international")
                        }
                      >
                        🌐 International
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Region *</label>
                    <select
                      className="form-select"
                      value={formData.operationRegion}
                      onChange={(e) =>
                        updateFormData("operationRegion", e.target.value)
                      }
                    >
                      <option value="">Select region</option>
                      {REGIONS.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Company Stage */}
              {step === 3 && (
                <div>
                  <h2 className="step-title">What stage are you in? 🚀</h2>
                  <p className="step-subtitle">
                    This helps us tailor your intelligence feed
                  </p>

                  <div className="stage-list">
                    {STAGES.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        className={`option-button stage-button ${
                          formData.companyStage === stage ? "selected" : ""
                        }`}
                        onClick={() => updateFormData("companyStage", stage)}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: "24px" }}>
                    <label className="form-label">Team Size (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.teamSize}
                      onChange={(e) =>
                        updateFormData("teamSize", e.target.value)
                      }
                      placeholder="e.g., 5 people, Solo founder, 20+ team"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Challenges */}
              {step === 4 && (
                <div>
                  <h2 className="step-title">
                    What are your biggest challenges? 🎯
                  </h2>
                  <p className="step-subtitle">
                    Select all that apply - we'll prioritize these in your
                    portal
                  </p>

                  <div className="option-grid">
                    {CHALLENGES.map((challenge) => (
                      <button
                        key={challenge}
                        type="button"
                        className={`option-button ${
                          formData.challenges.includes(challenge)
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => toggleChallenge(challenge)}
                        style={{
                          textAlign: "left",
                          height: "auto",
                          minHeight: "60px",
                        }}
                      >
                        {challenge}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Competitors */}
              {step === 5 && (
                <div>
                  <h2 className="step-title">
                    Who are your top competitors? 🔍
                  </h2>
                  <p className="step-subtitle">
                    We'll track their moves and keep you informed
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {formData.competitors.map((competitor, index) => (
                      <div
                        key={index}
                        className="form-group"
                        style={{ marginBottom: 0 }}
                      >
                        <label className="form-label">
                          Competitor {index + 1}{" "}
                          {index === 0 ? "*" : "(Optional)"}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={competitor}
                          placeholder={`Competitor ${index + 1} name or website`}
                          onChange={(e) =>
                            updateCompetitor(index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: "24px" }}>
                    <label className="form-label">
                      Do you have existing analytics or customer data?
                    </label>
                    <div
                      className="option-grid"
                      style={{ gridTemplateColumns: "1fr 1fr" }}
                    >
                      <button
                        type="button"
                        className={`option-button ${
                          formData.hasExistingData === true ? "selected" : ""
                        }`}
                        onClick={() => updateFormData("hasExistingData", true)}
                      >
                        ✓ Yes, I have data
                      </button>
                      <button
                        type="button"
                        className={`option-button ${
                          formData.hasExistingData === false ? "selected" : ""
                        }`}
                        onClick={() => updateFormData("hasExistingData", false)}
                      >
                        ✗ Starting fresh
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Goals */}
              {step === 6 && (
                <div>
                  <h2 className="step-title">
                    What are your primary goals? 💡
                  </h2>
                  <p className="step-subtitle">
                    Tell us what success looks like for you
                  </p>

                  <div className="form-group">
                    <label className="form-label">
                      Describe your goals (be specific) *
                    </label>
                    <textarea
                      className="form-textarea"
                      value={formData.goals}
                      onChange={(e) => updateFormData("goals", e.target.value)}
                      placeholder="e.g., Increase user retention by 25% in 6 months, understand why users churn after trial, improve conversion from free to paid..."
                    />
                  </div>

                  <div className="tip-box">
                    💡 <strong>Tip:</strong> The more specific your goals, the
                    better we can configure your intelligence feeds and research
                    priorities.
                  </div>
                </div>
              )}

              {/* Step 7: International Strategy (conditional) */}
              {step === 7 && formData.operationScope === "international" && (
                <div>
                  <h2 className="step-title">International Strategy 🌐</h2>
                  <p className="step-subtitle">
                    Since you operate internationally, help us understand your
                    approach
                  </p>

                  <div className="form-group">
                    <label className="form-label">
                      Which regions are you actively targeting? *
                    </label>
                    <textarea
                      className="form-textarea"
                      value={formData.targetRegions}
                      onChange={(e) =>
                        updateFormData("targetRegions", e.target.value)
                      }
                      placeholder="e.g., North America and Europe primarily, expanding to Asia-Pacific next year..."
                      style={{ minHeight: "80px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Do you need region-specific competitive intelligence?
                    </label>
                    <div
                      className="option-grid"
                      style={{ gridTemplateColumns: "1fr 1fr" }}
                    >
                      <button
                        type="button"
                        className={`option-button ${
                          formData.needsRegionalIntel === true ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateFormData("needsRegionalIntel", true)
                        }
                      >
                        ✓ Yes, different competitors per region
                      </button>
                      <button
                        type="button"
                        className={`option-button ${
                          formData.needsRegionalIntel === false
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          updateFormData("needsRegionalIntel", false)
                        }
                      >
                        ✗ No, same competitors globally
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="button-row">
                {step > 1 && (
                  <button
                    type="button"
                    className="back-button"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  className="next-button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  {step === totalSteps ? "🚀 Create My Portal" : "Continue →"}
                </button>
              </div>
            </>
          )}

          {/* Processing State */}
          {isProcessing && !isComplete && !error && (
            <div className="processing-container">
              <div className="processing-icon">🧠</div>
              <h2 className="processing-title">
                Setting Up Your Intelligence Portal
              </h2>
              <p className="processing-subtitle">
                Our AI is analyzing your business and configuring personalized
                insights...
              </p>

              {/* Profile Summary */}
              <div className="profile-summary">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {formData.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3>{formData.companyName}</h3>
                    <p>
                      {formData.industry} • {formData.companyStage}
                    </p>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <div className="detail-label">Region</div>
                    <div className="detail-value">
                      {REGIONS.find((r) => r.value === formData.operationRegion)
                        ?.label || formData.operationRegion}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Top Challenge</div>
                    <div className="detail-value">
                      {formData.challenges[0] || "N/A"}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Competitors</div>
                    <div className="detail-value">
                      {formData.competitors.filter((c) => c).length} tracked
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Scope</div>
                    <div className="detail-value">
                      {formData.operationScope.charAt(0).toUpperCase() +
                        formData.operationScope.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Steps */}
              <div className="processing-steps">
                {PROCESSING_STEPS.map((stepData, index) => (
                  <div
                    key={index}
                    className={`processing-step ${
                      index === currentProcessingStep
                        ? "active"
                        : index < currentProcessingStep
                          ? "completed"
                          : ""
                    }`}
                  >
                    {index < currentProcessingStep && (
                      <span className="step-icon">✓</span>
                    )}
                    {index === currentProcessingStep && (
                      <div className="spinner" />
                    )}
                    {index > currentProcessingStep && (
                      <span className="step-icon">⏳</span>
                    )}
                    <span>{stepData.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {isComplete && (
            <div className="success-container">
              <div className="success-checkmark">
                <span className="success-icon">✓</span>
              </div>
              <h2 className="success-title">Portal Ready!</h2>
              <p className="success-subtitle">
                Your personalized intelligence portal is configured and ready to
                use.
              </p>

              {/* Profile Summary */}
              <div className="profile-summary">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {formData.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3>{formData.companyName}</h3>
                    <p>
                      {formData.industry} • {formData.companyStage}
                    </p>
                  </div>
                </div>
                <div className="profile-details">
                  <div className="detail-item">
                    <div className="detail-label">Region</div>
                    <div className="detail-value">
                      {REGIONS.find((r) => r.value === formData.operationRegion)
                        ?.label || formData.operationRegion}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Challenges</div>
                    <div className="detail-value">
                      {formData.challenges.length} prioritized
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Competitors</div>
                    <div className="detail-value">
                      {formData.competitors.filter((c) => c).length} tracked
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value" style={{ color: "#10b981" }}>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3 className="error-title">Setup Temporarily Unavailable</h3>
              <p className="error-message">{error}</p>
              <button
                className="retry-button"
                onClick={() => {
                  setError(null);
                  submitOnboarding();
                }}
              >
                Try Again
              </button>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                  marginTop: "16px",
                }}
              >
                If this persists, please contact support at support@refleqt.io
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
