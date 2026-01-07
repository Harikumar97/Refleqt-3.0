import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-700">
            Refleqt
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-700 hover:text-purple-700 transition">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-purple-700 transition">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-purple-700 transition">
              About
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-purple-700 transition">
              Contact
            </Link>
            <Link
              href="/portal"
              className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Drowning in Data.
            <br />
            <span className="text-white/90">Start Obsessing Smart.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
            The only Business Intelligence platform that thinks like a founder,
            obsesses like a strategist, and executes like a growth team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              <span>🚀</span>
              Get Started Now
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-white/50 text-white rounded-full font-semibold hover:bg-white/10 transition"
            >
              Explore Features
            </Link>
          </div>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <form className="flex gap-2 bg-white/20 backdrop-blur-sm p-2 rounded-full">
              <input
                type="email"
                placeholder="Enter email for early access"
                className="flex-1 px-6 py-3 bg-transparent text-white placeholder-white/60 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Get Access
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Powered by AI, Built for Growth
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Leverage cutting-edge AI to transform your business intelligence workflow
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Research Swarm</h3>
              <p className="text-gray-600">
                Deploy AI agents that work together to research any topic with comprehensive,
                multi-perspective analysis.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligence Metrics</h3>
              <p className="text-gray-600">
                Track and visualize your business metrics with AI-powered insights
                and actionable recommendations.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Provider LLM</h3>
              <p className="text-gray-600">
                Seamlessly switch between Claude, GPT, and Gemini to get the best
                results for each task.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business Intelligence?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join the next generation of data-driven founders and strategists.
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-purple-700 rounded-full font-semibold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-white mb-4 md:mb-0">Refleqt</div>
            <div className="flex gap-8 text-gray-400">
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
              <Link href="#" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            © 2024 Refleqt. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
