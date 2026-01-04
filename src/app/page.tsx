"use client";

import { useState } from "react";
import Link from "next/link";
import OnboardingFlow from "@/components/landing/OnboardingFlow";
import FeatureModal from "@/components/landing/FeatureModal";

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleStartDemo = () => {
    setShowOnboarding(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks for your interest! We'll send Alex demo access to ${email}`);
    setEmail("");
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Welcome to The Distillery! Weekly insights will be sent to ${newsletterEmail}`
    );
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 h-[70px]">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Refleqt
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              Contact
            </a>
            <button
              onClick={handleStartDemo}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:-translate-y-0.5 transition-transform"
            >
              Try Demo
            </button>
          </nav>
          <div className="md:hidden flex flex-col gap-1 cursor-pointer">
            <span className="w-6 h-0.5 bg-gray-800 rounded" />
            <span className="w-6 h-0.5 bg-gray-800 rounded" />
            <span className="w-6 h-0.5 bg-gray-800 rounded" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
            Stop Drowning in Data.
            <br />
            Start Obsessing Smart.
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
            The only Business Intelligence platform that thinks like a founder,
            obsesses like a strategist, and executes like a growth team.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
            <button
              onClick={handleStartDemo}
              className="px-9 py-4 bg-white text-purple-700 rounded-full text-lg font-semibold hover:-translate-y-1 transition-transform hover:shadow-2xl"
            >
              🚀 Watch Alex Demo
            </button>
            <a
              href="#features"
              className="px-9 py-4 bg-white/15 backdrop-blur-md border-2 border-white/30 text-white rounded-full text-lg font-semibold hover:-translate-y-1 transition-transform"
            >
              Explore Features
            </a>
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="max-w-md mx-auto flex gap-2 bg-white/15 backdrop-blur-md rounded-full p-2 border border-white/20"
          >
            <input
              type="email"
              className="flex-1 bg-transparent border-none px-5 py-3 text-white placeholder-white/70 outline-none"
              placeholder="Enter email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Get Access
            </button>
          </form>
        </div>
      </section>

      {/* Strategy Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 my-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                🎯 Get Competitive Intelligence in Under 2 Minutes
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Ask any strategic question about your competitors and get
                AI-powered insights with confidence scores, visualizations, and
                actionable recommendations.
              </p>
              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    &lt; 2min
                  </div>
                  <div className="text-sm text-gray-600">Analysis Time</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">10</div>
                  <div className="text-sm text-gray-600">Key Insights</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>
              <Link
                href="/portal"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-transform hover:shadow-lg"
              >
                Try Strategy Cohort
              </Link>
            </div>
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-600 mb-5 italic text-gray-700">
                  "How are Asana and Monday.com positioning their enterprise
                  pricing?"
                </div>
                <div className="space-y-2">
                  <div className="py-2 px-3 bg-green-50 rounded-lg text-sm text-gray-800">
                    💡 Asana pricing 15% premium with automation focus
                  </div>
                  <div className="py-2 px-3 bg-green-50 rounded-lg text-sm text-gray-800">
                    📊 Monday.com targeting larger enterprises
                  </div>
                  <div className="py-2 px-3 bg-green-50 rounded-lg text-sm text-gray-800">
                    🎯 Gap opportunity in mid-market segment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-5 text-gray-900">
            Six Tools, One Obsession: Your Growth
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Every feature designed to turn data into decisions, insights into
            action, and analysis into competitive advantage.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                id: "intelligence-feed",
                icon: "📊",
                title: "Intelligence Feed",
                description:
                  "Live competitive intelligence that updates in real-time. Track what matters, ignore the noise.",
              },
              {
                id: "research-swarms",
                icon: "🔬",
                title: "Research Swarms",
                description:
                  "AI-powered research that thinks like your best analyst. Deep insights in minutes, not weeks.",
              },
              {
                id: "strategy-cohorts",
                icon: "🎯",
                title: "Strategy Cohorts",
                description:
                  "Strategic scenarios that stress-test your decisions. Think 10 moves ahead, every time.",
              },
              {
                id: "psychographics",
                icon: "🧠",
                title: "Psychographics",
                description:
                  "Understand not just what customers do, but why they do it. Psychology-driven insights for growth.",
              },
              {
                id: "brewery",
                icon: "🍺",
                title: "The Brewery",
                description:
                  "Content that converts. AI-powered writing that captures your voice and drives results.",
              },
              {
                id: "expert-writers",
                icon: "✍️",
                title: "Expert Writers",
                description:
                  "Premium content creation with industry experts. Your thoughts, their expertise, perfect execution.",
              },
            ].map((feature) => (
              <div
                key={feature.id}
                onClick={() => setShowFeatureModal(feature.id)}
                className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-2 border-transparent hover:border-cyan-500"
              >
                <span className="text-6xl block mb-5">{feature.icon}</span>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {feature.description}
                </p>
                <span className="text-cyan-500 font-semibold text-sm">
                  Learn more →
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleStartDemo}
              className="px-9 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-lg font-semibold hover:-translate-y-1 transition-transform hover:shadow-xl"
            >
              See How Alex Uses All 6 Tools →
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white text-center">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-black mb-5">🍺 The Distillery</h2>
            <p className="text-xl mb-10 opacity-90">
              Weekly business intelligence insights, competitive analysis, and
              growth strategies. The good stuff, distilled down to what actually
              matters.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                className="flex-1 px-5 py-4 rounded-xl text-gray-900 outline-none"
                placeholder="Enter your email for weekly insights"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-amber-400 text-blue-900 rounded-xl font-bold hover:bg-amber-300 hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showFeatureModal && (
        <FeatureModal
          feature={showFeatureModal}
          onClose={() => setShowFeatureModal(null)}
          onStartDemo={handleStartDemo}
        />
      )}

      {showOnboarding && <OnboardingFlow />}
    </div>
  );
}
