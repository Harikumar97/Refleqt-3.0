"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("demo@refleqt.io");
  const [password, setPassword] = useState("demo1234");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, accept any credentials
    // In production, this would validate against backend
    if (email && password) {
      // Store dummy session
      localStorage.setItem(
        "refleqt_demo_user",
        JSON.stringify({
          email,
          name: "Demo User",
          companyName: "Demo Company",
          loggedInAt: new Date().toISOString(),
        })
      );

      // Redirect to portal
      router.push("/portal");
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-12 max-w-md w-[90%] shadow-2xl animate-slideUp">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
          <p className="text-gray-600">
            Sign in to access your intelligence portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-800 text-sm">
              Email
            </label>
            <input
              type="email"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800 text-sm">
              Password
            </label>
            <input
              type="password"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>Demo Mode:</strong> Pre-filled credentials will take
              you straight to the portal. Any email/password combination works
              for demo purposes.
            </p>
          </div>

          <button
            type="submit"
            className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "🚀 Sign In"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 text-sm underline"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
