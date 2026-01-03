/**
 * LLM Integration Test
 * Tests all LLM providers with real API calls
 */

import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

interface TestResult {
  provider: string;
  status: "success" | "error";
  message: string;
  responseTime?: number;
}

const results: TestResult[] = [];

// ============================================================================
// Test 1: Anthropic Claude
// ============================================================================
async function testClaude(): Promise<TestResult> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];

  if (!apiKey || apiKey === "sk-ant-api03-YOUR-KEY-HERE") {
    return {
      provider: "Anthropic Claude",
      status: "error",
      message: "API key not configured",
    };
  }

  try {
    const startTime = Date.now();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 20,
        messages: [
          {
            role: "user",
            content: "Say 'Claude API working' in 3 words",
          },
        ],
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return {
        provider: "Anthropic Claude",
        status: "error",
        message: `HTTP ${response.status}: ${error}`,
      };
    }

    const data = await response.json();

    return {
      provider: "Anthropic Claude",
      status: "success",
      message: `Response: ${data.content[0].text}`,
      responseTime,
    };
  } catch (error) {
    return {
      provider: "Anthropic Claude",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Test 2: OpenAI GPT
// ============================================================================
async function testOpenAI(): Promise<TestResult> {
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey || apiKey === "sk-proj-YOUR-KEY-HERE") {
    return {
      provider: "OpenAI GPT",
      status: "error",
      message: "API key not configured",
    };
  }

  try {
    const startTime = Date.now();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Say 'GPT API working' in 3 words",
          },
        ],
        max_tokens: 20,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return {
        provider: "OpenAI GPT",
        status: "error",
        message: `HTTP ${response.status}: ${error}`,
      };
    }

    const data = await response.json();

    return {
      provider: "OpenAI GPT",
      status: "success",
      message: `Response: ${data.choices[0].message.content}`,
      responseTime,
    };
  } catch (error) {
    return {
      provider: "OpenAI GPT",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Test 3: Google Gemini
// ============================================================================
async function testGemini(): Promise<TestResult> {
  const apiKey = process.env["GOOGLE_API_KEY"];

  if (!apiKey || apiKey === "AIzaSyXXXXX-YOUR-KEY-HERE") {
    return {
      provider: "Google Gemini",
      status: "error",
      message: "API key not configured",
    };
  }

  try {
    const startTime = Date.now();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Say 'Gemini API working' in 3 words",
                },
              ],
            },
          ],
        }),
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return {
        provider: "Google Gemini",
        status: "error",
        message: `HTTP ${response.status}: ${error}`,
      };
    }

    const data = await response.json();

    return {
      provider: "Google Gemini",
      status: "success",
      message: `Response: ${data.candidates[0].content.parts[0].text}`,
      responseTime,
    };
  } catch (error) {
    return {
      provider: "Google Gemini",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Run All Tests
// ============================================================================
async function runTests() {
  console.log("🧪 Refleqt v3.0 - LLM API Tests");
  console.log("================================\n");

  // Run tests in parallel
  const [claudeResult, openaiResult, geminiResult] = await Promise.all([
    testClaude(),
    testOpenAI(),
    testGemini(),
  ]);

  results.push(claudeResult, openaiResult, geminiResult);

  // Display results
  results.forEach((result) => {
    const icon = result.status === "success" ? "✓" : "✗";
    const color = result.status === "success" ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(`${color}${icon}${reset} ${result.provider}`);
    console.log(`  ${result.message}`);
    if (result.responseTime) {
      console.log(`  Response time: ${result.responseTime}ms`);
    }
    console.log();
  });

  // Summary
  const passed = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;

  console.log("================================");
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log();

  if (failed === 0) {
    console.log("✓ ALL LLM APIs WORKING!");
    process.exit(0);
  } else {
    console.log("⚠ Some APIs failed. Check .env.local configuration.");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
