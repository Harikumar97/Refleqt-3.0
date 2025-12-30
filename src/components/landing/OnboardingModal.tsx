"use client";

import { useState, useEffect } from "react";

interface OnboardingData {
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

interface OnboardingModalProps {
  onComplete: (data: OnboardingData) => void;
  onClose?: () => void;
}

const industries = [
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

const stages = [
  "Pre-launch / Idea",
  "Early Stage (0-10 users)",
  "Growth Stage (10-100 users)",
  "Scale Stage (100-1000 users)",
  "Enterprise (1000+ users)",
];

const challenges = [
  "Understanding competitor moves",
  "Low conversion rates",
  "User retention issues",
  "Market positioning unclear",
  "Limited market research",
  "Content strategy gaps",
  "Product-market fit uncertainty",
];

const regions = [
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "latin-america", label: "Latin America" },
  { value: "middle-east", label: "Middle East" },
  { value: "africa", label: "Africa" },
  { value: "global", label: "Global / Multiple Regions" },
];

export default function OnboardingModal({
  onComplete,
  onClose,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(6);
  const [formData, setFormData] = useState<OnboardingData>({
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
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);

  const processingSteps = [
    { text: "Analyzing your business context...", duration: 1500 },
    { text: "Mapping competitive landscape...", duration: 1800 },
    { text: "Identifying market opportunities...", duration: 1600 },
    { text: "Configuring intelligence feeds...", duration: 1400 },
    { text: "Setting up psychographic tracking...", duration: 1200 },
    { text: "Initializing your portal...", duration: 1000 },
  ];

  useEffect(() => {
    setTotalSteps(formData.operationScope === "international" ? 7 : 6);
  }, [formData.operationScope]);

  const handleNext = async () => {
    if (step === totalSteps) {
      await submitOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const submitOnboarding = async () => {
    setIsProcessing(true);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentProcessingStep(i);
      await new Promise((resolve) =>
        setTimeout(resolve, processingSteps[i]?.duration || 1000)
      );
    }

    // Complete processing
    setTimeout(() => {
      onComplete(formData);
    }, 500);
  };

  const toggleChallenge = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const progressPercentage = (step / totalSteps) * 100;

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.industry;
      case 2:
        return formData.operationRegion;
      case 3:
        return formData.companyStage;
      case 4:
        return formData.challenges.length > 0;
      case 5:
        return formData.competitors[0] && formData.hasExistingData !== null;
      case 6:
        return formData.goals;
      case 7:
        return formData.targetRegions && formData.needsRegionalIntel !== null;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-12 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp relative">
        {/* Close Button */}
        {onClose && !isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Step Indicator */}
        <div className="flex justify-center mb-8 gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < step - 1
                  ? "bg-green-500"
                  : i === step - 1
                    ? "bg-indigo-600 scale-125"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {!isProcessing ? (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  Welcome to Refleqt! 👋
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Let's set up your personalized intelligence portal
                </p>

                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-800 text-sm">
                    Industry *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        className={`p-4 border-2 rounded-xl text-sm font-medium transition-all ${
                          formData.industry === industry
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, industry }))
                        }
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  Where do you operate? 🌍
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  This helps us provide region-specific intelligence
                </p>

                <div className="mb-6">
                  <label className="block mb-3 font-semibold text-gray-800 text-sm">
                    Operation Scope *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["local", "national", "international"].map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        className={`p-4 border-2 rounded-xl font-medium transition-all ${
                          formData.operationScope === scope
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            operationScope: scope as any,
                          }))
                        }
                      >
                        {scope === "local" && "🏘️ Local"}
                        {scope === "national" && "🏛️ National"}
                        {scope === "international" && "🌐 International"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">
                    Primary Region *
                  </label>
                  <select
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                    value={formData.operationRegion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        operationRegion: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select region</option>
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  What stage are you in? 🚀
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  This helps us tailor your intelligence feed
                </p>

                <div className="flex flex-col gap-3">
                  {stages.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      className={`p-4 border-2 rounded-xl text-left font-medium transition-all ${
                        formData.companyStage === stage
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          companyStage: stage,
                        }))
                      }
                    >
                      {stage}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">
                    Team Size (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                    value={formData.teamSize}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        teamSize: e.target.value,
                      }))
                    }
                    placeholder="e.g., 5 people, Solo founder, 20+ team"
                  />
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  What are your biggest challenges? 🎯
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select all that apply - we'll prioritize these in your portal
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {challenges.map((challenge) => (
                    <button
                      key={challenge}
                      type="button"
                      className={`p-4 border-2 rounded-xl text-left text-sm font-medium min-h-[60px] transition-all ${
                        formData.challenges.includes(challenge)
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() => toggleChallenge(challenge)}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  Who are your top competitors? 🔍
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  We'll track their moves and keep you informed
                </p>

                <div className="space-y-4 mb-6">
                  {formData.competitors.map((competitor, index) => (
                    <div key={index}>
                      <label className="block mb-2 font-semibold text-gray-800 text-sm">
                        Competitor {index + 1}{" "}
                        {index === 0 ? "*" : "(Optional)"}
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        value={competitor}
                        placeholder={`Competitor ${index + 1} name or website`}
                        onChange={(e) => {
                          const newCompetitors = [...formData.competitors];
                          newCompetitors[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            competitors: newCompetitors,
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-800 text-sm">
                    Do you have existing analytics or customer data?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-xl font-medium transition-all ${
                        formData.hasExistingData === true
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hasExistingData: true,
                        }))
                      }
                    >
                      ✓ Yes, I have data
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-xl font-medium transition-all ${
                        formData.hasExistingData === false
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hasExistingData: false,
                        }))
                      }
                    >
                      ✗ Starting fresh
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  What are your primary goals? 💡
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Tell us what success looks like for you
                </p>

                <div>
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">
                    Describe your goals (be specific) *
                  </label>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-xl min-h-[100px] transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                    value={formData.goals}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        goals: e.target.value,
                      }))
                    }
                    placeholder="e.g., Increase user retention by 25% in 6 months, understand why users churn after trial, improve conversion from free to paid..."
                  />
                </div>

                <div className="mt-5 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> The more specific your goals, the
                    better we can configure your intelligence feeds and research
                    priorities.
                  </p>
                </div>
              </div>
            )}

            {/* Step 7 - International */}
            {step === 7 && formData.operationScope === "international" && (
              <div>
                <h2 className="text-3xl font-bold mb-3 text-center">
                  International Strategy 🌐
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Since you operate internationally, help us understand your
                  approach
                </p>

                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">
                    Which regions are you actively targeting? *
                  </label>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-xl min-h-[80px] transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                    value={formData.targetRegions || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetRegions: e.target.value,
                      }))
                    }
                    placeholder="e.g., North America and Europe primarily, expanding to Asia-Pacific next year..."
                  />
                </div>

                <div>
                  <label className="block mb-3 font-semibold text-gray-800 text-sm">
                    Do you need region-specific competitive intelligence?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-xl font-medium transition-all ${
                        formData.needsRegionalIntel === true
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          needsRegionalIntel: true,
                        }))
                      }
                    >
                      ✓ Yes, different competitors per region
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-xl font-medium transition-all ${
                        formData.needsRegionalIntel === false
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-indigo-600 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          needsRegionalIntel: false,
                        }))
                      }
                    >
                      ✗ No, same competitors globally
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="w-full mt-8 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {step === totalSteps ? "🚀 Create My Portal" : "Continue →"}
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-6xl mb-6 animate-pulse">🧠</div>
            <h2 className="text-2xl font-bold mb-3">
              Setting Up Your Intelligence Portal
            </h2>
            <p className="text-gray-600 mb-8">
              Our AI is analyzing your business and configuring personalized
              insights...
            </p>

            <div className="space-y-3 text-left">
              {processingSteps.map((stepData, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 transition-all ${
                    index === currentProcessingStep
                      ? "border-indigo-600 bg-indigo-50"
                      : index < currentProcessingStep
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {index < currentProcessingStep && (
                    <span className="text-green-500 mr-3">✓</span>
                  )}
                  {index === currentProcessingStep && (
                    <span className="inline-block w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3" />
                  )}
                  {index > currentProcessingStep && (
                    <span className="mr-3">⏳</span>
                  )}
                  <span>{stepData.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
