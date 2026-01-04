"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  company: string;
  industry: string;
  stage: string;
  challenges: string[];
  competitors: string[];
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    company: "",
    industry: "",
    stage: "",
    challenges: [],
    competitors: ["", "", ""],
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const industries = [
    "SaaS",
    "E-commerce",
    "Agency",
    "FinTech",
    "HealthTech",
    "EdTech",
    "Real Estate",
    "Manufacturing",
    "Retail",
    "Other",
  ];

  const stages = [
    "Pre-launch",
    "Just launched",
    "Growing",
    "Scaling",
    "Enterprise",
  ];

  const stageDescriptions: Record<string, string> = {
    "Pre-launch": "Building MVP, validating idea",
    "Just launched": "First customers, finding PMF",
    Growing: "$10K-100K MRR, team <10",
    Scaling: "$100K-1M MRR, team 10-50",
    Enterprise: "$1M+ MRR, team 50+",
  };

  const challenges = [
    "Finding product-market fit",
    "Tracking competitors",
    "Content creation",
    "Lead generation",
    "Customer retention",
    "Market positioning",
    "Pricing strategy",
    "Team scaling",
  ];

  // Auto-fill Alex's data with typing effect
  useEffect(() => {
    if (step === 1 && !formData.company) {
      const alexData = { company: "TaskFlow", industry: "SaaS" };
      let companyIndex = 0;

      const typeCompany = () => {
        if (companyIndex < alexData.company.length) {
          setFormData((prev) => ({
            ...prev,
            company: alexData.company.slice(0, companyIndex + 1),
          }));
          companyIndex++;
          setTimeout(typeCompany, 150);
        } else {
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, industry: alexData.industry }));
          }, 500);
        }
      };

      setTimeout(typeCompany, 1000);
    }
  }, [step, formData.company]);

  // Auto-select stage
  useEffect(() => {
    if (step === 2 && !formData.stage) {
      setTimeout(() => {
        setFormData((prev) => ({ ...prev, stage: "Just launched" }));
      }, 1000);
    }
  }, [step, formData.stage]);

  // Auto-select challenges
  useEffect(() => {
    if (step === 3 && formData.challenges.length === 0) {
      const alexChallenges = [
        "Finding product-market fit",
        "Lead generation",
        "Customer retention",
      ];
      let challengeIndex = 0;

      const selectChallenge = () => {
        if (challengeIndex < alexChallenges.length) {
          const challenge = alexChallenges[challengeIndex];
          if (challenge) {
            setFormData((prev) => ({
              ...prev,
              challenges: [...prev.challenges, challenge],
            }));
          }
          challengeIndex++;
          setTimeout(selectChallenge, 800);
        }
      };

      setTimeout(selectChallenge, 1000);
    }
  }, [step, formData.challenges.length]);

  // Auto-fill competitors
  useEffect(() => {
    if (step === 4 && formData.competitors[0] === "") {
      const alexCompetitors = ["Notion", "Airtable", "Monday.com"];
      setTimeout(() => {
        setFormData((prev) => ({ ...prev, competitors: alexCompetitors }));
      }, 1000);
    }
  }, [step, formData.competitors]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setStep(5);
      simulateAIAnalysis();
    }
  };

  const simulateAIAnalysis = () => {
    setIsProcessing(true);

    const responses = [
      `Perfect! I can see TaskFlow is in an exciting phase. As a SaaS in the "Just launched" stage, you're likely focused on finding that sweet spot of product-market fit.`,
      `Your biggest challenges - PMF, lead generation, and retention - are exactly what 67% of SaaS companies face in months 6-18. Here's what I'm seeing...`,
      `With Notion, Airtable, and Monday.com as competitors, you're in productivity/workflow space. That's a $12B market growing 13% annually.`,
      `Based on your profile, I'm configuring your Refleqt portal with focus areas: competitive positioning against workflow tools, PMF indicators for SaaS, and retention cohort analysis.`,
      `✨ Your personalized intelligence feed is ready! I've set up monitoring for TaskFlow's competitive landscape, market opportunities, and growth metrics.`,
    ];

    let responseIndex = 0;
    const showResponse = () => {
      if (responseIndex < responses.length) {
        const response = responses[responseIndex];
        if (response) {
          setAiResponse(response);
        }
        responseIndex++;
        setTimeout(showResponse, 2500);
      } else {
        setIsProcessing(false);
        setTimeout(() => {
          router.push("/portal");
        }, 2000);
      }
    };

    setTimeout(showResponse, 2000);
  };

  const toggleChallenge = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const progressPercentage = (step / 5) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto relative">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8 gap-2">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full transition-all ${
                stepNum < step
                  ? "bg-green-500"
                  : stepNum === step
                    ? "bg-blue-500 scale-125"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step 1: Company & Industry */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">
              Welcome to Refleqt! 👋
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Let's set up your personalized BI experience
            </p>

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-900">
                Company Name
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-colors ${
                  !formData.company
                    ? "border-r-4 border-r-blue-500 animate-pulse"
                    : ""
                }`}
                value={formData.company}
                readOnly
                placeholder="Your company name..."
              />
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-semibold text-gray-900">
                Industry
              </label>
              <div className="grid grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    className={`px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                      formData.industry === industry
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
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

        {/* Step 2: Stage */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">
              What stage is TaskFlow in?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              This helps us tailor your intelligence feed
            </p>

            <div className="flex flex-col gap-4">
              {stages.map((stage) => (
                <button
                  key={stage}
                  className={`text-left px-6 py-4 border-2 rounded-xl transition-all ${
                    formData.stage === stage
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-blue-300"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, stage }))}
                >
                  <div className="font-semibold text-gray-900">{stage}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stageDescriptions[stage]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Challenges */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">
              Current Challenges
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select all that keep you up at night
            </p>

            <div className="grid grid-cols-2 gap-3">
              {challenges.map((challenge) => (
                <button
                  key={challenge}
                  className={`px-4 py-3 border-2 rounded-xl text-sm font-medium text-left transition-all ${
                    formData.challenges.includes(challenge)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => toggleChallenge(challenge)}
                >
                  {challenge}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Competitors */}
        {step === 4 && (
          <div>
            <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">
              Who do you compete with?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              We'll track their moves for you
            </p>

            <div className="flex flex-col gap-4">
              {formData.competitors.map((competitor, index) => (
                <div key={index}>
                  <label className="block mb-2 font-semibold text-gray-900">
                    Competitor {index + 1}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500"
                    value={competitor}
                    placeholder={`Competitor ${index + 1} name...`}
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
          </div>
        )}

        {/* Step 5: Processing */}
        {step === 5 && (
          <div>
            <h2 className="text-3xl font-bold mb-5 text-center text-gray-900">
              🧠 Analyzing Your Business
            </h2>

            {isProcessing ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-5">✨</div>
                <h3 className="text-2xl font-bold text-green-600 mb-5">
                  Setup Complete!
                </h3>
                <p className="text-gray-600">
                  Entering your personalized intelligence portal...
                </p>
              </div>
            )}

            {aiResponse && (
              <div className="bg-gray-100 border-l-4 border-blue-500 rounded-xl p-5 mt-5">
                <p className="text-gray-900 leading-relaxed">{aiResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Button */}
        {step < 5 && (
          <button
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={handleNext}
            disabled={
              (step === 1 && (!formData.company || !formData.industry)) ||
              (step === 2 && !formData.stage) ||
              (step === 3 && formData.challenges.length === 0) ||
              (step === 4 && formData.competitors.filter((c) => c).length === 0)
            }
          >
            {step === 4 ? "🚀 Create My Portal" : "Continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
