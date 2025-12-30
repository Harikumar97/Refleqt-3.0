"use client";

import { useState } from "react";
import OnboardingModal from "@/components/landing/OnboardingModal";
import LoginModal from "@/components/landing/LoginModal";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");

  const handleOnboardingComplete = (userData: any) => {
    // Store user data and redirect to portal
    localStorage.setItem(
      "refleqt_user_data",
      JSON.stringify({
        ...userData,
        onboardedAt: new Date().toISOString(),
      })
    );
    setShowOnboarding(false);
    router.push("/portal");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production, this would send to backend/n8n
      console.log("Early access email:", email);
      alert("Thank you! We'll notify you when we launch.");
      setEmail("");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/98 backdrop-blur-lg z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Refleqt
          </div>
          <nav className="flex gap-8 items-center">
            <a
              href="#features"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              Contact
            </a>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Try Demo
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 pt-20 px-8 relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full -top-64 -right-64" />

        <div className="max-w-4xl text-center relative z-10">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Stop Drowning in Data.
            <br />
            Start Obsessing Smart.
          </h1>
          <p className="text-xl text-white/90 mb-10">
            The only Business Intelligence platform that thinks like a founder,
            obsesses like a strategist, and executes like a growth team.
          </p>

          <div className="flex gap-5 justify-center mb-10">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              🚀 Get Started Now
            </button>
            <a
              href="#features"
              className="bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold border-2 border-white hover:bg-white/30 transition-all"
            >
              Explore Features
            </a>
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="flex gap-3 max-w-lg mx-auto bg-white/15 p-2 rounded-full backdrop-blur-lg"
          >
            <input
              type="email"
              className="flex-1 bg-transparent border-none px-5 py-3 text-white placeholder-white/70 focus:outline-none"
              placeholder="Enter email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Get Access
            </button>
          </form>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="py-24 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Built for Modern Founders
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to make data-driven decisions, faster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📡</div>
              <h3 className="text-xl font-bold mb-3">Intelligence Feed</h3>
              <p className="text-gray-600">
                Real-time competitive intelligence from RSS, social media, news,
                and web sources. Stay ahead of your competitors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-xl font-bold mb-3">Research Swarms</h3>
              <p className="text-gray-600">
                AI-powered multi-agent research that thinks like your team. Deep
                dive into any market question in minutes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Strategy Cohorts</h3>
              <p className="text-gray-600">
                Deep competitive analysis and psychographic segmentation to
                understand your market at a molecular level.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3">Smart Trackers</h3>
              <p className="text-gray-600">
                Automated monitoring of competitors, trends, and market
                movements. Get alerts when things change.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">✍️</div>
              <h3 className="text-xl font-bold mb-3">Expert Writers</h3>
              <p className="text-gray-600">
                Connect your insights to human content creators. Turn
                intelligence into compelling marketing campaigns.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Insight Brewery</h3>
              <p className="text-gray-600">
                Synthesize raw data into actionable insights. AI-powered
                analysis that connects the dots for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start free. Scale as you grow. Enterprise ready.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">For early-stage founders</p>
              <div className="text-4xl font-bold mb-6">Free</div>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ 10 intelligence sources</li>
                <li>✓ 5 research swarms/month</li>
                <li>✓ Basic insights</li>
              </ul>
            </div>

            <div className="p-8 border-2 border-indigo-600 rounded-2xl bg-indigo-50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Growth</h3>
              <p className="text-gray-600 mb-4">For growing teams</p>
              <div className="text-4xl font-bold mb-6">
                $99<span className="text-lg">/mo</span>
              </div>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Unlimited sources</li>
                <li>✓ Unlimited research swarms</li>
                <li>✓ Advanced psychographics</li>
                <li>✓ Expert writer network</li>
              </ul>
            </div>

            <div className="p-8 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">For scale-ups</p>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Everything in Growth</li>
                <li>✓ Dedicated support</li>
                <li>✓ Custom integrations</li>
                <li>✓ API access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Refleqt
          </div>
          <p className="text-gray-400 mb-8">
            Stop drowning in data. Start obsessing smart.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@refleqt.io"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-sm text-gray-600">
            © 2025 Refleqt. Built with safety-critical Next.js | Power of Ten
            compliance
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
