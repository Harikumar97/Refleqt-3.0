"use client";

interface FeatureModalProps {
  feature: string | null;
  onClose: () => void;
  onStartDemo: () => void;
}

const featureDetails: Record<
  string,
  {
    icon: string;
    title: string;
    description: string;
    features: string[];
  }
> = {
  "intelligence-feed": {
    icon: "📊",
    title: "Intelligence Feed",
    description:
      "Your personalized business intelligence dashboard that cuts through the noise and delivers only the insights that matter to your growth.",
    features: [
      "Real-time competitive intelligence monitoring",
      "Industry trend analysis and alerts",
      "Custom KPI tracking and visualization",
      "AI-powered anomaly detection",
      "Automated report generation",
      "Multi-source data integration",
    ],
  },
  "research-swarms": {
    icon: "🔬",
    title: "Research Swarms",
    description:
      "AI-powered research that thinks like your best analyst team, delivering comprehensive market intelligence in minutes instead of weeks.",
    features: [
      "Deep market research automation",
      "Competitive landscape analysis",
      "Customer sentiment tracking",
      "Industry expert insights aggregation",
      "Data validation and source verification",
      "Customizable research templates",
    ],
  },
  "strategy-cohorts": {
    icon: "🎯",
    title: "Strategy Cohorts",
    description:
      "Strategic scenario planning that stress-tests your business decisions against multiple market conditions and competitive responses.",
    features: [
      "Multi-scenario strategic planning",
      "Risk assessment and mitigation",
      "Competitive response modeling",
      "Market opportunity analysis",
      "ROI prediction and optimization",
      "Decision tree visualization",
    ],
  },
  psychographics: {
    icon: "🧠",
    title: "Psychographics",
    description:
      "Deep customer psychology insights that reveal not just what your customers do, but why they do it and how to influence their decisions.",
    features: [
      "Customer personality profiling",
      "Behavioral pattern analysis",
      "Motivation and trigger identification",
      "Segmentation by psychological traits",
      "Messaging optimization recommendations",
      "Purchase decision journey mapping",
    ],
  },
  brewery: {
    icon: "🍺",
    title: "The Brewery",
    description:
      "Content creation that converts. AI-powered writing that captures your unique voice while driving measurable business results.",
    features: [
      "Brand voice analysis and replication",
      "Multi-channel content optimization",
      "Conversion-focused copywriting",
      "A/B testing and optimization",
      "Content performance analytics",
      "Industry-specific templates",
    ],
  },
  "expert-writers": {
    icon: "✍️",
    title: "Expert Writers",
    description:
      "Premium content creation with vetted industry experts who understand your market and can articulate your vision with authority.",
    features: [
      "Vetted industry expert network",
      "Custom content strategy development",
      "Thought leadership positioning",
      "Technical content creation",
      "Brand storytelling and messaging",
      "Editorial review and optimization",
    ],
  },
};

export default function FeatureModal({
  feature,
  onClose,
  onStartDemo,
}: FeatureModalProps) {
  if (!feature || !featureDetails[feature]) return null;

  const details = featureDetails[feature];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-10 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-6 right-8 text-3xl text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          ×
        </button>

        <div className="text-center mb-8">
          <span className="text-7xl block mb-5">{details.icon}</span>
          <h2 className="text-4xl font-bold text-gray-900">{details.title}</h2>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {details.description}
        </p>

        <h4 className="text-xl font-semibold mb-4 text-gray-900">
          Key Features:
        </h4>
        <ul className="space-y-3 mb-8">
          {details.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 font-bold mr-3 mt-1">✓</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <button
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => {
              onClose();
              onStartDemo();
            }}
          >
            See {details.title} in Alex Demo
          </button>
        </div>
      </div>
    </div>
  );
}
